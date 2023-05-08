var express = require("express");
var router = express.Router();

const readline = require("readline");
const { spawn } = require("child_process");
const fs = require("fs");

console.log("outside dummy");

router.post("/", async (req, res) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("inside dummy");
  const urls = req.body.urls;
  console.log("image urls: " + urls);

  const objectNames = JSON.parse(fs.readFileSync("./js_json/objectNames.json"));
  const receivedData = {};
  const outputFile = "./js_json/data.json";
  const approvedImages = {};
  const deniedImages = {};
  let responseSent = false;
  const url_length = urls.length;
  console.log(url_length);
  // const recieved_url_length = urls.length;
  let recieved_url_length = 0;
  console.log(recieved_url_length);

  for (let i = 0; i < urls.length; i++) {
    console.log(`Processing_URL (${i}): ${urls[i]}`);
    
    const url = urls[i];
    // const length_urlfor = i +1;
  recieved_url_length = i +1;

    const pythonProcess = spawn("python", ["./urlimg.py", url]);

    pythonProcess.stdout.on("data", (row) => {
      const rowData = row.toString().trim().split("\r\n");
      const subarrays = rowData.map((item) => {
        const keyValue = item.split(":");
        return [keyValue[0].trim(), keyValue[1].trim()];
      });
      receivedData[url] = subarrays;
      console.log(`Received data (${url}): ${subarrays}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      processNextUrl(receivedData, outputFile, processNextUrlCallback);
    });
  }

  function processNextUrl(receivedData, outputFile, callback) {
    const processedUrls = Object.keys(receivedData);

    if (processedUrls.length === urls.length) {
      fs.writeFile(outputFile, JSON.stringify(receivedData), (err) => {
        if (err) throw err;
        console.log(`Data saved to ${outputFile}`);

        fs.readFile(outputFile, (err, data) => {
          if (err) throw err;

          const receivedData = JSON.parse(data);

          for (const url of processedUrls) {
            const imagePredictions = receivedData[url];
            let isApproved = true;
            const animalNames = [];

            for (const prediction of imagePredictions) {
              const animalName = prediction[0];
              const confidenceScore = parseFloat(prediction[1]);

              if (objectNames.includes(animalName) || confidenceScore < 0.5) {
                isApproved = false;
                break;
              }
              animalNames.push(animalName);
            }

            if (isApproved && animalNames.length > 0) {
              approvedImages[url] = animalNames.map((name) => [
                name,
                imagePredictions.find((pred) => pred[0] === name)[1],
              ]);
            } else {
              deniedImages[url] = imagePredictions;
            }
          }

          
          // Pass the approvedImages and deniedImages to the callback function
          callback(approvedImages, deniedImages);
        });
      });
    }
  }
  
  // Callback function to handle the response sending logic
  function processNextUrlCallback(approvedImages, deniedImages) {
    // Combine the approvedImages and deniedImages into a single result object
    
    if (url_length === recieved_url_length && !responseSent) {
      const result = {
        approvedImages,
        deniedImages
      };
      console.log("Approved images:", approvedImages);
      console.log("Denied images:", deniedImages); 
      console.log("Result:", JSON.stringify(result, null, 2));
      res.send(result); // Send the response
      responseSent = true; // 
    }
  }
});

module.exports = router;
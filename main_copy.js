var express = require("express");
var router = express.Router();

const readline = require("readline");
const { spawn } = require("child_process");
const fs = require("fs");
const { URL } = require('url');
const { url } = require("inspector");

router.post("/", async (req, res) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("inside dummy");
  // const urls = req.body.urls ? req.body.urls.split(',') : [];
  const urls = req.body.urls;
// try {
//   const parsedUrl = new URL(encodedUrl);
//   if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
//     throw new Error('Invalid URL protocol');
//   }
//   // continue with processing the URL...
// } catch (err) {
//   console.error('Invalid URL:', err.message);
//   return res.status(400).json({ message: 'Invalid URL' });
// }
  // const urls = req.body.urls || [];
  console.log("image urls: " + urls);
  //checking urls is in array format or not
  urls.forEach( (value) => {
    console.log("This is the url: "+value);
    
  });
  
  // Read object names from JSON file and store in array
  const objectNames = JSON.parse(fs.readFileSync("./js_json/objectNames.json"));

  const receivedData = [];
  const outputFile = "./js_json/data.json";
  processNextUrl(receivedData, outputFile);

  // Define function to process the next URL in the array
  function processNextUrl(receivedData, outputFile) {
    // If there are no more URLs to process, write the received data to a JSON file and exit the program
    if (urls.length === 0) {
      fs.writeFile(outputFile, JSON.stringify(receivedData), (err) => {
        if (err) throw err;
        console.log(`Data saved to ${outputFile}`);

        // Read the saved JSON file and filter the data to separate approved and denied images
        fs.readFile("./js_json/data.json", (err, data) => {
          if (err) throw err;

          const receivedData = JSON.parse(data);
          const approvedImages = [];
          const deniedImages = [];

          for (const imagePredictions of receivedData) {
            let isApproved = true;
            const animalNames = [];

            for (const prediction of imagePredictions) {
              const animalName = prediction[0];
              const confidenceScore = parseFloat(prediction[1]);

              // Ignore images containing a person or with low confidence score
              if (objectNames.includes(animalName) || confidenceScore < 0.5) {
                isApproved = false;
                break;
              }
              animalNames.push(animalName);
            }

            // If image is approved, push the animal names and confidence scores to approvedImages array
            if (isApproved && animalNames.length > 0) {
              approvedImages.push(
                animalNames.map((name) => [
                  name,
                  imagePredictions.find((pred) => pred[0] === name)[1],
                ])
              );

              // If image is denied, push the original image predictions to deniedImages array
            } else {
              deniedImages.push(imagePredictions);
            }
          }

          // Print the approved and denied images
          console.log("Approved images:", approvedImages);
          console.log("Denied images:", deniedImages);
          rl.close();
        });
      });
      return;
    }

    // If there are still URLs to process, shift the next URL from the array and process it
    // const url = urls.shift();
    // console.log(url);
    // const cleanedUrl = url.replace(/\[|\]/g, '');
    // console.log(cleanedUrl);

    console.log("Type of url:", typeof value);
    console.log(`Processing URL: ${value}`);

    // Spawn a child process to run the Python script and capture its output
    const pythonProcess = spawn("python", ["./urlimg.py", value]);

    console.log("going in");
    // Process stdout from the Python script, which contains the image predictions
    pythonProcess.stdout.on("data", (row) => {
      console.log("i am excecuting python: stdout");
      const rowData = row.toString().trim().split("\r\n");
      const subarrays = rowData.map((item) => {
        const keyValue = item.split(":");
        return [keyValue[0].trim(), keyValue[1].trim()];
      });
      receivedData.push(subarrays);
      console.log(`Received data: ${subarrays}`);
    });
    
    

    // Process stderr from the Python script, which contains any errors
    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    // When the child process exits, process the next URL in the array
    pythonProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      processNextUrl(receivedData, outputFile);
    });
  }
});
module.exports = router;

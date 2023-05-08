// var express = require("express");
// var router = express.Router();

// const readline = require("readline");
// const { spawn } = require("child_process");
// const fs = require("fs");

// console.log("outside dummy");

// router.post("/", async (req, res) => {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   console.log("inside dummy");
//   const urls = req.body.urls;
//   // var urls = ["https://img.theweek.in/content/dam/week/news/sci-tech/images/2022/4/5/macaw-bird.jpg"];
// //   var urls = ["https://petconnect.sgp1.digitaloceanspaces.com/development/advt_images/92e8520f-1b68-4261-8023-8a9c5a3b9f91-CompressJPEG.online_512x512_image.jpeg",];
//   console.log("image urls: " + urls);

//   const objectNames = JSON.parse(fs.readFileSync("./js_json/objectNames.json"));
//   const receivedData = [];
//   const outputFile = "./js_json/data.json";

//   // urls.forEach((value) => {
//     for (let i = 0; i < urls.length; i++) {
//     // console.log("This is the url: "+value);
//     // console.log("Type of url:", typeof urls);
//     console.log(`Processing_URL (${i}: ${urls[i]}`);

//     const url = urls[i];
//     // const cleanedUrl = url.replace(/\[|\]/g, '');

//     const pythonProcess = spawn("python", ["./urlimg.py", url]);

//     // Process stdout from the Python script, which contains the image predictions
//     pythonProcess.stdout.on("data", (row) => {
//       // console.log("i am excecuting python: stdout");
//       const rowData = row.toString().trim().split("\r\n");
//       const subarrays = rowData.map((item) => {
//         const keyValue = item.split(":");
//         return [keyValue[0].trim(), keyValue[1].trim()];
//       });
//       receivedData.push(subarrays);
//       console.log(`Received data (${i}): ${subarrays}`);
//     });

//     // Process stderr from the Python script, which contains any errors
//     pythonProcess.stderr.on("data", (data) => {
//       console.error(`stderr: ${data}`);
//     });

//     pythonProcess.on("close", (code) => {
//       console.log(`child process exited with code ${code}`);
//       processNextUrl(receivedData, outputFile);
//     });
//   }
//   // });

//   function processNextUrl(receivedData, outputFile) {
//     // if (urls.length === 0) {
//       fs.writeFile(outputFile, JSON.stringify(receivedData), (err) => {
//         if (err) throw err;
//         console.log(`Data saved to ${outputFile}`);

//         // Read the saved JSON file and filter the data to separate approved and denied images
//         fs.readFile("./js_json/data.json", (err, data) => {
//           if (err) throw err;

//           const receivedData = JSON.parse(data);
//           const approvedImages = [];
//           const deniedImages = [];

//           for (const imagePredictions of receivedData) {
//             let isApproved = true;
//             const animalNames = [];

//             for (const prediction of imagePredictions) {
//               const animalName = prediction[0];
//               const confidenceScore = parseFloat(prediction[1]);

//               // Ignore images containing a person or with low confidence score
//               if (objectNames.includes(animalName) || confidenceScore < 0.5) {
//                 isApproved = false;
//                 break;
//               }
//               animalNames.push(animalName);
//             }

//             // If image is approved, push the animal names and confidence scores to approvedImages array
//             if (isApproved && animalNames.length > 0) {
//               approvedImages.push(
//                 animalNames.map((name) => [
//                   name,
//                   imagePredictions.find((pred) => pred[0] === name)[1],
//                 ])
//               );

//               // If image is denied, push the original image predictions to deniedImages array
//             } else {
//               deniedImages.push(imagePredictions);
//             }
//           }

//           // Print the approved and denied images
//           console.log("Approved images:", approvedImages);
//           console.log("Denied images:", deniedImages);
//           rl.close();
//         });
//       });
//       return;
//   }
// });
// module.exports = router;


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

  for (let i = 0; i < urls.length; i++) {
    console.log(`Processing_URL (${i}): ${urls[i]}`);

    const url = urls[i];

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

          console.log("Approved images:", approvedImages);
          console.log("Denied images:", deniedImages); 

          // Pass the approvedImages and deniedImages to the callback function
          callback(approvedImages, deniedImages);
        });
      });
    }
  }

  // Callback function to handle the response sending logic
  function processNextUrlCallback(approvedImages, deniedImages) {
    // Combine the approvedImages and deniedImages into a single result object
    const result = {
      approvedImages,
      deniedImages
    };

    console.log("Result:", JSON.stringify(result, null, 2));

    // if (receivedData.length === urls.length && !responseSent) {
    //   res.send(result); // Send the response
    //   responseSent = true; // 
    res.send(result); // Send the response
    
  }
});

module.exports = router;

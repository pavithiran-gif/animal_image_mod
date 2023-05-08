var express = require("express");
var router = express.Router();

const { spawn } = require("child_process");
const fs = require("fs");


  const objectNames = JSON.parse(fs.readFileSync("./js_json/objectNames.json"));
  const receivedData = [];
  const outputFile = "./js_json/data.json";


router.post('/', (req, res) => {
    console.log("Inside POST!");
    const urls = req.body.urls;
    // const urls = [
    //     '["https://petconnect.sgp1.digitaloceanspaces.com/development/advt_images/92e8520f-1b68-4261-8023-8a9c5a3b9f91-CompressJPEG.online_512x512_image.jpeg"]',
    //     '["https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg"]'       
    //   ]
    console.log(urls);
    console.log(urls.length);
    const url = urls[0];
    console.log(url);
    console.log("Type of url:", typeof urls);

    // for (let i =0; i < urls.length; i++){
    //     console.log("Url " + i + ":" + urls[i]);
    //     // const current_url = urls[i];
    //     console.log(typeof urls);
    //     console.log(urls[0]);
    // }

    // urls.forEach((link) => {
    //    console.log(link);
    //    const pythonProcess = spawn("python", ["./urlimg.py", link]);

    //    pythonProcess.stdout.on("data", (row) => {
    //     console.log("i am excecuting python: stdout");
    //     const rowData = row.toString().trim().split("\r\n");
    //     const subarrays = rowData.map((item) => {
    //       const keyValue = item.split(":");
    //       return [keyValue[0].trim(), keyValue[1].trim()];
    //     });
    //     receivedData.push(subarrays);
    //     console.log(`Received data: ${subarrays}`);

    //     pythonProcess.stderr.on("data", (data) => {
    //         console.error(`stderr: ${data}`);
    //       });

    //   });


    // });

});
module.exports = router;
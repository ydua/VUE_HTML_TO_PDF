const dotenv = require("dotenv");
const AWS = require("aws-sdk");
var fs = require('fs');
var path = require('path');
dotenv.config();

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

function uploadToS3(bucketName, keyPrefix, filePath) {
    console.log("AWS_ACCESS_KEY" + AWS_ACCESS_KEY);
    console.log("AWS_SECRET_ACCESS_KEY" + AWS_SECRET_ACCESS_KEY);
    console.log("bucketName" + bucketName);
    console.log("keyPrefix" + keyPrefix);
    console.log("filePath" + filePath);
    console.log("s3.accessKeyId" + s3.accessKeyId);
    console.log("s3.secretAccessKey" + s3.secretAccessKey);

    // ex: /path/to/my-picture.png becomes my-picture.png
    var fileName = path.basename(filePath);
    var fileStream = fs.createReadStream(filePath);

    // If you want to save to "my-bucket/{prefix}/{filename}"
    //                    ex: "my-bucket/my-pictures-folder/my-picture.png"
    var keyName = path.join(keyPrefix, fileName);

    // We wrap this in a promise so that we can handle a fileStream error
    // since it can happen *before* s3 actually reads the first 'data' event
    return new Promise(function(resolve, reject) {
        fileStream.once('error', reject);
        s3.upload(
            {
                Bucket: bucketName,
                Key: keyName,
                Body: fileStream
            }
        ).promise().then(resolve, reject);
    });
}

module.exports={
    uploadToS3
}
const Record = require("../model/Record");

async function addS3Url(id, s3Url) {
    try {
        const record = {
            s3Url: s3Url
        }
        const dbrecord = await Record.findByIdAndUpdate({
            _id: id
        }, record);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    addS3Url
}
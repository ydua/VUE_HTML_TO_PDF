const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    s3Url: String,
    createdAt:Date,
    deletedAt:Date,
    updatedAt:Date
});

module.exports = mongoose.model("Record",recordSchema);
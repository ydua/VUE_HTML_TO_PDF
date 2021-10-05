const Record = require("../model/Record");
const Queue = require("../services/queueService");

//Get All Record
const getAllRecords = async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (error) {
        res.json({ message: error });
    }
}

//Get
const getRecordDetails = async (req, res) => {
    try {
        const record = await Record.findById(req.params.recordId);
        res.json(record);
    } catch (error) {
        res.json({ message: error });
    }
}

//Add New Record
const createRecord = async (req, res) => {
    var htmlTemplate = req.body?.htmlTemplate ?? "";
    var jsonData = req.body.jsonData ?? "";

    try {
        const record = new Record({
            s3Url: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            DeletedAt: null
        });
        const dbRecord = await record.save();
        await Queue.sendDataToQueue(htmlTemplate, jsonData, dbRecord._id);
        res.send(dbRecord);
    } catch (error) {
        res.status(400).send({ message: error });
    }
}

//Update Record
const updateRecord = async (req, res) => {
    try {
        const record = {
            s3Url: req.body.s3Url
        }
        console.log(record);
        const dbrecord = await Record.findByIdAndUpdate({
            _id: req.params.recordId
        }, record);
        res.json(dbrecord);
    } catch (error) {
        res.json({ message: error });
    }
}

//Delete Record
const deteleRecord = async (req, res) => {
    try {
        const record = await Record.findByIdAndDelete(req.params.recordId);
        res.status(200).json({ message: "Deleted" });
    } catch (error) {
        res.json({ message: error });
    }
}

module.exports = {
    getAllRecords,
    getRecordDetails,
    createRecord,
    updateRecord,
    deteleRecord
}
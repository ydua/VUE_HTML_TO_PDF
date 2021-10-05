const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const schedule = require("node-schedule");

const queue = require("./services/queueService");

dotenv.config();

//connect to db
mongoose.connect(

    process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true },
    () => console.log("Connected to DB")
);

//import routes
const recordRoutes = require("./routes/record");

//Middleware
app.use(express.json());
app.use(cors());

//route Middlewares
app.use("/api/Records", recordRoutes);

app.listen(4000, () => console.log("Server Started at Port No: 4000"));

schedule.scheduleJob("*/15 * * * * *", () => queue.receiveDataFromQueue());

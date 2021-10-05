const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");
// const { QueueClient, QueueServiceClient } = require("@azure/storage-queue");
const dotenv = require("dotenv");
const htmlToPdf = require("./htmlToPdfService");
const path = require('path');
const awsService = require('./awsService');
const recordService = require("./recordService");
const fs = require('fs');
dotenv.config();

// connection string to your Service Bus namespace
const connectionString = process.env.Queue_ConnectionString

// name of the queue
const queueName = process.env.Queue_Name

async function sendDataToQueue(htmlTemplate, jsonData, token) {
    const messages = [
        {
            body: { "htmlTemplate": htmlTemplate, "jsonData": jsonData, "token": token },
            contentType: "application/json"
        }
    ];

    // create a Service Bus client using the connection string to the Service Bus namespace
    const sbClient = new ServiceBusClient(connectionString);

    // createSender() can also be used to create a sender for a topic.
    const sender = sbClient.createSender(queueName);

    try {
        // Tries to send all messages in a single batch.
        // Will fail if the messages cannot fit in a batch.
        // await sender.sendMessages(messages);

        // create a batch object
        let batch = await sender.createMessageBatch();
        for (let i = 0; i < messages.length; i++) {
            // for each message in the array			

            // try to add the message to the batch
            if (!batch.tryAddMessage(messages[i])) {
                // if it fails to add the message to the current batch
                // send the current batch as it is full
                await sender.sendMessages(batch);

                // then, create a new batch 
                batch = await sender.createMessageBatch();

                // now, add the message failed to be added to the previous batch to this batch
                if (!batch.tryAddMessage(messages[i])) {
                    // if it still can't be added to the batch, the message is probably too big to fit in a batch
                    throw new Error("Message too big to fit in a batch");
                }
            }
        }

        // Send the last created batch of messages to the queue
        await sender.sendMessages(batch);

        console.log(`Sent a batch of messages to the queue: ${queueName}`);

        // Close the sender
        await sender.close();
    } finally {
        await sbClient.close();
    }
}

async function receiveDataFromQueue() {
    // create a Service Bus client using the connection string to the Service Bus namespace
    const sbClient = new ServiceBusClient(connectionString);

    // createReceiver() can also be used to create a receiver for a subscription.
    const receiver = sbClient.createReceiver(queueName);

    // function to handle messages
    const myMessageHandler = async (messageReceived) => {
        await processQueueMessage(messageReceived);
    };

    console.log("received m");
    // function to handle any errors
    const myErrorHandler = async (error) => {
        console.log(error);
    };
    console.log("received m1");


    // for (let c = 0; c < 5; c++) {
    // subscribe and specify the message and error handlers
    receiver.subscribe({
        processMessage: myMessageHandler,
        processError: myErrorHandler
    });

    console.log("received m2");
    // Waiting long enough before closing the sender to send messages
    // }
    await delay(20000);
    await receiver.close();
    await sbClient.close();
}


async function processQueueMessage(messageReceived) {
    let token = messageReceived.body.token;
    let htmlFilePath = path.resolve(`./reportCard-out/reportCard_${token}.html`);
    let pdfFilePath = path.resolve(`./reportCard-out-pdf/reportCard_${token}.pdf`);
    await htmlToPdf.generateHtml(htmlFilePath, messageReceived.body.htmlTemplate, messageReceived.body.jsonData);
    await htmlToPdf.createPdf(htmlFilePath, pdfFilePath);

    let bucketname = process.env.BucketName;
    console.log("Bucket NAme :" + bucketname);
    awsService.uploadToS3(bucketname, "", pdfFilePath).then(function (result) {
        console.log("result" + result);
        console.log(result);
        console.log("Uploaded to s3:", result.Location);
        if (result.Location != "" && result.Location != undefined) {
            recordService.addS3Url(token, result.Location);
        }
    }).catch(function (err) {
        console.error("something bad happened:", err.toString());
    });

    // await fs.unlinkSync(htmlFilePath);
    // await fs.unlinkSync(pdfFilePath);

    console.log(`Received message: ${messageReceived.body.htmlTemplate} ${messageReceived.body.jsonData.firstName}`);
}


// async function receiveDataFromQueue1() {
//     const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);

//     // Get a QueueClient which will be used
//     // to create and manipulate a queue
//     const queueClient = queueServiceClient.getQueueClient(queueName);

//     // Create the queue
//     await queueClient.create();
//     // Peek at messages in the queue
//     const peekedMessages = await queueClient.peekMessages({ numberOfMessages: 5 });

//     for (i = 0; i < peekedMessages.peekedMessageItems.length; i++) {
//         // Display the peeked message
//         console.log("Peeked message: ", peekedMessages.peekedMessageItems[i].messageText);
//     }
// }





// for (var i = 0; i < 10; i++) {
//     sendDataToQueue("myHTML", "myJson", "id" + i).catch((err) => {
//         console.log("Error occurred: ", err);
//         process.exit(1);
//     });
// }

// receiveDataFromQueue().catch((err) => {
//     console.log("Error occurred: ", err);
//     process.exit(1);
// });

module.exports = {
    sendDataToQueue,
    receiveDataFromQueue
}
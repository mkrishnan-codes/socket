// Importing the required modules
const WebSocketServer = require('ws');
const PORT = 1001;
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: PORT })
const DEFAULT_INTERVAL = 2000;
// Creating connection using websocket


const fs = require('fs/promises');
let jsonData = [];
async function readData() {
    try {
        const data = await fs.readFile('./json/data.json', { encoding: 'utf8' });
        jsonData = JSON.parse(data);
    } catch (err) {
        console.log(err, "error reading data");
    }
}
readData();



wss.on("connection", ws => {
    console.log("new client connected");
    let interval;
    const send = (msg) => {
        msg = JSON.stringify(msg);
        ws.send(msg);
    }
    const startSendingMessage = (delay) => {
        console.log(`Start pushing at intervals of ${delay} ms`);
        let current = 0;
        interval = setInterval(() => {
            send({ time: new Date(), message:jsonData[current] })
            current = current == jsonData.length - 1 ? 0 : current + 1
        }, delay);
    }

    const stopSendingMessage = () => {
        console.log(`Stop pushing at intervals`);
        clearInterval(interval);
    }
    // sending message
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`);
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (error) {
            console.log(error, "error in parse")
        }
        if (parsedData) {
            if (parsedData.data == "subscribe") {
                console.log("client subscribed **");
                startSendingMessage(parsedData.interval || DEFAULT_INTERVAL)
            }
            if (parsedData.data == "unsubscribe") {
                console.log("client unsubscribed");
                stopSendingMessage();
            }
        }
    });

    ws.on("close", () => {
        console.log("the client has closed");
        stopSendingMessage();
    });

    ws.onerror = function () {
        console.log("Some Error occurred");
        stopSendingMessage();
    }

});
console.log(`The WebSocket server is running on port ${PORT}`);
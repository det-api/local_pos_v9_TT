import express, { NextFunction, Request, Response } from "express";
import config from "config";
import cors from "cors";
import fileUpload from "express-fileupload";
import userRoute from "./router/user.routes";
import permitRoute from "./router/permit.routes";
import roleRoute from "./router/role.routes";
import detailSaleRoute from "./router/detailSale.routes";
import localToDeviceRoute from "./router/localToDevice.routes";
import coustomerRoute from "./router/coustomer.routes";
import deviceRoute from "./router/device.routes";
import dailyReportRoute from "./router/dailyReport.routes";
import fuelBalanceRoute from "./router/fuelBalance.routes";
import fuelInRoute from "./router/fuelIn.routes";
import { liveDataChangeHandler } from "./connection/liveTimeData";
import { detailSaleUpdateByDevice } from "./service/detailSale.service";
import dailyPriceRoute from "./router/dailyPrice.routes";
import dbConnect, { client, connect } from "./utils/connect";
import blinkLed, { lowLed } from "./connection/ledBlink";
import initialSetupRoute from "./router/initialSetup.routes";
import { rp } from "./migrations/migrator";
import moment from "moment-timezone";
import path from "path";
import tankDataRoute from "./router/tankData.routes";
const fs = require("fs");

const app = express();
app.use(fileUpload());
app.use(cors({ origin: "*" }));

const server = require("http").createServer(app);

client.on("connect", connect);

client.on("message", async (topic, message) => {
  let data = topic.split("/");

  if (data[1] == "local_server") {
    /// file write
    if (data[2] != "price" && data[2] != "preset" && data[2] != "whreq") {
      const currentDate = moment().tz("Asia/Yangon").format("YYYY-MM-DD");
      const options = { timeZone: "Asia/Yangon", hour12: false };

      let currentDateTime = new Date().toLocaleTimeString("en-US", options);

      const [hour, minute, second] = currentDateTime.split(":").map(Number);

      if (hour == 24) {
        currentDateTime = `00:${minute}:${second}`;
      }

      let iso: Date = new Date(`${currentDate}T${currentDateTime}.000Z`);
      // let filePath = "logs/log.txt";
      const filePath = path.join(__dirname, "logs");
      const logFilePath = path.join(filePath, "log.txt");

      let logData = "permit ->" + message.toString() + `(${iso})` + "\n";

      fs.appendFile(logFilePath, logData, (err) => {
        if (err) {
          console.error("Error appending to file:", err);
        } else {
          console.log("Text appended to the file.");
        }
      });
    }
  }

  if (data[2] == "active") {
    //d blinkLed(Number(data[3]));
  }

  if (data[2] == "Final") {
    detailSaleUpdateByDevice(data[3], message.toString());
    /// file write
    const currentDate = moment().tz("Asia/Yangon").format("YYYY-MM-DD");
    const options = { timeZone: "Asia/Yangon", hour12: false };

    let currentDateTime = new Date().toLocaleTimeString("en-US", options);

    const [hour, minute, second] = currentDateTime.split(":").map(Number);

    if (hour == 24) {
      currentDateTime = `00:${minute}:${second}`;
    }

    let iso: Date = new Date(`${currentDate}T${currentDateTime}.000Z`);

    const filePath = path.join(__dirname, "logs");
    const logFilePath = path.join(filePath, "log.txt");
    let logData = "final ->" + message.toString() + `(${iso})` + "\n";

    fs.appendFile(logFilePath, logData, (err) => {
      if (err) {
        console.error("Error appending to file:", err);
      } else {
        console.log("Text appended to the file.");
      }
    });
  }

  if (data[2] == "livedata") {
    liveDataChangeHandler(message.toString());
  }

  //   if (topic == "detpos/local_server/price") {
  //   }
});

// socket

// const io = require("socket.io-client");

// let socket = io.connect("cloud socket url");

// socket.on("connect", () => {

//   // Send data to the Raspberry Pi server
//   socket.emit("test", "Hello from local");

//   // Receive data from the Raspberry Pi server
//   socket.on("test", (data) => {
//   });
// });

// socket.on("disconnect", () => {
// });

const port = config.get<number>("port");
const host = config.get<string>("host");

// //mongodb connection

dbConnect();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("ok");
});

app.use("/api/user", userRoute);
app.use("/api/permit", permitRoute);
app.use("/api/role", roleRoute);

app.use("/api/detail-sale", detailSaleRoute);

app.use("/api/device-connection", localToDeviceRoute);
app.use("/api/device", deviceRoute);

app.use("/api/daily-report", dailyReportRoute);
app.use("/api/fuel-balance", fuelBalanceRoute);
app.use("/api/fuelIn", fuelInRoute);

app.use("/api/daily-price", dailyPriceRoute);

app.use("/api/tank-data", tankDataRoute);

// app.use("/api/test", localToDeviceRoute);

// app.use("/api/customer", coustomerRoute);
// app.use("/api/debt", debtRoute);
// app.use("/api/initial-setup", initialSetupRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || 409;
  res.status(err.status).json({
    con: false,
    msg: err.message,
  });
});

const defaultData = async () => {
  // lowLed();

  await rp();
};

defaultData();

server.listen(port, () =>
  console.log(`server is running in  http://${host}:${port}`)
);

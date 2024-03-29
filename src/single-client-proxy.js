/**
 * @description This file serves as the client to send out events to the proxy server
 * @link https://stackoverflow.com/questions/35054868/sending-socket-data-separately-in-node-js -- since this is a TCP stream hence we have to separate out the stuff.
 */
const argv = require("argh").argv;
const net = require("net");
const { v4: uuidv4 } = require("uuid");

const givePayloadSkeleton = (op, key, val = null) => {
  return {
    task: op,
    data: [
      {
        command: {
          key: key,
          value: val,
        },
      },
    ],
  };
};
const generatePayload = (op, len) => {
  const payloads = [];
  for (let i = 1; i <= len; i++) {
    payloads.push(givePayloadSkeleton(op, "key_" + i, i + ""));
  }

  return payloads;
};

let nums = +argv.nums || 1000;
const setEvents = generatePayload("SET", nums);
const getEvents = generatePayload("GET", nums);

var netSocket = net.createConnection({ port: 6767 }, () => {
  console.log("connected to server at port", 6767);
});

let setFlag = argv.set;
let getFlag = argv.get;
console.log("setFlag: ", setFlag);
console.log("getFlag: ", getFlag);

if (setFlag === true) {
  for (const event of setEvents) {
    netSocket.write(`${uuidv4()}|` + JSON.stringify(event) + "\n");
  }
}

if (getFlag === true) {
  for (const event of getEvents) {
    netSocket.write(`${uuidv4()}|` + JSON.stringify(event) + "\n");
  }
}

netSocket.on("data", (buffer) => {
  const data = buffer.toString("utf8");
  console.log(data);
});

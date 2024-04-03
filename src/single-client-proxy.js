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

const total_queries = nums + (getFlag & setFlag) * nums;

const benchmarks = {
  start: {},
  end: {},
};

process.on("SIGINT", () => {
  require("fs").writeFileSync(
    `./benchmarks/${new Date(Date.now())}-sigint.json`,
    JSON.stringify(benchmarks),
    "utf-8"
  );
  netSocket.destroy();
  process.exit(0);
});

if (setFlag === true) {
  for (const event of setEvents) {
    const queryId = uuidv4();
    benchmarks.start[queryId] = {
      type: "SET",
      start: performance.now(),
    };
    netSocket.write(`${queryId}|` + JSON.stringify(event) + "\n");
  }
}

if (getFlag === true) {
  for (const event of getEvents) {
    const queryId = uuidv4();
    benchmarks.start[queryId] = {
      type: "GET",
      start: performance.now(),
    };
    netSocket.write(`${queryId}|` + JSON.stringify(event) + "\n");
  }
}

netSocket.on("data", (buffer) => {
  const t = performance.now();
  const data = buffer.toString("utf8");
  console.log("data in the start: ", data);
  // require("fs").writeFileSync(`./data/data-${Date.now()}.txt`, data, "utf-8");
  data
    .split("\n")
    .map((q) => {
      if (q.trim() != "Connected") {
        return q.split("<|>")[0].trim();
      }
    })
    .forEach((queryId) => {
      console.log("queryId: ", queryId);
      if (queryId && queryId.length && queryId == "ENDENDEND") {
        console.log(
          "Object.keys(benchmarks.end).length before ending: ",
          Object.keys(benchmarks.end).length
        );
        require("fs").writeFileSync(
          `./benchmarks/${new Date(Date.now())}.json`,
          JSON.stringify(benchmarks),
          "utf-8"
        );
        // netSocket.destroy();
        return;
      }
      if (
        queryId &&
        queryId.trim().length &&
        queryId.trim() != "Connected" &&
        queryId.trim() != "ENDENDEND"
      ) {
        benchmarks.end[queryId] = t;
        console.log(
          "Object.keys(benchmarks.end).length: ",
          Object.keys(benchmarks.end).length
        );
      }
    });

  console.log(data);
  if (Object.keys(benchmarks.end).length === total_queries) {
    require("fs").writeFileSync(
      `./benchmarks/${new Date(Date.now())}.json`,
      JSON.stringify(benchmarks),
      "utf-8"
    );
    netSocket.destroy();
  }
});

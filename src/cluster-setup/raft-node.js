/**
 * @description This file creates an instance of the MsgRaft class which is an
 * extension of the LifeRaft class and is used to create a raft cluster
 * node, register callbacks and return the instance
 */

const debug = require("diagnostics")("raft");

const MsgRaft = require("./msg-raft");
const Log = require("../raft/log");
let raft = undefined;

// ==== DEFINING ALL CALLBACKS HERE ==== //
function heartbeatTimeout() {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  debug("======heart beat timeout, starting election====");
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
}

function termChange(to, from) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  debug("were now running on term %s -- was %s", to, from);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
}

function leaderChange(to, from) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  debug("we have a new leader to: %s -- was %s", to, from);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
}

function stateChange(to, from) {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  debug("we have a state to: %s -- was %s", to, from);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
}

function leader() {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
  console.log("I am elected as leader");
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
}

function candidate() {
  console.log("----------------------------------");
  console.log("I am starting as candidate");
  console.log("----------------------------------");
}

async function onData(data) {
  // TODO: Edit this to make perfect
  console.log(
    "From Raft 'on' data method",
    data,
    raft.state === MsgRaft.LEADER
      ? " received as leader"
      : "received as not leader"
  );
  const arr = data?.data;
  if (arr && arr.length > 0)
    console.log("in data.on('data'): ", arr[0].command);
}

function onCommit(command) {
  // TODO: Edit this to make perfect
  console.log("Inside commit", command);
  let val;
  if (command.type === "SET") {
    raft.db.set(command.key, command.value);
    console.log("Committed", command.key, command.value);
  } else if (command.type === "GET") {
    val = raft.db.get(command.key);
    console.log("got val in GET: ", val);
  }
}

// main function to create and return the instance
// TODO: Turn this into a Promise returning thing
const registerNode = function (port, config = {}) {
  // return new Promise((resolve, reject) => {
  try {
    let log = new Log({
      adapter: require("leveldown"),
      path: `./log/${port}/`,
    });
    raft = new MsgRaft("tcp://0.0.0.0:" + port, {
      "election min": config.min,
      "election max": config.max,
      heartbeat: config.heartbeat,
      adapter: require("leveldown"),
      path: `./log/${port}/`,
      Log: log,
    });
    log.setNode(raft);
  } catch (err) {
    console.log("error creating msgraft node: ", err);
  }

  // registering callbacks on the instance
  raft
    .on("heartbeat timeout", heartbeatTimeout)
    .on("term change", termChange)
    .on("leader change", leaderChange)
    .on("state change", stateChange)
    .on("leader", leader)
    .on("candidate", candidate)
    .on("data", onData)
    .on("commit", onCommit);

  // TODO: Make sure that this return is by reference
  return raft;
};

module.exports = registerNode;

/***
 * @description This file contains functions to parse the TCP stream strings
 */
const simdjson = require("simdjson");
/**
 *
 * @param {Buffer} pkt TCP stream buffer data
 */
function parseServerStream(pkt) {
  return pkt
    .toString()
    .split("\n")
    .map((str) => str.trim())
    .filter((str) => {
      return str.trim() !== "";
    })
    .map((item) => {
      const parsedItem = simdjson.lazyParse(item.trim());
      console.log("parsedItem: ", parsedItem);
      return JSON.parse(item.trim());
    });
}

function processServerStreamPacket(item) {}

module.exports = { parseServerStream };

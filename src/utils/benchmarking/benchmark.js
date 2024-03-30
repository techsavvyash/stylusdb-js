/**
 * @description This file acts as the base file for benchmarking the performance of the queries
 */
const fs = require("fs");

function generateBenchmarks(jsonPath) {
  const rawBenchmarkData = JSON.parse(fs.readFileSync(jsonPath));
}

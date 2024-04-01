/**
 * @description This file acts as the base file for benchmarking the performance of the queries
 */
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

function getData() {
  const data = {
    start: {},
    end: {},
  };

  for (let i = 1; i <= 20; i++) {
    const id = uuidv4();
    data.start[id] = {
      type: i <= 10 ? "SET" : "GET",
      start: performance.now(),
    };

    data.end[id] = performance.now();
  }

  return data;
}

function generateBenchmarks(jsonPath) {
  // const rawBenchmarkData = JSON.parse(fs.readFileSync(jsonPath));
  // console.log(rawBenchmarkData);
  const rawBenchmarkData = getData();
  let query_data = {};
  for (let query_id in rawBenchmarkData["start"]) {
    const entry = rawBenchmarkData.start[query_id];
    query_data[query_id] = {
      type: entry.type,
      time: entry.start,
    };
  }

  for (let query_id in rawBenchmarkData["end"]) {
    query_data[query_id].time =
      rawBenchmarkData.end[query_id] - query_data[query_id].time;
  }

  console.log("\nRunning time of each query is : \n");
  console.table(query_data);

  let total_set = 0;
  let total_get = 0;
  let set_query_count = 0;
  let get_query_count = 0;

  for (let id in query_data) {
    let curr_ele = query_data[id];
    console.log(curr_ele);
    if (curr_ele["type"] === "SET") {
      set_query_count++;
      total_set += parseFloat(curr_ele["time"]);
    } else {
      get_query_count++;
      total_get += parseFloat(curr_ele["time"]);
    }
  }

  if (set_query_count) {
    console.log(
      "\nAverage time required in SET operation : ",
      total_set / set_query_count,
      "\n"
    );
  }
  if (get_query_count) {
    console.log(
      "\nAverage time required in GET operation : ",
      total_get / get_query_count,
      "\n"
    );
  }

  return query_data;
}

async function make_graph() {
  const benchmark1 = generateBenchmarks("");
  const benchmark2 = generateBenchmarks("");

  const labels = [];
  for (let i = 1; i <= 20; i++) {
    labels.push(i);
  }

  const data1 = [];
  for (let ele in benchmark1) {
    data1.push(benchmark1[ele].time);
  }

  const data2 = [];
  for (let ele in benchmark2) {
    data2.push(benchmark2[ele].time);
  }

  const configuration = {
    type: "line", // for line chart
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sample 1",
          data: data1,
          fill: false,
          borderColor: ["rgb(51, 204, 204)"],
          borderWidth: 1,
          xAxisID: "xAxis1", //define top or bottom axis ,modifies on scale
        },
        {
          label: "Sample 2",
          data: data2,
          fill: false,
          borderColor: ["rgb(255, 102, 255)"],
          borderWidth: 1,
          xAxisID: "xAxis1",
        },
      ],
    },
  };

  const width = 400; //px
  const height = 400; //px
  const backgroundColour = "white";
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour,
  });

  const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl

    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");


    fs.writeFile("out.png", base64Data, 'base64', function (err) {
        if (err) {
            console.log(err);
        }
    });
    return dataUrl
}

make_graph();

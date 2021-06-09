const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const { Worker } = require("worker_threads");
const { spawn } = require("child_process");
app.use(cors());
app.get("/upload_sample", (req, res) => {

  let pipelineData = "";
  const samples = spawn("node", ["index.js"], {
    shell: true,
  });
  samples.stdout.on("data", (data) => {
    pipelineData += data.toString();
  });
  samples.stdout.on("close", () => {
    
    res.send(pipelineData);
  });
  // samples.stderr.pipe(fs.createWriteStream("err.out"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

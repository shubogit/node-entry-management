const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path")

const app = express();
const PORT = 1200;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


app.get("/", (req, res) => {
  res.sendFile("views/index.html", { root: __dirname });
})
app.get("/entries", (req, res) => {
  res.sendFile("views/entries.html", { root: __dirname });
})

app.post("/entry", async (req, res) => {
  let logPath = path.join(__dirname, "logs/entry-log.json");
  const log = req.body;
  let logs = [];
  try {
    await fs.readFile(logPath, "utf8", async (err, data) => {
      if (err) {
        res.status(500).send("Internal server error");
        throw err;
      }
      if (data !== "") {
        logs = JSON.parse(data);
        let already = logs.some(entry => entry.email === log.email);
        if (already) {
          return res.status(409).send({ message: "Already exist" });
        }
        logs.push(log);
      }
      await fs.writeFile(logPath, JSON.stringify(logs), (err, data) => {
        if (err) {
          res.status(500).send("Internal server error");
          throw err;
        }
        return res.status(201).json(logs);
      })
    })
  } catch {
    res.status(500).send("Internal server error");
  }
})



app.listen(PORT, () => console.log("Server is up and running on port: ", PORT));

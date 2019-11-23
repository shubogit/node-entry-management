const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");

const app = express();
const PORT = process.env.PORT || 1200;

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
  let log = req.body;
  let logs = [];
  try {
    await fs.readFile(logPath, "utf8", async (err, data) => {
      let index = null;
      if (err) {
        res.status(500).send("Internal server error");
        throw err;
      }
      if (data !== "") {
        logs = JSON.parse(data);
        index = logs.findIndex(entry => entry.visitor.email === log.visitor.email);
        // index = index === -1 ? false : index;
        if (index != -1) {
          // existing entry
          logs[index] = {
            ...log,
            id: logs[index].id
          };
        } else {
          // new entry
          log = {
            ...log,
            id: uniqid()
          }
          logs.push(log);
        }
      }
      await fs.writeFile(logPath, JSON.stringify(logs), (err, data) => {
        if (err) {
          res.status(500).send("Internal server error");
          throw err;
        }
        index === -1 ? res.status(201).json({ message: "Entry added successfully" }) : res.status(200).json({ message: "Entry Updated" })
      })
    })
  } catch {
    res.status(500).send("Internal server error");
  }
})

app.get("/entry", async (req, res) => {
  let logPath = path.join(__dirname, "logs/entry-log.json");
  try {
    await fs.readFile(logPath, "utf8", async (err, data) => {
      if (err) {
        res.status(500).send("Internal server error");
        throw err;
      }
      res.status(200).json(JSON.parse(data))
    })
  } catch (error) {
    res.send(500).send("Internal server error");
  }
})



app.listen(PORT, () => console.log("Server is up and running on port: ", PORT));

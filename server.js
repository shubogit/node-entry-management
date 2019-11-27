const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const app = express();
const PORT = 1200;

const config = require("./config.json");

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
  // mail-config
  let transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.auth.user,
      pass: config.email.auth.pass
    }
  });
  // sms-config
  const client = twilio(config.sms.accountSid, config.sms.authToken);

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
          };
        } else {
          // new entry
          log = {
            ...log,
            id: uniqid()
          }
          logs.push(log);
          let outTime = new Date(log.visitor.checkout);

          // option for vistor
          let mailOptionsVisitor = {
            from: config.email.auth.user,
            to: log.visitor.email,
            subject: 'Check-In details at Entry Mangement',
            text: `Hello, ${log.visitor.name},\nPhone: ${log.visitor.phone}\nCheck-In Time: ${new Date(log.visitor.checkin)}\nCheck-Out Time: ${new Date(log.visitor.checkout)}\n\nHost's Info\nName: ${log.host.name}\nEmail: ${log.host.email}\nPhone: ${log.host.phone}.\n\nVisit Again, Thanks.`
          }
          let smsOptionVisitor = {
            body: `Hello, ${log.visitor.name},\nPhone: ${log.visitor.phone}\nCheck-In Time: ${new Date(log.visitor.checkin)}\nCheck-Out Time: ${new Date(log.visitor.checkout)}\n\nHost's Info\nName: ${log.host.name}\nEmail: ${log.host.email}\nPhone: ${log.host.phone}.\n\nVisit Again, Thanks.`,
            from: `${config.sms.phone}`,
            to: `${log.visitor.phone}`
          }

          // option for host
          let mailOptionsHost = {
            from: config.email.auth.user,
            to: log.host.email,
            subject: 'Check-In details at Entry Mangement',
            text: `You've got visitors\nVistor's detail\nName: ${log.visitor.name}\nPhone: ${log.visitor.phone}\nCheck-In Time: ${new Date(log.visitor.checkin)}\nCheck-Out Time: ${new Date(log.visitor.checkout)}\n\nThank You.`
          }
          let smsOptionHost = {
            body: `You've got visitors\nVistor's detail\nName: ${log.visitor.name}\nPhone: ${log.visitor.phone}\nCheck-In Time: ${new Date(log.visitor.checkin)}\nCheck-Out Time: ${new Date(log.visitor.checkout)}\n\nThank You.`,
            from: `${config.sms.phone}`,
            to: `${log.host.phone}`

          }
          // immediate - host email/sms
          transporter.sendMail(mailOptionsHost, (error, info) => {
            if (error) console.log(error);
            else {
              console.log("Main sent successfuly");
            }
          });
          client.messages.create({
            body: smsOptionHost.body,
            from: smsOptionHost.from,
            to: smsOptionHost.to
          })
            .then(message => console.log('Message sent successfully'))
            .catch(error => console.log(error));

          // CORN JOB SCHEDULER
          // scheduled - host email/sms
          let job = new CronJob(`${outTime.getMinutes()} ${outTime.getHours()} * * *`, () => {
            transporter.sendMail(mailOptionsVisitor, (error, info) => {
              if (error) console.log(error);
              else {
                console.log("Main sent successfully");
              }
            });
            client.messages.create({
              body: smsOptionVisitor.body,
              from: smsOptionVisitor.from,
              to: smsOptionVisitor.to
            })
              .then(message => console.log('Message sent successfully'))
              .catch(error => console.log(error));
            job.stop();
          })
          job.start();
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

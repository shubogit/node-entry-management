# Entry Mangement

> A node.js application for entry management. This application takes input of visitor- name, email, phone, checkin, checkout and host- name, email, phone. And notify host through email and sms at checkin time and same to visitor at checkout time.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Setup](#setup)
- [Approach](#approach)

## Requirements

- A gmail account, with **email, password and allowed less secured app turned on in security settings**. (For sending email)
- A twilio account, **with account-Sid, auth-Token and twilio - phone number** (For sending sms).

> **Note: For twilio trial accounts you need to verify phone number before sending sms.**

## Installation

- Clone the repo.
- After cloning the repo

> install npm packages using

```shell
$ npm i
```

## Setup

- Create a directory **inside root directory** name it **logs**. (if not already created).
- Inside **logs** create a new **json** file named **entry-log.json** leave it empty. (if not already created)
- Again in **root directory** create a new **json** file named **config.json** and paste below code.

```javascript
// paste this
{
  "email": {
    "service": "gmail",
    "auth": {
      "user": "YOUR-EMAIL-ID",
      "pass": "YOUR-PASSWORD"
    }
  },
  "sms": {
    "accountSid": "YOUR-TWILIO-ACCOUNT-SID",
    "authToken": "YOUR-TWILIO-ACCOUNT-AUTH-TOKEN",
    "phone": "YOUR-TWILIO-ACCOUNT-PHONE"
  }
}

```

## Approach

> This application is built using node.js, express.js and other helper libraries like body-parser, cors, path, uniqid, cron, nodemailer, twilio.

- Using express.js I have created a server which is listening on port **1200**.
- After that on different **route** and different **http method** type, I am listening for the user request and sending a response based on the request.
- On route **/** with **GET** method, I am sending a **html file**.
- The html file which is being sent on route **/** with **GET** method, has a form, on submit event of the form I am sending a **POST** request to the server on route **/entry** with the **form data** as a **request body**.
- At **POST** request to the server on route **/entry**, the form data is being stored inside **logs** directory to the file named **entry-log.json**.
- The **entry-log.json** file is basicaly my database which I am reading and writing using **fs** package that comes with **node.js**.
- Above mentioned json file just an array of JSON objects, a sample object is like:

```javascript {
  "visitor": {
    "name": "Jamie Lanister",
    "email": "j@j.com",
    "phone": "2424242424",
    "checkin": "11/23/2019 21:24:00",
    "checkout": "11/23/2019 00:24:00"
  },
  "host": {
    "name": "Jason Man",
    "email": "js@js.com",
    "phone": "1212121212"
  },
  "id": "lz7768xk3br8e01"
```

- For every **POST** a unique id is also created which I am getting with the npm package [uniqid](https://www.npmjs.com/package/uniqid)

- Before writing to json file it is checked that a visitor with current email is already present or not, if present then it is being updated else a new object is gets pushed to the array.
- Before pushing to array, email and sms to host being sent, and a **job is scheduled** using **cron** library which is performing a operation of sending mail and sms to the visitor at the time provided in checkout which is expected to be a time greater than current time at which the job is being scheduled.
- A **GET** request on **/entries** route is returning a html file where all the entries are being displayed.
- On the **entries** html file, **GET** request to **/entry** is being made, which is returning a array of objects which is present in **entry-log.json** as a response.
- Based on response array the row of the table is displayed after looping through every entry in the array using a **foreach**.

---

## Thank You.

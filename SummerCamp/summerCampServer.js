const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require("dotenv").config({path: path.resolve(__dirname, '.env')})

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(bodyParser.urlencoded({extended:false}));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

if (process.argv.length != 3) {
    process.stdout.write(`Usage summerCampServer.js portNumber\n`);
    process.exit(1);
}

const portNumber = process.argv[2];

app.listen(portNumber);

console.log(`Web server started and running at http://localhost:${portNumber}`);

process.stdin.setEncoding("utf8");

const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on('readable', () => {
    let dataInput = process.stdin.read();
    if (dataInput != null) {
        let command = dataInput.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command: ${command}`);
            process.stdout.write("\n");
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

const uri = `mongodb+srv://${username}:${password}@cluster0.62jb38l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});

async function insertApplication(application) {
    try {
        await client.connect();
        const result = await client.db(database).collection(collection).insertOne(application);
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function lookupApplication(em, lookup) {
    try {
        await client.connect();
        const filter = {email: em};
        const result = await client.db(database).collection(collection).findOne(filter);
        if (result) {
            lookup.name = result.name;
            lookup.email = result.email;
            lookup.gpa = result.gpa;
            lookup.backgroundInfo = result.backgroundInfo;
            lookup.time = result.time;
        }
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function lookupGPAs(param, tab) {
    try {
        await client.connect();
        const filter = {gpa: {$gte: param}};
        const cursor = await client.db(database).collection(collection).find(filter);
        const result = await cursor.toArray();
        result.forEach((ele) => {
            tab.table += `<tr><td>${ele.name}</td><td>${ele.gpa}</td></tr>`;
        });
        tab.table += "</table>";
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function removeApplications(remove) {
    try {
        await client.connect();
        const result = await client.db(database).collection(collection).deleteMany({});
        remove.removed = result.deletedCount;
    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/apply", (req, res) => {
    res.render("apply");
});

app.post("/processApplication", (req, res) => {
    const person = {name: req.body.name, email: req.body.email, gpa: parseFloat(req.body.gpa), backgroundInfo: req.body.backgroundInfo};
    insertApplication(person);
    const now = new Date();
    person.time = now.toString();
    res.render("processApplication", person);
});

app.get("/reviewApplication", (req, res) => {
    res.render("reviewApplication");
});

app.post("/processReviewApplication", (req, res) => {
    let lookup = {name: "NONE", email: "NONE", gpa: "NONE", backgroundInfo: "NONE"};
    lookupApplication(req.body.email, lookup).then(() => {
        res.render("processReviewApplication", lookup);
    });
});

app.get("/adminGPA", (req, res) => {
    res.render("adminGPA");
});

app.post("/processAdminGPA", (req, res) => {
    let param = parseFloat(req.body.gpa);
    let table = {table : "<table border='1'><tr><th>Name</th><th>GPA</th></tr>"};
    lookupGPAs(param, table).then(() => {
        res.render("processAdminGPA", table);
    });
});

app.get("/adminRemove", (req, res) => {
    res.render("adminRemove");
});

app.post("/processAdminRemove", (req, res) => {
    let remove = {removed : 0};
    removeApplications(remove).then(() => {
        res.render("processAdminRemove", remove);
    });
});
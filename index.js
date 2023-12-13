const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.listen(5000);

app.get("/", (req, res) => {
    res.render("index");
});

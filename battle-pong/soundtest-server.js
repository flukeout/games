const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('.'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.put('/save', (req, res) => {
  fs.writeFile('sound-settings.json', JSON.stringify(req.body), err => {
    res.sendStatus(200);
  });
});

app.get('/load', (req, res) => {
  fs.readFile('sound-settings.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  });
});

app.listen(3010, () => {});
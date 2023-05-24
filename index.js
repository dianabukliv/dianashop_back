const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.port || 5000;
const cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.listen(port, () => console.log(`listening on ${port}`));

const connection = mysql.createConnection(process.env.DB_URL);

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳');
});

app.post('/order/', (req, res) => {
  const values = req.body
  connection.query('INSERT INTO `orders` SET ?;', values, (err, rows) => {
    if(!err) {
      res.status(200).json({ data: rows })
    } else {
      res.status(500).json({ message: err.message })
    }
  })
});

module.export = app;

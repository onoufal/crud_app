'use strict';

//Application Dependancies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const override = require('method-override');
// const cors = require('cors');

//Enviromental Variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

//Application Setup
const app = express();
const client = new pg.Client(DATABASE_URL);

client
  .connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
  })
  .catch((error) => console.log(error));

// client.on('error', (error) => console.error(error));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(override('_method'));
// app.use(cors());

app.set('view engine', 'ejs');

app.get('/test', (req, res) => {
  res.render('./pages/index');
});

app.get('*', (req, res) => {
  res.status(404).send('This route does exist');
});

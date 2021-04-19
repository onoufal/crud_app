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

// client.on('error', (error) => console.error(error));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(override('_method'));
// app.use(cors());

app.set('view engine', 'ejs');

// app.get('/test', (req, res) => {
//   res.render('./pages/index');
// });

//get all characters
app.get('/home', (req, res) => {
  const url = 'http://hp-api.herokuapp.com/api/characters';
  superagent.get(url).then((results) => {
    const characters = results.body.map((object) => new Character(object));
    res.render('./pages/index', { characters: characters });
  });
});

//save character
app.post('/favorite-character', (req, res) => {
  const data = req.body;
  // res.send(data);
  const { name, house, patronus, alive } = data;
  const sql =
    'INSERT INTO characters (name, house, patronus, is_alive, created_by) VALUES ($1, $2, $3, $4, $5);';
  const values = [name, house, patronus, alive, 'api'];
  client.query(sql, values).then(() => {
    res.redirect('/character/my-fav-characters');
  });
});

//get all fav-characters
app.get('/character/my-fav-characters', (req, res) => {
  const sql = `SELECT * FROM characters WHERE created_by=$1;`;
  const values = ['api'];
  client.query(sql, values).then((results) => {
    res.render('./pages/fav-characters', { favCharacters: results.rows });
    // console.log(results.rows);
  });
});

app.get('*', (req, res) => {
  res.status(404).send('This route does exist');
});

function Character(charInfo) {
  this.name = charInfo.name;
  this.house = charInfo.house;
  this.patronus = charInfo.patronus;
  this.alive = charInfo.alive;
}

client
  .connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
  })
  .catch((error) => console.log(error));

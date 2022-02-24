require('dotenv').config();
const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const app = express();
const axios = require('axios')
const db = require('./models')

// Sets EJS as the view engine
app.set('view engine', 'ejs');
// Specifies the location of the static assets folder
app.use(express.static('static'));
// Sets up body-parser for parsing form data
app.use(express.urlencoded({ extended: false }));
// Enables EJS Layouts middleware
app.use(ejsLayouts);

// Adds some logging to each request
app.use(require('morgan')('dev'));

// Routes
app.get('/', function(req, res) {
  res.render('index.ejs')
})

app.get('/results', async (req, res) => {
    try {
      const response = await axios.get(`http://www.omdbapi.com/?s=${req.query.movieSearch}&apikey=${process.env.OMDB_API_KEY}`)
      res.render('results.ejs', { movies: response.data.Search })
    } catch (error) {
      console.log(error)
    }
})

app.get('/details/:id', (req, res) => {
  console.log(req.params.id)
  axios.get(`http://www.omdbapi.com/?i=${req.params.id}&apikey=${process.env.OMDB_API_KEY}`)
    .then(response => {
      res.render('detail.ejs', { movie: response.data })
    })
    .catch(console.log)
})

// GET /faves -- READ all faves from the database
app.get('/faves', async (req, res) => {
  try {
    const allFaves = await db.fave.findAll()
    res.json(allFaves)
  } catch (err) {
    console.log(err)
  }
})

// POST /faves -- CREATE a fave and redirect to /faves
app.post('/faves', async (req, res) => {
  try {
    await db.fave.create({
      title: req.body.title,
      imdbId: req.body.imdbId
    })
    res.redirect('/faves')
  } catch(error) {
    console.log(error)
  }
})

app.listen(process.env.PORT || 3000);
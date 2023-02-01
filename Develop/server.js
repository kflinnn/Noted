//Import express package
const express = require('express');
const path = require('path');
const { clog } = require('./middleware/clog');
const api = require('./public/assets/js/index');

//Require the JSON file 
const noteData = require("./db/db.json");
const PORT = process.env.PORT || 3001;

const app = express();

app.use(clog);

//Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', api);

app.use(express.static('public'));


//HTML routes
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//Wildcard route to direct users to the html file
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/assets/js/index.html'))
);

//API route that returns all saved notes as JSON
app.get('/api/notes', (req, res) => res.json(noteData));



app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
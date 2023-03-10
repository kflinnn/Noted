//Import express package
const express = require('express');
const path = require('path');
const { clog } = require('./middleware/clog');
const fs = require('fs');
//Helper method for generating unique ids
const uuid = require('./helpers/uuid');

//Require the JSON file 
const noteData = require("./db/db.json");
const PORT = process.env.PORT || 3001;

const app = express();

app.use(clog);

//Middleware to parse JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));


//HTML routes
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);


//API route that returns all saved notes as JSON
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    }
    res.send(data);
})
  });



//Post request to add a note 
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

//obtaining existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
          } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);
    
            // Add a new note
            parsedNotes.push(newNote);
            console.log(newNote.id);
            // Write updated notes back to the file
            fs.writeFile(
              './db/db.json',
              JSON.stringify(parsedNotes, null, 4),
              (writeErr) => {
                writeErr
                  ? console.error(writeErr)
                  : console.info('Successfully updated notes!')
                  console.log('parsedNotes', parsedNotes);
                  res.json(parsedNotes) }
            );
          }
        });
        } else {
        res.status(400).json('Error in posting note');
    }
});

//DELETE a single note

app.delete('/api/notes/:id', (req, res) => {
const note = req.params.id;
console.log(noteData[1].id);
for (let i = 0; i < noteData.length; i++) {
  if (note === noteData[i].id) {
  noteData.splice(i, 1)
  }
}
fs.writeFile (
  './db/db.json',
JSON.stringify(noteData),
(writeErr) => {
  if (writeErr) throw error;
    res.json("Note deleted!") }
);
});

//Wildcard route to direct users to the html file
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/assets/js/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
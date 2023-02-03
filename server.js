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
    console.info(`GET /api/notes`);
    res.status(200).json(noteData);
});

//GET a single note

app.get('/api/notes/:notes_id', (req, res) => {
    if (req.params.notes_id) {
      console.info(`${req.method} request received to get a single a review`);
      const noteId = req.params.notes_id;
      for (let i = 0; i < noteData.length; i++) {
        const currentNote = noteData[i];
        if (currentNote.notes_id === noteId) {
          res.json(currentNote);
          return;
        }
      }
      res.status(404).send('Note not found');
    } else {
      res.status(400).send('Note ID not provided');
    }
  });

//Post request to add a note 
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            notes_id: uuid(),
        };

//obtaining existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
          } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);
    
            // Add a new review
            parsedNotes.push(newNote);
    
            // Write updated reviews back to the file
            fs.writeFile(
              './db/db.json',
              JSON.stringify(parsedNotes, null, 4),
              (writeErr) =>
                writeErr
                  ? console.error(writeErr)
                  : console.info('Successfully updated notes!')
            );
          }
        });
       
        const response = {
          status: 'success',
          body: newNote,
        };

      console.log(response);
      res.status(201).json(response);  
    } else {
        res.status(400).json('Error in posting note');
    }
});

//Wildcard route to direct users to the html file
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/assets/js/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    const notes = fs.readFileSync('./db/db.json', 'utf8');
    const parsedNotes = JSON.parse(notes);
    res.json(parsedNotes);
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body;
  
    if (title && text) {
      const newNote = {
        title,
        text,
        id: uuidv4()
      };
  
      fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json('Error in posting note');
          return;
        }
  
        let notes = JSON.parse(data);
        notes.push(newNote);
        const updatedNotes = JSON.stringify(notes, null, 4);
  
        fs.writeFile('./db/db.json', updatedNotes, (err) => {
          if (err) {
            console.error(err);
            res.status(500).json('Error in posting note');
            return;
          }
  
          const response = {
            status: 'success',
            body: newNote
          };
  
          console.log(response);
          res.status(201).json(response);
        });
      });
    } else {
      res.status(500).json('Error in posting note');
    }
  });
  
  app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
  
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json('Error in deleting note');
        return;
      }
  
      let notes = JSON.parse(data);
      const updatedNotes = notes.filter((note) => note.id !== id);
  
      if (notes.length === updatedNotes.length) {
        res.status(404).json('Note not found');
        return;
      }
  
      const updatedNotesString = JSON.stringify(updatedNotes);
  
      fs.writeFile('./db/db.json', updatedNotesString, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json('Error in deleting note');
          return;
        }
  
        const response = {
          status: 'success',
          message: 'Note deleted successfully'
        };
  
        console.log(response);
        res.json(response);
      });
    });
  });
  

app.listen(PORT, () =>
    console.log(`App listening at https://localhost:${PORT} 🚀`)
)
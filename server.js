const express = require('express');
const bodyParser = require('body-parser');
const nano = require('nano')('http://127.0.0.1:5984');
const app = express();
const port = 3000;

const dbName = 'test_db';
const wordDb = nano.use(dbName);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

app.get('/', async (req, res) => {
  try {
    // Fetch all documents from the word_db database
    const wordDocs = await wordDb.list({ include_docs: true });
    const words = wordDocs.rows.map(row => row.doc.word);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Word List</title>
      </head>
      <body>
        <h1>Word List</h1>
        <ul>
          ${words.map(word => `<li>${word}</li>`).join('')}
        </ul>
        <form action="/add" method="post">
          <label for="newWord">Add New Word:</label>
          <input type="text" id="newWord" name="newWord" required>
          <button type="submit">Add</button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching word list:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add', async (req, res) => {
  const newWord = req.body.newWord;

  try {
    // Insert the new word into the word_db database
    await wordDb.insert({ word: newWord });

    // Redirect to the home page after adding the word
    res.redirect('/');
  } catch (error) {
    console.error('Error adding new word:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


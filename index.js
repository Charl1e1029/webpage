// Import required modules
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const axios = require('axios'); // Make sure to install axios using: npm install axios
// Load environment variables from .env file
dotenv.config();

// Create an Express app
const app = express();

// Connect to MongoDB using environment variables
//mongodb + srv://ktang124:<password>@cmsc335.bd5ljeg.mongodb.net/?retryWrites=true&w=majority
const dbURI = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cmsc335.bd5ljeg.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// ...
// Use bodyParser to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
// Allow ejs files to use css
app.use('/pub', express.static(__dirname + '/pub'));
// Handle MongoDB connection events
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a MongoDB schema and model
const friend_schema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  timezone: { type: String, required: true },
});
collection = process.env.MONGO_COLLECTION;
const friend_model = mongoose.model(collection, friend_schema);
// Define routes

app.get('/', (req, res) => {
  // Render the submitForm.ejs file
  res.render('index');
});

app.get('/application', (req, res) => {
  // Render the submitForm.ejs file
  res.render('application');
});





app.post('/process_add_friend', async (req, res) => {
  try {
    // Handle submission of information
    const { name, username, timezone } = req.body;
    console.log(name, username, timezone);

    // Get current time from the TimeAPI based on the specified timezone
    const timeApiResponse = await axios.get(`https://timezoneapi.io/api/timezone/${encodeURIComponent(timezone)}`);
    const time = timeApiResponse.data.data.datetime;

    const newEntry = new friend_model({
      name,
      username,
      timezone,
      time
    });

    // Save the new entry to the database
    await newEntry.save();

    // Render the confirmation page with user information
    res.render('confirmation', { name, username, timezone, time });
  } catch (error) {
    console.error('Error processing add friend:', error);
    return res.status(500).json({ error: 'Error processing add friend' });
  }
});




  newEntry.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error saving entry to the database' });
    }
     res.render('confirmation', { name, username, timezone, time});
  });


app.get('/find_friend', (req, res) => {
  // Render the reviewApplication.ejs file
  res.render('findfriend');
});
app.post('/find_friend_by_username', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required in the query parameters' });
  }

  friend_model.findOne({ username: username }, (err, friend) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving applicant from the database' });
    }

    if (!friend) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    const { name, username, timezone} = friend;

    //call time api
    // Render the confirmation page with applicant information
    res.render('confirmation', { name, username, timezone, time});
  });
});




// Start the server
const PORT = process.argv[2] || 3000; // Use the provided port or default to 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  promptUser();
});

// Command line interpreter function
function promptUser() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Type "stop" to shutdown the server: ', (command) => {
    switch (command) {
      case 'stop':
        console.log('Shutting down the server');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid command:', command);
        break;
    }

    promptUser(); // Continue prompting
  });
}



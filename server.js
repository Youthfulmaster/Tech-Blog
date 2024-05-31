// Importing packages
const express = require('express');
const path = require('path');
const session = require('express-session');
const exphbs = require('express-handlebars');

// Import routes and helpers
const routes = require('./controllers');
const helpers = require('./utils/helpers');

// Importing Sequelize connect object and connect-session-sequelize
const sequelize = require('./config/connection'); 
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Initialize express app and set the port
const app = express();
const PORT = process.env.PORT || 3001; // Will pull a port from an environment variable or select 3001

// Set up Handlebars.js engine with custom helpers
const hbs = exphbs.create({ helpers });

// Set up sessions
const sess = {
  secret: 'Super secret secret',
  cookie: {
    maxAge: 60 * 60 * 1000, // Expires every hour
    secure: false,
    sameSite: 'strict',
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

// Middleware
app.use(session(sess)); // Set up sessions as middleware
app.engine('handlebars', hbs.engine); // Have Express use Handlebars engine
app.set('view engine', 'handlebars'); // Set the view engine to Handlebars

app.use(express.json()); // Middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

app.use(routes); // Use routes from the controllers

// Sync database and start server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));
});

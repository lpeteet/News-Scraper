//  ****************************************************************************
//  # News-Scraper
//  NewsScraper App- Homework Week-9 (Thursday)
//  ****************************************************************************

var PORT = process.env.PORT || 3000;

//  ****************************************************************************
//  DEPENDENCIES
//  ****************************************************************************
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");

var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

//MongoDB Access!
//var urlMongoDB = 'mongodb://lpeteet:Raleigh1!@ds121535.mlab.com:21535/news';
//var databaseUrl = "scraper";
//var collections = ["scrapedData"];

//  ****************************************************************************
//  DATABASE CONNECTION
//  ****************************************************************************
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Database configuration with mongoose
//mongoose.connect("mongodb://localhost/week18day3mongoose");
//var db = mongoose.connection;

// Show any mongoose errors
//db.on("error", function(error) {
//  console.log("Mongoose Error: ", error);
//});

// Once logged in to the db through mongoose, log a success message
//db.once("open", function() {
//    console.log("Mongoose connection successful.");
//  });
  
// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/week18Populater", {
  useMongoClient: true
});


//  ****************************************************************************
//  ROUTES
//  ****************************************************************************
// Main route (simple Hello World Message)
app.get("/", function(req, res) {
    console.log("Inside app.GET('/')");
    res.render("index");
});
  
//  ----------------------------------------------------------------------------
//  "'/ALL" Route
//  ----------------------------------------------------------------------------
app.get("/all", function(req, res) {
    console.log("Inside app.GET('/all')");
    // Find all results from the scrapedData collection in the db
    db.Article.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log("Error in Get('all'):", error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
});

//  ----------------------------------------------------------------------------
//  "'/scrape" Route
//  ----------------------------------------------------------------------------
app.get("/scrape", function(req, res) {
    console.log("Inside app.GET('/scrape')");
    // First, we grab the body of the html with request
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
        console.log("SCRAPING, RESULT:", result);
      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          //res.send("Scrape Complete");
          res.redirect("/all");
        })
        .catch(function(error) {
            console.log("Error in Get('/Scrape'):", error);
            // If an error occurred, send it to the client
          res.json(error);
        });
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    console.log("Inside app.GET('/articles')");
    // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(error) {
        console.log("Error in Get('/articles'):", error);
        // If an error occurred, send it to the client
      res.json(error);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    console.log("Inside app.GET('/articles/:id')");
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(error) {
        console.log("Error in Get('/articles/:id'):", error);
        // If an error occurred, send it to the client
      res.json(error);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    console.log("Inside app.POST('/articles/:id')");
    // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(error) {
        console.log("Error in POST('/articles/:id'):", error);
        // If an error occurred, send it to the client
      res.json(error);
    });
});

app.listen(PORT, function() {
    console.log("News-Scraper listening on http://localhost:" + PORT);
});



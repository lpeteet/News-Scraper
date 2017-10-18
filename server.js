// Dependencies
var express = require("express");
var mongojs = require("mongojs");

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

//MongoDB Access!
var urlMongoDB = 'mongodb://lpeteet:Raleigh1!@ds121535.mlab.com:21535/news';
var databaseUrl = "scraper";
var collections = ["scrapedData"];

var app = express();

//Database Connection
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
    res.send("Hello world");
  });
  
// Retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });
  
  
  
  // Retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });

// Scrape Data
app.get("/scrape", function(req, res) {
    // Make a request for the news section of ycombinator
    request("https://news.ycombinator.com/", function(error, response, html) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(html);
      // For each element with a "title" class
      $(".title").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        var title = $(element).children("a").text();
        var link = $(element).children("a").attr("href");
  
        // Only Insert if we have Title and Link!
        if (title && link) {
          // Actual DB Insert
          db.scrapedData.insert({
            title: title,
            link: link
          },
          //Error Function from DB Insert
          function(err, inserted) {
            if (err) {
              console.log(err);
            }
            else {
              //All Good!
              console.log(inserted);
            }
          });
        }
      });
    });
  
  app.listen(PORT, function() {
    console.log("News-Scraper listening on http://localhost:" + PORT);
});




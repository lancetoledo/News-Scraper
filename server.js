// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");



// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
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

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  let target = "http://www.nytimes.com"
  axios.get(target).then(function (response) {
      var $ = cheerio.load(response.data);

      let test = []
      $("article").each(function (i, element) {
          let result = {}
          result.title = $(this).find("h2")['0']['children'][0]['data'];
          result.link = target+$(this).find("a")['0'].attribs.href;
          result.summary = $(this).find("p").text() //|| $(this).find("li").text();
          
          test.push(result)

      });
      console.log(test)
      res.send("Scrape Complete")
  });
});

var PORT = process.env.PORT || 3000;
// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on http://localhost:" + PORT);
});

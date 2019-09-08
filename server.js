// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var logger = require("morgan");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");



// Initialize Express
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/News-Scraper";
console.log("connection: "+MONGODB_URI)

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});


// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.render("index");
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

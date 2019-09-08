// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var logger = require("morgan");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");


// Initialize Express
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/News-Scraper";
console.log("connection: "+MONGODB_URI)

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});


// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  db.Article.find({
    summary: {
        $exists: true
    }
}).limit(20)
    .then(function (dbArticles) {
        let scraped = false
        if (dbArticles.length > 0){
            scraped = true
        }
        res.render("index", {
            articles: dbArticles,
            scraped: scraped
        })
    })
    .catch(function (err) {
        res.json(err);
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

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
          _id: req.params.id
      })
      .populate("note")
      .then(function (dbArticle) {
          res.json(dbArticle)
      })
      .catch(function (err) {
          res.json(err);
      });
});

app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
      .then(function (dbNote) {
          return db.Article.findOneAndUpdate({
              _id: req.params.id
          }, {
              note: dbNote._id
          }, {
              new: true
          });
      })
      .then(function (dbArticle) {
          res.json(dbArticle);
      })
      .catch(function (err) {
          res.json(err);
      });
});


var PORT = process.env.PORT || 3000;
// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on http://localhost:" + PORT);
});

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
    saved:false
}).limit(10)
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
          let title = $(this).find("h2")['0']['children'][0]['data'];
          if(title){
           result.title = title;
          }
          else{
              result.title = "NA";
          }
          result.link = target+$(this).find("a")['0'].attribs.href;
          result.summary = $(this).find("p").text() //|| $(this).find("li").text();
          db.Article.create(result)
          .then(function(article){
              console.log(article)
          })
      })
      console.log(test)

      res.send("Scrape Complete")
  });
});

app.get("/articles/saved", function (req,res){
console.log("this route was hit");
  db.Article.find({saved:true})
      .then(function(articles){
          console.log(articles);
          res.render("saved", {
              article: articles
          });
      })
  
})
  
app.post("/articles/saved/:id", function (req, res) {
     console.log(req.params.id)
     db.Article.findOneAndUpdate({
         _id: req.params.id
     },{saved:true}).then(function(note){
      console.log(note);
      res.json({})
     })
});








app.post("/notes/:id", function (req, res) {
    console.log(req.body);
    console.log(req.params);

    db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({_id:req.params.id}, { $push: { note: dbNote._id } }, { new: true });
    })
    .then(function(dbUser) {
      // If the User was updated successfully, send it back to the client
      res.json(dbUser);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });

});

app.get("/note/:id", function(req,res){
    db.Article.find({_id:req.params.id}).populate("note")
    .then(function(notes){
        console.log(notes);
        res.json(notes[0].note[0].body);
    })
})


var PORT = process.env.PORT || 3000;
// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on http://localhost:" + PORT);
});

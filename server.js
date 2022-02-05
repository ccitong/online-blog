/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Sitong Wang____________________ Student ID: _138148200 Date: __5th Feb 2022______________
*
*  Online (Heroku) URL: https://git.heroku.com/evening-reaches-43658.git
*
*  GitHub Repository URL: https://github.com/ccitong/web322-app
*
********************************************************************************/ 



var express = require("express");
var app = express();
var path = require("path");
var blogservice = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}


app.use(express.static("public"));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect('http://localhost:8080/about');
});

// setup another route to listen on /about
app.get("/about", function(req,res){
  res.sendFile(path.join(__dirname,"/views/about.html"));
});


app.get("/blog", function(req,res){
  blogservice.getPublishedPosts().then((blogservice) => {
    res.json(blogservice);
  })
  .catch((err)=>{
    console.log(err);
  });
});

app.get("/posts", function(req,res){
  blogservice.getAllPosts().then((blogservice) => {
    res.json(blogservice);
  })
  .catch((err)=>{
    console.log(err);
  });
});

app.get("/categories", function(req,res){
  blogservice.getCategories().then((blogservice) => {
    res.json(blogservice);
  })
  .catch((err)=>{
    console.log(err);
  });
});

// optional 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
});

// setup http server to listen on HTTP_PORT
blogservice.initialize().then(()=>{
  app.listen(HTTP_PORT, onHttpStart);
}).catch(err=>{
  console.log(err);
});

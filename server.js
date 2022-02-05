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
    //res.send("Hello World<br /><a href='/about'>Go to the about page</a>");
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

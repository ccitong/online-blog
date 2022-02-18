/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Sitong Wang____________________ Student ID: _138148200 Date: __17th Feb 2022______________
*
*  Online (Heroku) URL: 
                        https://git.heroku.com/nameless-escarpment-95810.git
*
*  GitHub Repository URL: https://github.com/ccitong/web322-app
*
********************************************************************************/ 



var express = require("express");
var app = express();
var path = require("path");
var blogservice = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: 'dszvbrlkg',
  api_key: '361281875176274',
  api_secret: 'Od4CrvVt91KTj34hmGLQYQTPNNU',
  secure: true
});

const upload = multer(); 
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

app.get("/posts/add", function(req,res){
  res.sendFile(path.join(__dirname,"/views/addPost.html"));
});

app.get("/blog", function(req,res){
  blogservice.getPublishedPosts().then((blogservice) => {
    res.json(blogservice);
  })
  .catch((err)=>{
    console.log(err);
  });
});


app.get("/posts", (req,res)=>{
  if(req.query.category){
      blogservice.getPostsByCategory(req.query.category).then((data) => {
        res.json({data});
    }).catch((error) => {
        console.log(error)
        res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
    })    
  }
  else if(req.query.minDate){
      blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
        res.json({data});
    }).catch((error) => {
        console.log(error)
        res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
    });
  }
  else{
    blogservice.getAllPosts().then((blogservice) => {
      res.json(blogservice);
    })
    .catch((err)=>{
      console.log(err);
    })
}
});



app.get('/posts/:id', (req, res) => {
  blogservice.getPostsById(req.params.id).then((data) => {
      res.json({data});
  }).catch((error) => {
      console.log(error)
      res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
  })    
})

app.get("/categories", function(req,res){
  blogservice.getCategories().then((blogservice) => {
    res.json(blogservice);
  })
  .catch((err)=>{
    console.log(err);
  });
});

app.post('/posts/add',upload.single('featureImage'),(req,res)=>{

let streamUpload = (req) => {
  return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
          if (result) {
              resolve(result);
          } else {
              reject(error);
          }
          }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

async function upload(req) {
  let result = await streamUpload(req);
  console.log(result);
  return result;
}

upload(req).then((uploaded)=>{
  req.body.featureImage = uploaded.url;

  blogservice.addPost(req.body).then((data) => {
    res.redirect('/posts')
}).catch((error) => {
    res.status(500).send(error)
})


  //res.send(JSON.stringify(req.body))
  // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

});

})

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

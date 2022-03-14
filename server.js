/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Sitong Wang____________________ Student ID: _138148200 Date: __14th March 2022______________
*
*  Online (Heroku) URL: 
                        https://peaceful-everglades-38937.herokuapp.com/
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
const exphbs = require("express-handlebars"); 
const stripJs = require('strip-js');
const { setEnvironmentData } = require("worker_threads");
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  layout: 'main',
  helpers:{
    navLink: function(url, options){
      return '<li' + 
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
    },
    safeHTML: function(context){
      return stripJs(context);
  }
  
  }
}));
app.set('view engine', '.hbs');


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
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
  app.locals.viewingCategory = req.query.category;
  next();
});



// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect('/blog'); 
});

// setup another route to listen on /about
app.get("/about", function(req,res){
  res.render('about',{
    layout:'main'
  });
});

app.get("/posts/add", function(req,res){
  //res.sendFile(path.join(__dirname,"/views/addPost.html"));
  res.render('addPost',{
    layout: 'main'
  });
});

// app.get("/blog", function(req,res){
//   blogservice.getPublishedPosts().then((blogservice) => {
//     res.json(blogservice);
//   })
//   .catch((err)=>{
//     console.log(err);
//   });
// });

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogservice.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogservice.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogservice.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});


app.get("/posts", (req,res)=>{
  if(req.query.category){
      blogservice.getPostsByCategory(req.query.category).then((data) => {
        res.render("posts", {posts: data});
    }).catch((error) => {
        res.render("posts", {message: "no results"});
    })    
  }
  else if(req.query.minDate){
      blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
        res.render("posts", {posts: data});
    }).catch((error) => {
        res.render("posts", {message: "no results"});
    })
  }
  else{
    blogservice.getAllPosts().then((data) => {
      //res.json(blogservice);
      res.render("posts", {posts: data})
    })
    .catch((err)=>{
      res.render("posts", {message: "no results"});
    })
}
});



app.get('/posts/:id', (req, res) => {
  blogservice.getPostById(req.params.id).then((data) => {
      res.json({data});
  }).catch((error) => {
      console.log(error)
      res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
  })    
})

app.get("/categories", function(req,res){
  blogservice.getCategories().then((data) => {
    //res.json(blogservice);
    res.render("categories", {categories: data});
  })
  .catch((err)=>{
    //console.log(err);
    res.render("categories", {message: "no results"});
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


app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogservice.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogservice.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogservice.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogservice.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
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

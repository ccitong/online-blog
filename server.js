/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Sitong Wang____________________ Student ID: _138148200 Date: __8th April 2022______________
*
*  Online (Heroku) URL: https://peaceful-everglades-38937.herokuapp.com/
                        
*
*  GitHub Repository URL: https://github.com/ccitong/web322-app
*
********************************************************************************/ 



var express = require("express");
var app = express();
var path = require("path");
var blogservice = require("./blog-service.js");
var authData = require("./auth-service");
const clientSessions = require("client-sessions");
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
    formatDate: function(dateObj){
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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

app.use(clientSessions({
  cookieName: "session",
  secret: "web322_assighment6islongenough",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}))

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(express.static("public"));
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
  app.locals.viewingCategory = req.query.category;
  next();
});
app.use(express.urlencoded({extended: true}));



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

app.get("/posts/add", ensureLogin,function(req,res){
  blogservice.getCategories().then((data)=>{
    res.render("addPost", {categories: data});
  }).catch((err)=>{
    res.render("addPost", {categories: []}); 
  })
});

app.get("/categories/add", ensureLogin,function(req,res){
  res.render('addCategory',{
    layout: 'main'
  });
});

app.get('/categories/delete/:id',ensureLogin, (req, res) => {
  blogservice.deleteCategoryById(req.params.id).then((data) => {
      res.redirect("/categories")

  }).catch((error) => {
      console.log(error)
      res.status(500).send("Unable to Remove Category / Category not found!")
  })    
})

app.get('/posts/delete/:id',ensureLogin, (req, res) => {

  blogservice.deletePostById(req.params.id).then((data) => {
      res.redirect("/posts")

  }).catch((error) => {
      console.log(error)
      res.status(500).send("Unable to Remove Post / Post not found!")
  })    
})
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


app.get("/posts", ensureLogin,(req,res)=>{
  if(req.query.category){
      blogservice.getPostsByCategory(req.query.category).then((data) => {
        if(data.length >0){
          res.render("posts", {posts: data});}
        else{
          res.render("posts",{ message: "no results" });
        }
    }).catch((error) => {
        res.render("posts", {message: "no results"});
    })    
  }
  else if(req.query.minDate){
      blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
        if(data.length >0){
          res.render("posts", {posts: data});}
        else{
          res.render("posts",{ message: "no results" });
        }
    }).catch((error) => {
        res.render("posts", {message: "no results"});
    })
  }
  else{
    blogservice.getAllPosts().then((data) => {
      //res.json(blogservice);
      if(data.length >0){
        res.render("posts", {posts: data});}
      else{
        res.render("posts",{ message: "no results" });
      }
    })
    .catch((err)=>{
      res.render("posts", {message: "no results"});
    })
}
});



app.get('/posts/:id', ensureLogin,(req, res) => {
  blogservice.getPostById(req.params.id).then((data) => {
      res.json({data});
  }).catch((error) => {
      console.log(error)
      res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
  })    
})

app.get("/categories",ensureLogin, function(req,res){
  blogservice.getCategories().then((data) => {
    if(data.length >0){
      res.render("categories", {categories: data});}
    else{
      res.render("categories", {message: "no results"});
    }
  })
  .catch((err)=>{
    
    res.render("categories", {message: "no results"});
  });
});

app.post('/posts/add',upload.single('featureImage'),ensureLogin,(req,res)=>{

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

});

})

app.post('/categories/add',ensureLogin,(req,res)=>{
    blogservice.addCategory(req.body).then(() => {
      res.redirect('/categories')
  }).catch((error) => {
      res.status(500).send(error);
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

app.get('/login', (req, res) => {
  res.render('login', {
      layout: "main"
  }) 
})

app.post('/login',(req, res) => {

  // some mongoose CREATE function that takes in req.body and creates a new user document 
  
  req.body.userAgent = req.get('User-Agent');
  // req.body now has username, password, AND userAgent

  authData.checkUser(req.body).then((mongoData) => {

      req.session.user = {
          userName: mongoData.userName,
          email: mongoData.email,
          loginHistory: mongoData.loginHistory 
      }
      res.redirect("/posts")
  }).catch((err) => {
    res.render("login", {errorMessage:err, userName:req.body.userName} )
  })
  

})

app.get('/register', (req, res) => {
  res.render('register', {
      layout: "main"
  }) 
})

app.post('/register',(req, res) => {

  // some mongoose CREATE function that takes in req.body and creates a new user document 
  authData.registerUser(req.body).then((data) => {
      console.log(data)
      res.render('register', {
          layout: "main",
          successMessage: "USER CREATED"
      })
  }).catch((error) => {
      console.log(error)
      res.render('register', {
          layout: "main",
          errorMessage: error,
          userName: req.body.userName
      })
  })
})

app.get("/logout", (req,res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req,res) => {
  res.render("userHistory",{
    layout: "main"
  }) 
});

// optional 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname,"/public/css/000-404.png"));
});

// setup http server to listen on HTTP_PORT
blogservice.initialize()
.then(authData.initialize)
.then(()=>{
  app.listen(HTTP_PORT, onHttpStart);
}).catch(err=>{
  console.log(err);
});

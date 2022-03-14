//define global array
let posts =[]
let categories =[]
var fs = require ("fs");


// Initializer
module.exports.initialize = function(){
  return new Promise(function(resolve, reject){
        fs.readFile('./data/posts.json', (err, data)=> {
            if (err) reject("unable to read file");
            else{
              posts = JSON.parse(data);
              fs.readFile("./data/categories.json",(err,data)=>{
                if(err) reject ("unable to read file");
                else{
                  categories = JSON.parse(data);
                  resolve();
                }
              });
            }
        });
      });
    };


// Get all posts
module.exports.getAllPosts = function(){
    return new Promise((resolve, reject)=>{
        if(posts.length == 0){
            reject("No result returned");
        }
        else{
          resolve(posts);
        }
    });
  }
 
 
  //Get all published posts
  module.exports.getPublishedPosts = function(){
    let publishedPosts =[];
    for(let i=0;i<posts.length;i++){
      if(posts[i].published == true){
        publishedPosts.push(posts[i]);
      }
    }
    return new Promise((resolve, reject)=>{
        if(publishedPosts.length == 0){
          reject("No result returned");
        }
        else{
          resolve(publishedPosts);
        }
    });
  }
    

//Get all categories
module.exports.getCategories = function(){
  return new Promise((resolve, reject)=>{
      if(categories.length == 0){
          reject("No result returned");
      }
      else{
        resolve(categories);
      }
  });
}


module.exports.addPost = function(postData){
  postData.published == undefined ? postData.published = false : postData.published = true;
  postData.id = posts.length + 1;
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  postData.postDate = date;
  posts.push(postData);
  return new Promise((resolve,reject)=>{
      if(posts.length == 0){
        reject ("No posts added")
      }else{
        resolve(posts);
      }
  });
}

module.exports.getPublishedPostsByCategory = function(category){
  let PublishedPostsByCategory =[];
  for(let i=0;i<posts.length;i++){
    if(posts[i].published == true && posts[i].category == category){
      PublishedPostsByCategory.push(posts[i]);
    }
  }
  return new Promise((resolve, reject)=>{
      if(PublishedPostsByCategory.length == 0){
        reject("No result returned");
      }
      else{
        resolve(PublishedPostsByCategory);
      }
  });
}


//add function of getPostByCategory
module.exports.getPostsByCategory = (category)=>{
  return new Promise((resolve, reject)=>{
    var post_category= posts.filter(posts=> posts.category == category);
      if(post_category.length == 0){
        reject("No result returned");
      }
      else{
        resolve(post_category);
      }
  })
};

//add function of getPostByminDate
module.exports.getPostsByMinDate = (minDatestr)=>{
  return new Promise((resolve, reject)=>{
    var post_date= posts.filter(posts=> newDate(posts.postDate) >= newDate(minDatestr));
      if(post_date.length == 0){
        reject("No result returned");
      }
      else{
        resolve(post_date);
      }
  })
};

//add function of getPostByID
module.exports.getPostById = (id)=>{
  return new Promise((resolve, reject)=>{
    var post_id = posts.find(posts=> posts.id == id);
      if(post_id.length == 0){
        reject("No result returned");
      }
      else{
        resolve(post_id);
      }
  })
};
//define global array
let posts =[]
let categories =[]
let publishedPosts =[]
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
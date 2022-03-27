
const Sequelize = require('sequelize');
var sequelize = new Sequelize('d6j6i1oc0ig4uk', 'misgbzhylombik', 'f2ce43fff0091087708e09544efdf1aad9e3f462ba0aabd9fd07adb16780ca1e', {
    host: 'ec2-18-215-96-22.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category',{
  category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

// Initializer
module.exports.initialize = function(){
  return new Promise((resolve, reject) => {
    sequelize.sync().then(() => {
      resolve()
  }).catch((error) => {
      console.log(error)
      reject("unable to sync the database")
  })
})}


// Get all posts
module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
      Post.findAll().then((data) => {
          resolve(data)
      })
      .catch((error) => {
          console.log(error)
          reject("no result returned")
      })
    })

  }
 
 
  //Get all published posts
  module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
      Post.findAll({
        where:{ published: true}
      }).then((data) => {
        resolve(data)
    })
    .catch((error) => {
        console.log(error)
        reject("no result returned")
    })
  })

  }
    

//Get all categories
module.exports.getCategories = function(){
  return new Promise((resolve, reject) => {
    Category.findAll().then((data) => {
        resolve(data)
    })
    .catch((error) => {
        console.log(error)
        reject("no result returned")
    })
  })

}


module.exports.addPost = function(postData){
  postData.published = (postData.published) ? true : false;
  return new Promise((resolve, reject) => {
      for (var i in postData) {
        if (postData[i] == "") { postData[i] = null; }
      }
      var today = new Date();
      //postData.postDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      postData.postDate = today;
      Post.create(postData).then(() => {
          console.log("POST CREATED")
          resolve()
      }).catch((error) => {
          console.log(error)
          reject("POST ERROR:")
      })

  })

}
module.exports.addCategory = function(categoryData){
  return new Promise((resolve, reject) => {
      for (var i in categoryData) {
        if (categoryData[i] == "") { categoryData[i] = null; }
      }
      Category.create(categoryData).then(() => {
          console.log("CATEGORY CREATED")
          resolve()
      }).catch((error) => {
          console.log(error)
          reject("CATEGORY ERROR:")
      })

  })

}

module.exports.getPublishedPostsByCategory = function(category){
  return new Promise((resolve, reject) => {
    Post.findAll({
      where:{
        category: category,
        published:true
      }
    }).then((data) => {
      resolve(data)
  })
  .catch((error) => {
      console.log(error)
      reject("no result returned")
  })
  })

}


//add function of getPostByCategory
module.exports.getPostsByCategory = (category)=>{
  return new Promise((resolve, reject) => {
    Post.findAll({
      where:{
        category: category
      },
    }).then((data) => {
      resolve(data)
  })
  .catch((error) => {
      console.log(error)
      reject("no result returned")
  })
  })


};
//{{#formatDate data.post.postDate}}{{/formatDate}}
//add function of getPostByminDate
module.exports.getPostsByMinDate = (minDatestr)=>{
  return new Promise((resolve, reject) => {
    const {gte} = Sequelize.Op;
    Post.findAll({
      where:{
        postDate: {
        [gte]: new Date(minDatestr)
         
      }}
    }).then((data) => {
      resolve(data)
  })
  .catch((error) => {
      console.log(error)
      reject("no result returned")
  })
  })

};

//add function of getPostByID
module.exports.getPostById = (id)=>{
  return new Promise((resolve, reject) => {
    Post.findAll({
      where:{id: id}
    }).then((data) => {
      resolve(data[0])
  })
  .catch((error) => {
      console.log(error)
      reject("no result returned")
  })
  })
};


module.exports.deleteCategoryById = (id)=>{
  return new Promise((resolve, reject) => {
    Category.destroy({
        where: {
            id: id
        }
    }).then(() => {
        console.log("CATEGORY DELETED")
        resolve()
    }).catch((error) => {
        console.log("CATEGORY DELETE ERROR:")
        console.log(error)
    })
  })
};

module.exports.deletePostById = (id)=>{
  return new Promise((resolve, reject) => {
    Post.destroy({
        where: {
            id: id
        }
    }).then(() => {
        console.log("POST DELETED")
        resolve()
    }).catch((error) => {
        console.log("POST DELETE ERROR:")
        console.log(error)
    })
  })
};


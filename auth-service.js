var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
var userSchema  = new Schema({
  "userName": {
    type: String,
    unique: true
  },
  "password": String,
  "email": String,
  "loginHistory": [{
    "dateTime": Date,
    "userAgent": String
  }]
});

let User; 

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
      let db = mongoose.createConnection("mongodb+srv://ccitong:ccitong@senecaweb.fwwm7.mongodb.net/web322_assignment6?retryWrites=true&w=majority");

      db.on('error', (err)=>{
          reject(err); 
      });
      db.once('open', ()=>{
         User = db.model("users", userSchema);
         resolve();
      });
  });
};

module.exports.registerUser = function(userData) {
  return new Promise(function (resolve, reject) {
      if (userData.password === userData.password2) {
        bcrypt.hash(userData.password, 10, function(err, hash) {
          if (err) {
              reject("There was an error encrypting the password!");
          }
          userData.password = hash;
          let newUser = new User(userData)

          newUser.save((err) => {
              if(err) {
                if(err.code == 11000 ){
                  reject("User Name already taken!")
                } else{
                console.log(err);
                reject("Error creating new user:" + err)}
              } else {
                // everything good
                console.log(newUser);
                resolve(userData);
              }
            });
          })
      } else {
          reject("PASSWORDS DO NOT MATCH!!")
      }    
  });
};

module.exports.checkUser = function(userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName }).exec()
    .then((users) => {
        bcrypt.compare(userData.password, users[0].password, function (err, res) {
            if (res === true) {
               users[0].loginHistory.push({ 
                dateTime: (new Date()).toString(),
                userAgent: userData.userAgent
                });
                User.updateOne(
                  { userName: users[0].userName },
                  { $set: { loginHistory: users[0].loginHistory } }
                ).exec()
                .then(function() { 
                    resolve(users[0]);
                })
                .catch(function(err) { 
                    reject("There was an error verifying the username: " + err);
                });
            } else if (res === false) {
                reject("Incorrect Password for user: " + userData.userName);
            }
        });
    })
    .catch(function() {
        reject("Unable to find user: " + userData.userName);
    }); 
})
}



  


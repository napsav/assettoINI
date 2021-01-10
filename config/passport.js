const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../models/user");
module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField : 'name'},(name,password,done)=> {
                //match user
                User.findOne({name : name})
                .then((user)=>{
                 if(!user) {
                     return done(null,false,{message : 'Nome inesistente'});
                 }
                 //match pass
                 bcrypt.compare(password,user.password,(err,isMatch)=>{
                     if(err) throw err;

                     if(isMatch) {
                         return done(null,user);
                     } else {
                         return done(null,false,{message : 'Password errata'});
                     }
                 })
                })
                .catch((err)=> {console.log(err)})
        })
        
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      }); 
}; 
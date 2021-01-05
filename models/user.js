require('dotenv').config()
const mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.8lrnq.mongodb.net/utenti-resetfocus?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const UserSchema  = new mongoose.Schema({
    name :{
        type  : String,
        required : true
    },
    password :{
        type  : String,
        required : true
    },
    date :{
        type : Date,
        default : Date.now
    },
    admin :{
        type : Boolean,
        default : false
    }
});
const User= mongoose.model('User',UserSchema);

module.exports = User;
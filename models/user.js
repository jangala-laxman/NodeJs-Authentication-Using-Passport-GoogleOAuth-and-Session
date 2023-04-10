
const mongoose = require('mongoose')
mongoose.set('strictQuery',true)
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        // required:true
    },
    age:{
        type:Number,
        min:[21,'minimum age is 21 years']
    },
    password:{
        type:String,
        // required:true,
        // min:[8, "password must be greater than 8 characters"], 
        // max:[16,"password should not exceed 16 characters"]
    },
    confirm_password:{
        type:String,
        // required:true
    },
    isVerified:{
        type:Boolean
    },
    // token:{
    //     type:String,
    //     required:false,
    // },
    // expiresIn:{
    //     type:Date,
    //     required:true
    // },
    provider:{
        type:String,
        enum:["google"]
    }
})

// mongoose.set('useFindAndModify', false)
module.exports = mongoose.model('Users',userSchema)

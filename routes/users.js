const express = require('express')
const flash = require('connect-flash')
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const Token = require('../models/token')
const Noty = require('noty')
const {sendEmail} = require('../controllers/sendEmail')
const alert = require("alert")

require('dotenv').config()
router.get('/sendEmail', sendEmail )

router.get('/signUp', async(req,res)=>{
    res.render('signUp')
})
router.get('/signIn', async(req,res)=>{
    res.render('signIn')
})
 
router.post('/signUp',async (req,res)=>{
    try{
        let user = await User.findOne({email:req.body.email})
        if(user){
            
            res.send("User already exists!!")
        }
        // const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
        const password = req.body.password
        const confirm_password = req.body.password
        const hashPassword = await bcrypt.hash(password, 10)    
        if(password !== confirm_password){
            alert("password and confirm password are not matching")
            res.send("password and confirm password are not matching")
        }       
        console.log(hashPassword) 
        const token = await crypto.randomBytes(32).toString('hex')
        
        const user1 = new User({
            username:req.body.username,
            email:req.body.email,
            age:req.body.age,
            password:hashPassword,
            isVerified:false     
        })   
        await user1.save()
        await Token.create({
            userId:user1._id,
            token:token,
            createdAt:Date.now()
        })
        const html = `<h4>please click the link below to verify your email</h4></br>
        <a href='http://localhost:3000/user/verify/${user1._id}/${token}'>Click here to verify</a>`
        res.send("Please check your inbox and verify your email id. Please login back again using your credentials")
        sendEmail(req.body.email, "Verify your email", html)
    }catch(err){
        console.log(err)
        res.redirect('/user/signUp')
    }
})


//login user
router.post('/signIn',async (req,res)=>{
    try{
        const email = req.body.email;
        const user = await User.findOne({email:email})
        // console.log(req.session)
        if(req.session.user){
            alert("You already logged in")
            // return res.send("You already logged in")
        }
        if(user){
            
            const compare = await bcrypt.compare( req.body.password, user.password)
            if(compare){
                req.session.user = user
                alert("welcome home")
                res.render('home',{user:req.session.user, session:req.session})
            }
            else{
                alert("wrong password")
                console.log("wrong password")
                // res.send("wrong username or password")
            }
        }
        else{
            alert("wrong password or Password")
            res.send("Wrong username or Password")
        }    
    }catch(err){
        console.log(err)
        res.status(500).send("internal server error")
    }
})





//get request - update their data
router.get("/update/:id", async (req,res)=>{
   try{
    const user = await User.findByIdAndUpdate(req.params.id)
    res.render('/views/signUp', {user:user})
   }catch(err){
        console.log(err)
        res.json(err);
   }
})


router.get("/update/:id", async (req,res)=>{
    try{
     await User.findByIdAndUpdate(req.params.id, {
         username:req.body.username,
         email:req.body.email,
         age:req.body.age
     })
     res.redirect('/')
    }catch(err){
         console.log(err)
         res.json(err);
    }
})


router.get('/verify/:id/:token', async(req,res)=>{
    try{
        const user =await User.findById({
            _id:req.params.id,
        })
        if(!user){
            res.send(`User not exists. Please <a href="http://localhost:3000/user/signUp">Sign Up</a> here`)
        }
     
        const token = await Token.findOne({userId:req.params.id}) 
        if(!token){
            res.send("Invalid link or expired link")
        }
        const valid = bcrypt.compare(req.params.token, token.token)
        if(!valid){
            res.send("Invalid link or expired link")
        }
        await user.updateOne({
            isVerified:true
        })
        res.send('your email is verified')
    }catch(err){
        console.log(err)
        res.send(err)
    }

})

router.get('/resetPassword/:id/:token', async(req,res)=>{
    const user =await  User.findById({
        _id:req.params.id,
    })
    const token = await Token.findOne({userId:user._id}) 
    if(!token){
        res.send("Invalid link or expired link")
    }
    const valid = bcrypt.compare(req.params.token, token.token)
    if(!valid){
        res.send("Invalid link or expired link")
    }
    if(!user){
        res.send("User not exists")
    }

    console.log(user.username, token.token)   
    res.render('resetPassword',{user:user, token:token.token})
})

router.post('/resetPassword/:id/:token',async(req,res)=>{
    
    try{
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        const user = await User.findByIdAndUpdate({_id:req.params.id})
        
        await user.updateOne({
            $set:{password:hashPassword}
        })
        const date = Date.now()
        const html = `<h3>You password has reset successfully at ${date}</h3>`

        await sendEmail(user.email, "Password Reset successfull", html)
        res.send("password reset successfully")
    }catch(err){
        console.log(err)
        res.send(err)
    }
})

router.get('/reset', async(req,res)=>{
    res.render('Enteremail')
})

router.post('/reset',async(req,res)=>{
    const user = await  User.findOne({email:req.body.email})
    if(!user){
        res.send("user not found")
    }

    let token = await Token.findOne({userId:user._id})
    if(token){
        await Token.deleteOne()
    }
    const newToken = crypto.randomBytes(32).toString('hex')
    const hashToken = await bcrypt.hash(newToken, 10)
    await Token.create({
        userId:user._id,
        token:hashToken,
        createdAt:Date.now(),
    })
   
    const html = `<a href="http://localhost:3000/user/resetPassword/${user.id}/${newToken}">Click here to reset your password</a>`
    sendEmail(req.body.email, "Reset",html)
    res.send("please check your email and reset your password on clicking the link provided <br/><br/><a href='/user/signin'>Login here</a>")
    
})


router.get('/logout', async(req,res)=>{
    req.session.user = null
  req.session.save(function (err) {
    if (err) next(err)
    req.session.regenerate(function (err) {
      if (err) {
    console.log(err)

      next(err)
      
    }
      res.send(`logout successful <br/><br/><a href='/user/signin'>Login here</a>`)
    })
  })
    // res.render('home', {session:null, user:null})
})


module.exports = router

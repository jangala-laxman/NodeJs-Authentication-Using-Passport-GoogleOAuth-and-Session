const express = require('express')
const passport = require('passport')
const session = require('express-session')
const router = express.Router()
require('../routes/passport-google-setup')

router.use(session({
    secret:'laxman',
    saveUninitialized:true,
    resave:false,
    cookie:{
        maxAge:1000*60*60*24
    }
}))

router.use(passport.initialize())
router.use(passport.session())

router.get('/signIn', (req,res)=>{
    res.send("<a href='/auth/google/callback'>Sign in with google</a>")
})

router.get('/auth/google',passport.authenticate('google',{
    scope:['profile','email']
}))


router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth/google/callback/failure",
      successRedirect: "/auth/google/callback/success",
    })
  );

  //success
router.get('/auth/google/callback/success' , (req , res) => {
    if(!req.user)
        res.redirect('/auth/google/callback/failure');
    res.send("Welcome " + req.user.email + `<br/> <a href="/home">Home page</a> ` );
});
  
// failure
router.get('/auth/google/callback/failure' , (req , res) => {
    res.send("Error");
})
  
router.get("/logout",(req,res)=>{
   if(req.session.user){
        req.logout((err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("logout successfull")
        }
   })
    return res.render('home', {user:req.session.user, session:req.session})
   }else{
    return res.send("No user to logout")
   }
})

module.exports = router
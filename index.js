const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const User = require('./models/user')
const Token = require('./models/token')
const userRouter =   require('./routes/users')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const googleRouter = require('./routes/googleRoute')
const flash = require('connect-flash')
const dotenv = require('dotenv')
const MemoryStore = require('memorystore')(session)
dotenv.config()
require('./routes/passport-google-setup')
// require('./routes/googleRoute')

mongoose.connect('mongodb://127.0.0.1:27017/users',
                 {useNewUrlParser: true})
.then((res)=> console.log("MongoDB connected"))
.catch((err)=> console.error("Connection failed", err));

const db = mongoose.connection

db.on('error',console.error.bind(console, "connection error"))
db.once('open',()=>{console.log('connection successful')})

app.set('view engine', 'ejs')
// app.set('view engine', 'html')

app.set('views', __dirname+ '/views')
app.set('layout','./layouts/layouts')
app.use('/', googleRouter)
app.use(bodyParser.urlencoded({extended:true}))
app.use(expressLayouts)
app.use(cookieParser())

app.use(session({
    secret:"Laxman",
    resave:true, 
    saveUninitialized:true,
    store:new MemoryStore({
        ttl:1000,
        mongoUrl:"mongodb://127.0.0.1:27017/users",
    }),
    cookie:{
        secure:true,
        maxAge: 1000,
    }
}))

app.use('/user',userRouter)

//check authentication whether the user is signed in or not
function checkAuth(req,res,next){
    
    if(req.session.user){
        res.set('Cache-Control', 'no-Cache, private, no-store, must-revalidate, post-chech=0,pre-check=0')
        // res.render('home', {user:req.session.user})
        next()
    }else{
        // res.render('home', {user:req.session.user, session:req.session})
        next()
    }
}

// app.get('/', (req, res)=>{
//     res.sendFile('index.html')
// })

app.get('/', checkAuth ,async (req,res)=>{
    let session;
    try{
        if(req.session.user){
            req.session.user = 'RunChodDaas'
            const user = await User.find()
    
            console.log(req.session)
            req.session.save(err => {
                if(err){
                    console.log(err);
                } else {
                    console.log(req.session.user)
                }
            });
            session = req.session.user
            res.render('home', {user:user, session:req.session})
        }else{
            res.render('home', {user:null, session:null})
        }
    }catch(err){
        console.log(err)
    }
    
    
})

// app.get('/session',(req,res)=>{
//     let name = req.session.name
//     console.log(req.session)
//     res.send(name)
// })
 
app.listen(3000,()=>{
    console.log("listening to port:3000")
})
 


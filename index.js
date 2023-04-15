
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const app = express()
// const app = express.app()
const User = require('./models/user')
const userRouter =   require('./routes/users')
const session = require('express-session')
// const mongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const googleRouter = require('./routes/googleRoute')
const flash = require('connect-flash')
const serverless = require('serverless-http')
const MemoryStore = require('memorystore')(session)
require('dotenv').config()
let alert = require("alert")
require('./routes/passport-google-setup')
// require('./routes/googleRoute')

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://laxman:L1u9c9k9y@cluster0.letk1.mongodb.net/?retryWrites=true&w=majority"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.set('layout', 'layouts/layouts')
app.set('view engine', 'ejs')
// app.set('')
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
        mongoUrl:"mongodb://localhost:27017/users",
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


app.get('/home', async(req,res)=>{
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

app.use(flash())

// const app= express()
const router = express.Router()
// const serverless = require('serverless-http')

router.get("/", (req, res)=>{
    res.redirect("/home")
})

app.use('/.netlify/functions/api', router)
module.exports.handler = serverless(app)


app.listen(3000, ()=>{
    console.log("listening to port 3000")
})
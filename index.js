const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const app = express();
// const app = express.app()
const User = require("./models/user");
const userRouter = require("./routes/users");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const googleRouter = require("./routes/googleRoute");
const flash = require("connect-flash");
const serverless = require("serverless-http");
// const MemoryStore = require('memorystore')(session)
require("dotenv").config();
let alert = require("alert");
require("./routes/passport-google-setup");
// require('./routes/googleRoute')

const uri =
  "mongodb+srv://laxman:L1u9c9k9y@cluster0.letk1.mongodb.net/users?authSource=+Cluster0&authMechanism=SCRAM-SHA-1";

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

connectDB();

app.set("layout", "layouts/layouts");
app.set("view engine", "ejs");
// app.set('')
app.use("/", googleRouter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(cookieParser());

// app.use(session({
//     secret:"Laxman",
//     resave:true,
//     saveUninitialized:true,
//     store:new MemoryStore({
//         ttl:1000,
//         mongoUrl:"mongodb+srv://laxman:L1u9c9k9y@cluster0.letk1.mongodb.net/test?authSource=+Cluster0&authMechanism=SCRAM-SHA-1",
//     }),
//     cookie:{
//         secure:true,
//         maxAge: 1000,
//     }
// }))

app.use(
  session({
    secret: "SECRET KEY",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      url: "mongodb+srv://laxman:L1u9c9k9y@cluster0.letk1.mongodb.net/users?authSource=+Cluster0&authMechanism=SCRAM-SHA-1",
      ttl: 300 * 1000,
      autoRemove: "native",
    }),
  })
);

// app.use(session({
//         secret: "Laxman",
//         cookie: {
//             maxAge: 60000 * 60, //1Sec * 1H = 1 Hour
//             secure:  process.env.NODE_ENV !== "production"? false : true
//         },
//         resave: true,
//         saveUninitialized: true,
//       store: MongoStore.create({ mongoUrl: "mongodb+srv://laxman:L1u9c9k9y@cluster0.letk1.mongodb.net/test?authSource=+Cluster0&authMechanism=SCRAM-SHA-1"}),
//     })
// );

app.use("/user", userRouter);

//check authentication whether the user is signed in or not
function checkAuth(req, res, next) {
  if (req.session.user) {
    res.set(
      "Cache-Control",
      "no-Cache, private, no-store, must-revalidate, post-chech=0,pre-check=0"
    );
    // res.render('home', {user:req.session.user})
    next();
  } else {
    // res.render('home', {user:req.session.user, session:req.session})
    next();
  }
}

// app.get('/', (req, res)=>{
//     res.sendFile('index.html')
// })

app.get("/", checkAuth, async (req, res) => {
  let session;
  try {
    if (req.session.user) {
      req.session.user = "RunChodDaas";
      const user = await User.find();

      console.log(req.session);
      req.session.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(req.session.user);
        }
      });
      session = req.session.user;
      res.render("home", { user: user, session: req.session });
    } else {
      res.render("home", { user: null, session: null });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/home", async (req, res) => {
  let session;
  try {
    if (req.session.user) {
      req.session.user = "RunChodDaas";
      const user = await User.find();

      console.log(req.session);
      req.session.save((err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(req.session.user);
        }
      });
      session = req.session.user;
      res.render("home", { user: user, session: req.session });
    } else {
      res.render("home", { user: null, session: null });
    }
  } catch (err) {
    console.log(err);
  }
});

app.use(flash());

// const app= express()
const router = express.Router();
// const serverless = require('serverless-http')

router.get("/", (req, res) => {
  res.redirect("/home");
});

app.listen(3000, () => {
  console.log("listening to port 3000");
});

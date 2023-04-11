const express = require('express')
const app= express()
const router = express.Router()
const serverless = require('serverless-http')

router.get("/", (req, res)=>{
    res.render("home")
})

app.use('/.netlify/functions/api', router)
module.exports.handler = serverless(app)
 
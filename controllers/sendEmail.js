const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports.sendEmail = async(email, subject, html)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:process.env.HOST,
            service:process.env.service,
            secure:true,
            auth:{
                user:process.env.user,
                pass:process.env.mail_password
            },
            port:465            
        })
    await transporter.sendMail({
        from:process.env.user,
        to:email,
        subject:subject,
        html:html
    })

    }catch(err){
        console.log(err, "email failed to sent")
    }
}


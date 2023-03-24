const mongoose =require("mongoose")
const express = require('express')
const Token = require("../models/token")
const User = require("../models/user")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')




const requestPasswordReset = async(email)=>{
    const user = await User.findOne({email})

    if(!user) res.send("User doesn't exist")
    let token = await Token.findOne({userId:user._id})
    if(token) await Token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString('hex')
    const hash = await bcrypt.hash(resetToken, 10)

    await new Token({
        userId:user._id,
        token:hash,
        createAt:Date.now()
    }).save()


    const link = `http://localhost:3000/passwordReset?token=${resetToken}&id=${user._id}`
    sendEmail(user.email,"password Reset Request", {name:user.name, link:link}, './resetPassword.ejs' )
    return link
}


const resetPassword = async (userId, token, password)=>{
    let passwordResetToken = await Token.findOne({userId});
    if(!passwordResetToken){
        res.send("Invalid or expired password")
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token)
    if(!isValid){
        res.send("Invalid or expired passwrod reset token")
    }
    const hash = bcrypt.hash(password, 10)
    await User.updateOne(
        {_id:userId},
        {$set:{password:hash}},
        {new:true}
    )
    const user = await User.findById({id:userId});
    sendEmail(
        user.email,
        "password reset successfully",
        {name:user.name},
        "resetPassword.ejs"
    )
    await passwordResetToken.deleteOne();
    return true;
}

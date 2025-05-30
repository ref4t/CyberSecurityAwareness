
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import userModel from "../Models/UserModel.js";
import transporter from "../Config/nodemailer.js";

// user registration

export const registration = async (req,res) => {
    const {name,email,password} = req.body;
    // all fields exists check
    if(!name || !email || !password){
        return res.json({success:false, message: 'Missing Fields'});
    }

    try{
        //checking for existing user with same email
        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.json({success:false, message: 'User Already Exists'});
        }
        // encrypting the pass
        const hashedPass = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password:hashedPass});

        await user.save();

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token',token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'Prod',
            sameSite: process.env.NODE_ENV === 'Prod' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        })

        //welcome email sending
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Cyber Security Awareness Website!',
            text: 'Welcome to the Cyber Security Awareness Website. Your account has been created successfully'
        }

        await transporter.sendMail(mailOptions);

        return res.json({success:true});

    }catch(error){

        res.json({success:false, message: error.message});
    }

}

export const login = async(req,res) => {
    const {email,password} = req.body;
    if( !email || !password){
        return res.json({success:false, message: 'Both Email and Password is Required'});
    }

    try {
        const existingUser = await userModel.findOne({email});
        if(!existingUser){
            return res.json({success:false, message: 'User Doesn\'t Exists'});
        }
        const isMatch = await bcrypt.compare(password,existingUser.password);

        if(!isMatch){
            return res.json({success:false, message: 'Email or Password is Wrong'});
        }

        const token = jwt.sign({id:existingUser._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token',token, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'Prod',
            sameSite: process.env.NODE_ENV === 'Prod' ? 'none' : 'strict',
        })

        return res.json({success:true});

    } catch (error) {

        res.json({success:false, message: error.message});
        
    }
}

export const logout = async(req,res) => {

    try{
        res.clearCookie('token', {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'Prod',
            sameSite: process.env.NODE_ENV === 'Prod' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000
        })

        return res.json({success:true, message: "Logged out"});

    } catch (error) {

        res.json({success:false, message: error.message});
    }
}

export const emailVerifyOtp =  async (req,res) => {
    try {
       const userId = req.user.id;
        console.log(userId);
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success: false, message:'Account already Verified'});
        }

        const otp = String(Math.floor(100000+Math.random()*900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your accout',
            text: `Your opt is ${otp}`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success:true, message: "Verification Email has been sent"});

    } catch (error) {

        return res.json({success:false, message: error.message});
    }
}

export const verifyOtp = async (req,res) => {
    const {userId,otp} = req.body;

    if(!userId || !otp){
        return res.json({success:false, message: "Missing details"});

    }

    try {
        const user= await userModel.findById(userId);
        if(!user){
            return res.json({success:false, message: "User Not found"});
        }
        if(user.verifyOtp != otp){
            return res.json({success:false, message: "Invalid OTP"});
        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false, message: "OTP Expired"});
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.json({success:true, message: "Email Verified successfully"});

    } catch (error) {
       
        return res.json({success:false, message: error.message});
        
    }

}
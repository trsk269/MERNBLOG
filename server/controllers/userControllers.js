const User =require('../models/userModel')
const HttpError =require("../models/errorModel")
const bcryptjs = require('bcryptjs')
const  jwt = require('jsonwebtoken')
const fs =require('fs')
const path=require('path')
const {v4 : uuid} =require('uuid')

//========================== REGISTER A NEW USER
// POST : api/users/register
//unprotected

const registerUser = async (req,res,next) =>{
    try{
       const {name,email,password,password2} =req.body;
       if(!name || !email || !password){
        return next(new HttpError("Fill in the all the Fields"),422)
       }
       const newEmail =email.toLowerCase()
       const emailExists = await User.findOne({email : newEmail})
       
       if(emailExists){
        return next(new HttpError("User Email Already Exists"),422)
       }

       if((password.trim()).length < 6){
        return next(new HttpError("Password should be atleast 6 characters"),422)
       }
       
       if((password != password2)){
        return next(new HttpError("Password do not match"),422)
       }

       const salt = await bcryptjs.genSalt(10)
       const hashedPassword = await bcryptjs.hash(password,salt);
       const newUser =await User.create({name,email:newEmail,password: hashedPassword})
       res.status(201).json(`new User ${newUser.email} registered`)
    }
    catch(err){
        return next(new HttpError("User Registration Error"),422)
    }
}















//========================== LOGIN
// POST : api/users/login
//unprotected

const loginUser = async (req,res,next) =>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return next(new HttpError("Fill in the all the fields"),422)
        }
        const newEmail=email.toLowerCase();
        const user =await User.findOne({email : newEmail})
        if(!user){
            return next(new HttpError("Invalid credentails"),422)
        }
        const comparePass =await bcryptjs.compare(password,user.password)
        if(!comparePass){
            return next(new HttpError("Invalid credentials"),422)
        }

        const {_id : id ,name}=user;
        const token =jwt.sign({id,name},process.env.JWT_SECREAT,{expiresIn : "1d"})

        res.status(200).json({token, id,name})
    }catch(error){
        return next(new HttpError("Login Failed pleace check your credentials"),422)
    }
}
















//========================== USER PROFILE
// POST : api/users/:id
//protected

const getUser = async (req,res,next) =>{
    try{
       const {id} =req.params;
       const user = await User.findById(id).select('-password');
       if(!user){
        return next(new HttpError("User Not Fond"),404)
       }
       res.status(200).json(user);
    }
    catch(error){
        return next(new HttpError(error))
    }
}






















//========================== CHANGE USER AVATAR (profile picture)
// POST : api/users/change-avatar
//protected

const ChangeAvatar = async (req,res,next) =>{
    try{
       if(!req.files.avatar){
        return next(new HttpError("Please choose an image",422))
       }
       //find user from database
       const user= await User.findById(req.user.id)
       //delete old avatar
       if(user.avatar){
        fs.unlink(path.join(__dirname,'..','uploads',user.avatar),(err)=>{
            if(err){
                return next(new HttpError(err))        
            }
        })
       }
       const {avatar} =req.files;
       //check file size
       if(avatar.size>500000){
        return next(new HttpError("Profile picture size is too big. it should be less than 50kb"),422)
       }
       let fileName;
       fileName=avatar.name;
       let splittedFilename =fileName.split('.')
       let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length -1]
       avatar.mv(path.join(__dirname,'..','uploads',newFilename),async (err)=>{
        if(err){
            return next(new HttpError(err))
        }
        const updatedAvatar = await User.findByIdAndUpdate(req.user.id,{avatar : newFilename},{new : true})
        if(!updatedAvatar){
            return next(new HttpError("Avatar could not be updated",422))
        }
        res.status(200).json(updatedAvatar)
       })
    }catch(error){
        return next(new HttpError(error))
    }
}




//========================== Edit User DETAILS (from profile)
// POST : api/users/edit-user
//protected

const editUser = async (req,res,next) =>{
    try{
      const {name,email,currentPassword,newPassword,confirmNewPassword} =req.body;
      if(!name || !email || !currentPassword || !newPassword){
        return next(new HttpError("File in all fields",422))
      }
      //get user from data
      const user = await User.findById(req.user.id);
      if(!user){
        return next(new HttpError("User not found",403))
      }
      //make sure new email doesn't already exists 
      const emailExists = await User.findOne({email});
      //we want to update other details with/without changing the email (which is a unique id because we use it to login)
      if(emailExists && (emailExists._id != req.user.id)){
        return next(new HttpError("email already exists",422))
      }
      //compare current password to db password
      const validateUserPassword =await bcryptjs.compare(currentPassword,user.password);
      if(!validateUserPassword){
        return next(new HttpError("Invalid current password",422))
      }
      if(newPassword!=confirmNewPassword){
        return next(new HttpError("New password do not match",422))
      }
      //hash new password
      const salt = await bcryptjs.genSalt(10)
      const hash =await bcryptjs.hash(newPassword,salt);

      //update user info into data base
      const newInfo =await User.findByIdAndUpdate(req.user.id,{name,email,password:hash},{new : true})
      res.status(200).json(newInfo)
    }catch(error){
        return next(new HttpError)
    }
}



//========================== GET AUTHORS
// POST : api/users/authors
//unprotected

const getAuthors = async (req,res,next) =>{
    try{
       const authors = await User.find().select('-password');
       res.json(authors);
    }catch(error){
        return next(new HttpError(error))
    }
    
}


module.exports = {registerUser,loginUser,getUser,ChangeAvatar,editUser,getAuthors}
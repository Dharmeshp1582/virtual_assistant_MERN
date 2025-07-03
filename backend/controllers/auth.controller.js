import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"


export const signUp = async(req,res) => {
 try {
  const {name, email, password} = req.body;

  const existingEmail = await User.findOne({email});
  if(existingEmail){
    return res.status(400).json({
      message:"Email Already Exists!"
    })
  }
  if(password.length < 6){
    return res.status(400).json({
      message:"password must be at least 6 character"
    })
  }

  const hashPassword = await bcrypt.hash(password,10);
  const user = await User.create({
    name,password:hashPassword,email
  })
   
  const token = await genToken(user._id);

  res.cookie("token",token,{
    httpOnly: true,
    maxAge: 7*24*60*60*1000,
    sameSite: "strict",
    secure:false
  })

  return res.json(201).json(user)
  
 } catch (error) {
    return res.json(201).json({message: `signup error ${error}`})
 }
}

export const Login= async(req,res) => {
 try {
  const { email, password} = req.body;

  const user = await User.findOne({email});
  if(!user){
    return res.status(400).json({
      message:"User Not Found"
    })
  }

  const isMatch = await bcrypt.compare(password,user.password)
  if(!isMatch){
    return res.status(400).json({
      message:"Incorrect password"
    })
  }

  const token = await genToken(user._id);

  res.cookie("token",token,{
    httpOnly: true,
    maxAge: 7*24*60*60*1000,
    sameSite: "strict",
    secure:false
  })

  return res.json(200).json(user)
  
 } catch (error) {
    return res.json(201).json({message: `Login error ${error}`})
 }
}

export const logOut = async (req,res) => {
  try {
     res.clearCookie("token")
     return res.json(200).json({message: "Logout successfully"})
  } catch (error) {
    return res.json(500).json({message:`Logout error ${error}`})
  }
}
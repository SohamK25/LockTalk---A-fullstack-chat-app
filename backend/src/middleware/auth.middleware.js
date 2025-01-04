// to update profile pic first we will check weather user is authenticated or not 
// for that we will make another route which will check user by function 
// protectRoute - which will check the user and call next() function [updateProfile()]

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req,res,next) =>{
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message: "Unauthorized - No token Provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Token Invalid"})
        }
        // console.log("Decoded Token:", decoded);

        const user = await User.findById(decoded.userID).select("-password");
        // console.log("Fetched User:", user);

        if(!user){
            return res.status(404).json({message: "User not found"})
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("Error in middleware", error.message)
        res.status(500).json({message: "Internal server error"});
    }
}
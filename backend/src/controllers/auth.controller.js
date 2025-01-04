import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password){
            return res.status(400).json({message: "Please enter all the details"});
        }
        // to hash password package bcrypt is used
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "User already exists" })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            //generating jwt here
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })

        } else {
            return res.staus(400).json({ message: "Inavalid user data" })
        }

    }catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal server error" });
}
};

export const login = async (req, res) => {
    const {email, password} = req.body
    try{
        if(!email || !password){
            res.status(400).json({message: "Please enter all details"});
        }

        const user = await User.findOne({email})
        if (!user) return res.status(400).json({ message: "Invalid Credentials" })

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    }catch(error){
        console.log("Error in Signing In", error.message)
        res.status(500).json({message: "Internal server error"});
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0})
        return res.status(200).json({message: "Logged Out Successfully"})
    } catch (error) {
        console.log("Error in Signing Out", error.message)
        res.status(500).json({message: "Internal server error"});
    }
}; 


export const updateProfile = async (req, res) =>{
    try {
        const { profilePic } = req.body;
        const userId = req.user._id

        if(!profilePic){
            return res.status(400).json({ message: "Profile Picture is required." })
        }

        const uploadResponce = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponce.secure_url}, {new:true})

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in UpdateProfile controller", error.message)
        res.status(500).json({message: "Internal server error"});
    }
};
 
//checks if user is authenticated every time when we refresh the page
export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user)
    }catch(error){
        console.log("Error in chekAuth Controller", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}
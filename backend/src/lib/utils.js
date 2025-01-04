//this function generates a token and we will call it in our required files
// token will be stored in cooki and will expire in 7 days.
// so user need to login again after 7 days.

import jwt from 'jsonwebtoken'
export const generateToken = (userID, res) =>{
    const token = jwt.sign({userID}, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })

    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 1000, //convering 7 days in miliseconds
        httpOnly: true, //adds more security
        sameSite: "strict", //CSRF = cross-site request forgery attack
        secure: process.env.NODE_ENV !== "development" 
    })

    return token;
} 
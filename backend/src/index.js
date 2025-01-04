import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js'
import { connectDB } from './lib/db.js';
import { app, server } from './lib/socket.js';  //adding socket.io server makes code more modular
import path from 'path';

dotenv.config();

app.use(express.json());
app.use(cors(
   {
    origin: "http://localhost:5173",
    credentials: true,
   }
))
app.use(cookieParser()); //allow us to parse the cookie

const PORT = process.env.PORT;
    const __dirname = path.resolve();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
    }

//calling the server from the socket.js file
server.listen(PORT, () =>{
    console.log('Server is running on Port:' + PORT)
    connectDB();
});
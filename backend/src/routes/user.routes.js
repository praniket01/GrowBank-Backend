import express from 'express';
import { searchUser } from '../controller/user.Controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js';


const userrouter = express.Router();


userrouter.get('/search', authMiddleware, searchUser);



export default userrouter;
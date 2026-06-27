import express from 'express'
import {userRegisterationController,userLoginController} from '../controller/auth.Controller.js';

const router = express.Router();

router.post('/register' , userRegisterationController );

router.post('/login' , userLoginController );

export default router;
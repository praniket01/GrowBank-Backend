import express from 'express';
import {createAccountController} from '../controller/account.Controller.js'
import {authMiddleware} from '../middlewares/auth.middleware.js';

const accountrouter = express.Router();


accountrouter.post('/', authMiddleware, createAccountController);


export default accountrouter;
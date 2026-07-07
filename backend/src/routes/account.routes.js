import express from 'express';
import {createAccountController,getAccountBalance,getUser} from '../controller/account.Controller.js'
import {authMiddleware} from '../middlewares/auth.middleware.js';


const accountrouter = express.Router();


accountrouter.post('/', authMiddleware, createAccountController);

accountrouter.post('/balance', authMiddleware, getAccountBalance);

accountrouter.get('/user', authMiddleware, getUser);



export default accountrouter;
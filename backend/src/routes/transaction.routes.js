import {Router} from 'express';
import {authMiddleware,authSystemUserMiddleware} from '../middlewares/auth.middleware.js'
import {createTransaction,createInitialFunds } from '../controller/transaction.controller.js';

const transactionRoutes = Router();

transactionRoutes.post("/" , authMiddleware, createTransaction);

transactionRoutes.post('/create-initial-funds',authSystemUserMiddleware,createInitialFunds)

export default transactionRoutes;
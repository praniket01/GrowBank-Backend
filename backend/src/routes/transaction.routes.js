import {Router} from 'express';
import {authMiddleware,authSystemUserMiddleware} from '../middlewares/auth.middleware.js'
import {createTransaction,createInitialFunds,initiateTransfer } from '../controller/transaction.controller.js';
import { sendTransactionOtp, verifyTransactionPin, verifyTransactionOtp } from '../controller/security.controller.js';

const transactionRoutes = Router();

transactionRoutes.post("/" , authMiddleware, createTransaction);

transactionRoutes.post('/initiate',authMiddleware, initiateTransfer);

transactionRoutes.post('/create-initial-funds',authSystemUserMiddleware,createInitialFunds)

transactionRoutes.post('/security/verify-pin',authMiddleware, verifyTransactionPin);

transactionRoutes.post('/send-otp',authMiddleware, sendTransactionOtp);

transactionRoutes.post('/verify-otp',authMiddleware, verifyTransactionOtp);



export default transactionRoutes;
import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes.js';
import accountrouter from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

const app = express();

const authRouter = router;
const accountRouter = accountrouter;
const transactionRouter = transactionRoutes;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth" , authRouter);
app.use("/api/account",accountRouter);
app.use("/api/transaction",transactionRouter);


export default app;
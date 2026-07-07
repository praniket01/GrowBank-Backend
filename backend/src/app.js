import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes.js';
import accountrouter from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import userrouter from './routes/user.routes.js';
import cors from "cors"

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


const authRouter = router;
const accountRouter = accountrouter;
const transactionRouter = transactionRoutes;
const userRouter = userrouter;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth" , authRouter);
app.use("/api/account",accountRouter);
app.use("/api/transaction",transactionRouter);
app.use("/api/user",userRouter);


export default app;
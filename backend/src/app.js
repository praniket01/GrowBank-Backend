import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes.js';
import accountrouter from './routes/account.routes.js';


const app = express();

const authRouter = router;
const accountRouter = accountrouter;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth" , authRouter);
app.use("/api/account",accountRouter)


export default app;
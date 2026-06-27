import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes.js';


const app = express();

const authRouter = router;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth" , authRouter);


export default app;
import express, { Request, Response } from 'express';
import userRouter from './routes/user.router'
import authRouter from './routes/auth.router';
const PORT = 8010;
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import router from './routes/auth.router';
const app = express();

dotenv.config();

// Use middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',[userRouter,authRouter])
//app.use(router);

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running successfully on http://localhost:${PORT}`);
});
export default app


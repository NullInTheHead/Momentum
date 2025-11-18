import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './api/auth/auth.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({origin:['https://momentum-pearl.vercel.app/','http://localhost:5173/']}));
app.use(express.json());

app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
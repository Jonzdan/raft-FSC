import 'dotenv/config';
import express from 'express';
import cookie_parser from 'cookie-parser';
import cors from 'cors';
import { userRouter } from './routes/user.js';
import { guestRouter } from './routes/guest.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser(process.env.COOKIE_PARSER_SECRET));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors({
    origin: [process.env.APP_URL],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type'],
}));


app.get("/", async(req, res) => {
    try {
        return res.status(200).sendFile(path.join(__dirname, 'dist', 'index.html'));
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Server error in landing page"
        })        
    }
})

app.use("/user", userRouter);
app.use("/guest", guestRouter);

app.listen(process.env.PORT || LOCAL_PORT);
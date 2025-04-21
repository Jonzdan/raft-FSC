import 'dotenv/config';
import express from 'express';
import cookie_parser from 'cookie-parser';
import session from 'express-session';
import pgConnect from 'connect-pg-simple';
import { db } from './database.js';
const LOCAL_PORT = 4000;
const pgSession = pgConnect(session);
import cors from 'cors';
import { userRouter } from './routes/user.js';
import { guestRouter } from './routes/guest.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie_parser(process.env.COOKIE_PARSER_SECRET));
app.use(session({
    store: new pgSession({
        pool: db.pool,
        createTableIfMissing: true,

    }),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: 'strict',
        secure: process.env.MODE === 'prod',
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
}));
app.use(cors({
    origin: ["http://localhost:80", "http://localhost:3000", "http://localhost:5173"],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type']
}));

app.use("/user", userRouter);
app.use("/guest", guestRouter);

app.listen(process.env.PORT || LOCAL_PORT);

app.get("/", async(req, res) => {
    try {
        return res.status(200).json({
            message: `
                You are tasked to create a simple guest book web application that provides users a way to check in to the website and leave a note with their name and contact info. The data entered into the guest form will be sent to a Node.JS Express API to be stored in a PostgreSQL database.

                Backend

                POST new guest check-in endpoint
                POST-BODY: first_name, last_name, message, phone_number.
                Side effect: The guest check in is recorded in the PostgreSQL database with a unique ID for each check-in.
                Output: HTTP 200 response.
                GET All guest check-in's endpoint
                Input: None
                Output: HTTP 200 response with JSON list of all recorded check-in's.
                GET Specific guest check-in's endpoint
                Input: Guest ID
                Output: HTTP 200 response with JSON list of all recorded check-in's.
                DELETE guest check-in endpoint
                Input: check-in ID
                Output: HTTP 200 response with JSON output of the check-in that got deleted.
        `});
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Server error in landing page"
        })        
    }
})

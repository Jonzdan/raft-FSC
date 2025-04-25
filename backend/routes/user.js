import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../database.js';
export const userRouter = express.Router();

userRouter.post("/signup/", async(req, res) => {
    console.log("here");
    const body = req.body;
    try {
        const {username: guestname, password, passwordConfirm} = body;
        if (!guestname || !password || !passwordConfirm || password != passwordConfirm) {
            return res.status(401).json({
                error: "Invalid Field Body"
            });
        }

        const hashedPassword = await generateSecureHash(password);
        if (hashedPassword === null) {
            throw new Error("Hashing password failed");
        }

        const mutation = "INSERT INTO guests(guestname, password) VALUES($1, $2) ON CONFLICT (guestname) DO NOTHING;";
        const params = [guestname, hashedPassword];

        const rowCount = await db.mutate(mutation, params);

        if (rowCount === null) {
            throw new Error();
        }

        if (rowCount == 0)
            return res.status(409).json({
                error: "Username already exists"
            });

        return res.status(200).json({
            message: "Success"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

userRouter.post("/login", async(req, res) => {
    const body = req.body;
    try {
        const {username: guestname, password} = body;
        if (!guestname || !password)
            return res.status(400).json({
                error: "Missing required fields"
            });

        const query = "SELECT id, guestname, password FROM guests WHERE guestname = $1";
        const params = [guestname];

        const [result, rowCount] = await db.query(query, params);

        if (result == null) {
            return res.status(500).json({
                error: "Internal Server Error"
            });
        }

        if (rowCount === 0) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const { id: guestId, _, password: storedPassword } = result[0];
        const isMatch = await verifySecureHash(password, storedPassword);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid Request"
            });
        }

        req.session.guestId = guestId;
        return res.status(200).json({
            "gid": guestId,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

async function generateSecureHash(input, salt=10) {
    if (!input || salt == null) 
        return null;

    try {
        const result = await bcrypt.hash(input, salt);
        return result;
    } catch (error) {
        console.log(error);
    }
    return null;
}

async function verifySecureHash(providedInput, hashedInput) {
    if (!providedInput || !hashedInput)
        return false;

    try {
        const matched = bcrypt.compare(providedInput, hashedInput);
        return matched
    } catch (error) {
        console.log(error);
    }
    return false;
}


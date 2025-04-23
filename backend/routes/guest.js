import express from 'express';
export const guestRouter = express.Router();
import { db } from '../database.js';

guestRouter.post("/new-check-in", async(req, res) => {
    const body_data = req.body;
    try {
        const { firstName, lastName, message, phoneNumber, guestId } = body_data;

        if (!guestId || guestId.length == 0) {
            return res.status(401).json({
                error: "Invalid Request"
            });
        }

        if (!firstName || !lastName || !message || !phoneNumber)
            return res.status(400).json({
                error: "Missing required fields"
            });

        const query = "INSERT INTO check_ins (first_name, last_name, message, phone_number, guest_id) VALUES($1, $2, $3, $4, $5);";
        const params = [firstName, lastName, message, phoneNumber, guestId];

        const rowsAffected = await db.mutate(query, params);
        if (!rowsAffected || rowsAffected == 0) {
            return res.status(500).json({
                error: "Internal Server Error"
            });
        }

        return res.status(200).json({
            message: "Success"
        });


    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Interval Server Error"
        });
    }
});

guestRouter.get("/all", async(req, res) => {
    try {
        const query = "SELECT first_name, last_name, message FROM check_ins;";

        const [result, rowCount] = await db.query(query);

        if (result === null) {
            throw new Error();
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(
            result.map((item) => {
                const { first_name, last_name, message } = item;
                return {
                    firstName: first_name,
                    lastName: last_name,
                    message: message,
                };
            })
        );
    
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Interval Server Error"
        });
    }
});

guestRouter.get("/:guestId", async(req, res) => {
    const guestId = req.params.guestId;
    try {
        const guestIdINum = parseInt(guestId);
        if (isNaN(guestIdINum) || guestId.includes(".") || guestIdINum < 0)
            return res.status(400).json({
                error: "Bad Request"
            });

        const query = "SELECT first_name, last_name, message, id FROM check_ins WHERE guest_id = $1;";
        const params = [guestIdINum,];

        const [result, rowCount] = await db.query(query, params);
        if (!result || rowCount == 0) 
            return res.status(404).json({
                error: "Resource Not Found"
            });

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(result.map((item) => {
            return {
                id: item.id,
                firstName: item.first_name,
                lastName: item.last_name,
                message: item.message,
            }
        }));

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Interval Server Error"
        });
    }
})

guestRouter.delete("/new-check-in", async(req, res) => {
    const body = req.body;
    try {
        console.log(req.body);
        const { checkInId, guestId } = body;
        if (!guestId || guestId.length == 0) {
            return res.status(401).json({
                error: "Invalid Request"
            });
        }

        const checkInIdNum = parseInt(checkInId)
        if (!checkInId || isNaN(checkInIdNum))
            return res.status(400).json({
                error: "Bad Request"
            });

        const mutate = "DELETE FROM check_ins WHERE id = $1;";
        const params = [checkInIdNum,];
        const rowsAffected = await db.mutate(mutate, params);

        if (rowsAffected === 0) {
            return res.status(404).json({
                error: "Resource not found"
            });
        }

        if (rowsAffected === null) {
            throw new Error("Bad Request");
        }
        
        return res.status(200).json({
            message: "Success"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Unexpected Server Error"
        });
    }
})
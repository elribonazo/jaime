import express from 'express';

const route = express.Router();

export const health = route.get("/api/status", async (req, res, next) => {
    try {
        return res.json({ success: true })
    } catch (err) {
        return next(err);
    }
});
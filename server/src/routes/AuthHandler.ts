import { Router } from "express";
import { sign } from "jsonwebtoken";
import { DB } from "../DB";
import { hasAll } from "../util/util";

const AuthHandler = Router();

AuthHandler.post("/login", (req, res) => {
    const body = req.body;
    if(!hasAll(body, "username", "password"))
        return res.status(400).end();
    
    const user = DB.users.find(it => it.username === body.username);
    if(!user || user.password !== body.password)
        return res.status(403).end();

    res.status(200).json({
        token: sign({ username: user.username }, "verySecureIKnow")
    });
});

AuthHandler.post("/register", (req, res) => {
    const body = req.body;
    if(!hasAll(body, "username", "password"))
        return res.status(400).end();

    const user = DB.users.find(it => it.username === body.username);
    if(user)
        return res.status(400).end();
    
    // body has username and password so we can just spread it here 🥵
    DB.users.push({ ...body });
    res.status(200).end();
})

export { AuthHandler };
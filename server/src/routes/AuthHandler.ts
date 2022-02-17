import { Router } from "express";
import { DB } from "../DB";
import { hasAll } from "../util/util";

const AuthHandler = Router();

AuthHandler.post("/login", (req, res) => {
    const body = req.body;
    if(!hasAll(body, "username", "password"))
        return res.status(400);
    
    const user = DB.users.find(it => it.username === body.username);
    if(!user || user.password !== body.password)
        return res.status(403);

    res.status(200);
});

AuthHandler.post("/register", (req, res) => {
    const body = req.body;
    if(!hasAll(body, "username", "password"))
        return res.status(400);

    const user = DB.users.find(it => it.username === body.username);
    if(user)
        return res.status(400);
    
    // body has username and password so we can just spread it here 🥵
    DB.users.push({ ...body });
    res.status(200);
})

export { AuthHandler };
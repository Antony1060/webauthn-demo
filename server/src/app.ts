import Express from "express"
import { AuthHandler } from "./routes/AuthHandler";
import { Logger } from "./util/logger";

const app = Express();

app.use("/auth", AuthHandler);

const _PORT = process.env.PORT || 8080;
app.listen(_PORT, () => {
    Logger.api("Listening on " + _PORT);
})
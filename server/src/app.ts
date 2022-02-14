import Express from "express"
import { Logger } from "./util/logger";

const app = Express();

const _PORT = process.env.PORT || 8080;
app.listen(_PORT, () => {
    Logger.api("Listening on " + _PORT);
})
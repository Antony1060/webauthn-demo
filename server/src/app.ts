import Express from "express"
import { AuthHandler } from "./routes/AuthHandler";
import { Logger } from "./util/logger";
import cors from "cors";

const app = Express();

app.use(cors())
app.use(Express.json());

app.use("/auth", AuthHandler);

const _PORT = process.env.PORT || 8080;
app.listen(_PORT, () => {
    Logger.api("Listening on " + _PORT);
})
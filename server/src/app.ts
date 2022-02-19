import Express from "express"
import { AuthHandler } from "./routes/AuthHandler";
import { Logger } from "./lib/logger";
import cors from "cors";
import { WebAuthnHandler } from "./routes/WebAuthnHandler";

const app = Express();

app.use(cors())
app.use(Express.json());

app.use("/auth", AuthHandler);
app.use("/webauthn", WebAuthnHandler);

const _PORT = process.env.PORT || 8080;
app.listen(_PORT, () => {
    Logger.api("Listening on " + _PORT);
})
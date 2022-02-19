import { createLogger, shimLog } from "@lvksh/logger";
import chalk from "chalk";

export const Logger = createLogger({
    info: chalk.blueBright`INFO`,
    debug: chalk.yellowBright`DEBUG`,
    api: chalk.redBright`API`,
    console: chalk.greenBright`COSNOLE`
}, { padding: "PREPEND", divider: chalk.gray` | ` });
shimLog(Logger, "console");
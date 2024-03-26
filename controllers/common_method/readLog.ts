import * as url from "url";
import fs from "fs";
const __dirname = url.fileURLToPath(new URL("../", import.meta.url));

export const readLog = () => fs.readFileSync(__dirname + './app.log').toString()
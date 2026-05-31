// utils/logger.js
import fs from "fs";
import path from "path";

const formattedDate = new Date().toISOString().slice(0, 10);
const logFile = path.join(
  process.cwd(),
  "src/logs",
  `app-${formattedDate}.log`,
);

export const log = (message) => {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error("Logging failed:", err);
  });
};

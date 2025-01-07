const fs = require("fs");
const path = require("path");

exports.writeLog = (type, dir, message) => {
  const logMessage = `${type} - ${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(path.join(dir, 'process_log.txt'), logMessage, 'utf8');
}
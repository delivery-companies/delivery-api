"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.automaticBackUpCronJob = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cron = __importStar(require("node-cron"));
const googleapis_1 = require("googleapis");
const config_1 = require("./config");
const logger_1 = require("./lib/logger");
// 🔧 CONFIG
const BACKUP_DIR = path.resolve(__dirname, "../backups");
const CREDENTIALS_PATH = path.resolve(__dirname, "../credentials.json");
const GDRIVE_FOLDER_ID = "19-VriVzLqpCDSTPvIA0qYBtZZJGW2odB"; // Optional
// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR))
    fs.mkdirSync(BACKUP_DIR);
// ⏰ Run every day at 12:00 AM
exports.automaticBackUpCronJob = cron.schedule("0 * * * *", async () => {
    logger_1.Logger.info("Running backup updates");
    //   const date = new Date().toISOString().split("T")[0];
    const fileName = `albarq-backup.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);
    const dumpCommand = `PGPASSWORD=${config_1.env.DB_PASSWORD} pg_dump -h albarq-db-aug-31-backup-do-user-16243774-0.m.db.ondigitalocean.com -p 25060 -U ${config_1.env.DB_USER} -F p -d ${config_1.env.DB_NAME} -f "${filePath}"`;
    (0, child_process_1.exec)(dumpCommand, { env: { ...process.env } }, async (error) => {
        if (error) {
            console.error("Backup failed:", error.message);
            return;
        }
        console.log(`✅ Backup saved to ${filePath}`);
        await uploadToDrive(filePath, fileName);
    });
});
async function uploadToDrive(filePath, fileName) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    // Check if the file exists in the specified folder
    const res = await drive.files.list({
        q: `name = '${fileName}' and '${GDRIVE_FOLDER_ID}' in parents`,
        fields: "files(id, name)",
    });
    let fileId;
    if (res.data.files && res.data.files.length > 0) {
        // File exists, get its ID
        fileId = res.data.files[0].id;
    }
    const media = {
        mimeType: "application/sql",
        body: fs.createReadStream(filePath),
    };
    try {
        let response;
        if (fileId) {
            // File exists, update it
            response = await drive.files.update({
                fileId: fileId,
                requestBody: {
                    name: fileName,
                },
                media,
                addParents: GDRIVE_FOLDER_ID, // Use addParents for updating parents
                fields: "id",
            });
            console.log("✅ File updated. File ID:", response.data.id);
        }
        else {
            // File doesn't exist, create a new one
            response = await drive.files.create({
                requestBody: {
                    name: fileName,
                    parents: [GDRIVE_FOLDER_ID], // Correctly set parents here for new file
                },
                media,
                fields: "id",
            });
            console.log("✅ File uploaded. File ID:", response.data.id);
        }
    }
    catch (err) {
        console.error("❌ Google Drive upload failed:", err);
    }
}
//# sourceMappingURL=backup.js.map
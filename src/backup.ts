import {exec} from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as cron from "node-cron";
import {google} from "googleapis";
import {env} from "./config";
import {Logger} from "./lib/logger";

// 🔧 CONFIG
const BACKUP_DIR = path.resolve(__dirname, "../backups");
const CREDENTIALS_PATH = path.resolve(__dirname, "../credentials.json");
const GDRIVE_FOLDER_ID = "19-VriVzLqpCDSTPvIA0qYBtZZJGW2odB"; // Optional

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

// ⏰ Run every day at 12:00 AM
export const automaticBackUpCronJob = cron.schedule("0 * * * *", async () => {
  Logger.info("Running backup updates");
  //   const date = new Date().toISOString().split("T")[0];
  const fileName = `albarq-backup.sql`;
  const filePath = path.join(BACKUP_DIR, fileName);
  const dumpCommand = `PGPASSWORD=${env.DB_PASSWORD} pg_dump -h albarq-db-aug-31-backup-do-user-16243774-0.m.db.ondigitalocean.com -p 25060 -U ${env.DB_USER} -F p -d ${env.DB_NAME} -f "${filePath}"`;

  exec(dumpCommand, {env: {...process.env}}, async (error) => {
    if (error) {
      console.error("Backup failed:", error.message);
      return;
    }
    console.log(`✅ Backup saved to ${filePath}`);
    await uploadToDrive(filePath, fileName);
  });
});
async function uploadToDrive(filePath: string, fileName: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({version: "v3", auth});

  // Check if the file exists in the specified folder
  const res = await drive.files.list({
    q: `name = '${fileName}' and '${GDRIVE_FOLDER_ID}' in parents`,
    fields: "files(id, name)",
  });

  let fileId: string | undefined | null;

  if (res.data.files && res.data.files.length > 0) {
    // File exists, get its ID
    fileId = res.data.files[0].id;
  }

  const fileMetadata: any = {
    name: fileName,
  };

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
    } else {
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
  } catch (err) {
    console.error("❌ Google Drive upload failed:", err);
  }
}

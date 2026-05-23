import serverless from "serverless-http";
import connectDB from "../../backend/config/db.js";
import app from "../../backend/app.js";

let dbConnected = false;

async function ensureDb() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

const handler = serverless(app);

export default async (req, context) => {
  await ensureDb();
  return handler(req, context);
};

export const config = {
  path: "/api/*",
};

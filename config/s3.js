// config/s3.js
const { S3Client } = require("@aws-sdk/client-s3");

// You can also omit `endpoint` completely; both work.
// Using the regional endpoint keeps TLS happy.
const endpoint = process.env.AWS_S3_ENDPOINT?.replace(/\/+$/, "");

const s3 = new S3Client({
  region: "ap-south-1",
  ...(endpoint ? { endpoint } : {}), // omit if not set
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // virtual-hosted-style is default; no need to force path style
  forcePathStyle: false,
});

module.exports = { s3 };

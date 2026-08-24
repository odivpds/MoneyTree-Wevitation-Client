"use server";

export async function getUploadCredentials() {
  return {
    bucketName: process.env.S3_BUCKET_NAME,
    accessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
  };
}

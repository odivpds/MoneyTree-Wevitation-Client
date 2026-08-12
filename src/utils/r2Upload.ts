export async function uploadToR2(base64Image: string, originalFilename: string = 'image.webp'): Promise<string | null> {
  try {
    // 1. Convert base64 to Blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    const file = new File([blob], originalFilename, { type: blob.type });

    // 2. Request Presigned URL from our Next.js API
    const presignedRes = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!presignedRes.ok) {
      throw new Error('Failed to get presigned URL');
    }

    const { uploadUrl, publicUrl } = await presignedRes.json();

    // 3. Upload the file directly to R2 using the Presigned URL
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file to R2');
    }

    // 4. Return the public URL
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return null;
  }
}

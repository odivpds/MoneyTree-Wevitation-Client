"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";
import { getUploadCredentials } from "./actions";

export default function CreateInvitation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus("Reading ZIP file...");

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const file = formData.get('file') as File;

    if (!file || !title || !slug) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Invalid slug format. Use only lowercase letters, numbers, and hyphens.");
      setLoading(false);
      return;
    }

    try {
      // 1. Unzip the file in the browser
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      
      const filesToUpload: { name: string; type: string; content: Blob }[] = [];
      const zipEntries = Object.values(loadedZip.files);
      
      // Find where index.html is located (it might be inside a folder like "online weding/index.html")
      const indexEntry = zipEntries.find(entry => !entry.dir && entry.name.endsWith("index.html") && !entry.name.includes("__MACOSX"));
      
      if (!indexEntry) {
        throw new Error("The uploaded zip must contain an index.html file.");
      }

      // Determine the root prefix (e.g., "online weding/" or "")
      const rootPrefix = indexEntry.name.substring(0, indexEntry.name.length - "index.html".length);

      setUploadStatus("Extracting files...");
      
      for (const zipEntry of zipEntries) {
        if (zipEntry.dir) continue;
        // Ignore files outside the root directory or macOS hidden files
        if (!zipEntry.name.startsWith(rootPrefix) || zipEntry.name.includes("__MACOSX") || zipEntry.name.includes(".DS_Store")) continue;

        // Strip the root prefix so "online weding/style.css" becomes "style.css"
        const relativeName = zipEntry.name.substring(rootPrefix.length);
        
        const content = await zipEntry.async("blob");
        filesToUpload.push({
          name: relativeName,
          type: content.type || "application/octet-stream",
          content
        });
      }

      // 2. Get Credentials for Direct Upload
      setUploadStatus("Securing upload token...");
      const creds = await getUploadCredentials();
      
      if (!creds.endpoint || !creds.bucketName || !creds.accessKey) {
        throw new Error("Storage credentials are not configured on the server.");
      }
      
      const baseUrl = creds.endpoint.endsWith('/') ? creds.endpoint.slice(0, -1) : creds.endpoint;

      // 3. Upload files directly to Cloudflare R2 in batches
      let uploadedCount = 0;
      const totalFiles = filesToUpload.length;

      // Upload in batches of 5 to avoid overwhelming the browser/network
      const batchSize = 5;
      for (let i = 0; i < totalFiles; i += batchSize) {
        const batch = filesToUpload.slice(i, i + batchSize);
        await Promise.all(batch.map(async (fileObj) => {
          const uploadUrl = `${baseUrl}/${creds.bucketName}/${slug}/${fileObj.name}`;
          
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "AccessKey": creds.accessKey!,
              "Content-Type": fileObj.type || "application/octet-stream",
            },
            body: fileObj.content
          });

          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error("Direct upload failed", uploadRes.status, errorText);
            throw new Error(`Failed to upload ${fileObj.name} directly to storage`);
          }
          
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          setUploadStatus(`Uploading files... (${uploadedCount}/${totalFiles})`);
        }));
      }

      // 4. Save to Database
      setUploadStatus("Saving to database...");
      const dbRes = await fetch("/api/admin/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug })
      });

      const dbData = await dbRes.json();
      if (!dbRes.ok) throw new Error(dbData.error || "Failed to save invitation");

      setUploadStatus("Done!");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="p-2 rounded-lg bg-white border border-[#E6DFD1] text-[#677359] hover:bg-[#F9F7F2] transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-4xl font-serif font-bold tracking-tight text-[#222] mb-1">Create Invitation</h2>
          <p className="text-gray-500 text-sm">Upload a custom HTML/CSS/JS bundle for your client.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E6DFD1] rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-[#333]">
              Event Title / Client Name
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g., Pernikahan Gung Istri & Gung Praba"
              className="w-full bg-[#F9F7F2] border border-[#E6DFD1] rounded-xl px-4 py-3 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-[#333]">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="bg-[#F0EBE1] border border-r-0 border-[#E6DFD1] rounded-l-xl px-4 py-3 text-gray-500 text-sm">
                {domain ? `${domain}/` : '.../'}
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                placeholder="gung-istri-gung-praba"
                className="flex-1 bg-[#F9F7F2] border border-[#E6DFD1] rounded-r-xl px-4 py-3 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#333]">
              Upload Files (.zip)
            </label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-[#D7C7B2] px-6 py-10 bg-[#F9F7F2] hover:bg-[#F0EBE1] transition-colors relative group">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-[#D4C4B7] group-hover:text-[#677359] transition-colors" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-gray-500 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-[#677359] hover:text-[#58634c] focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file" type="file" accept=".zip" className="sr-only" required />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-400">No file size limit (Client-Side Uploading)</p>
                <p className="text-xs text-gray-400 mt-1">Must contain an index.html file</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{uploadStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#F0EBE1] rounded-full h-2">
                <div 
                  className="bg-[#677359] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#E6DFD1] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-[#677359] hover:bg-[#58634c] disabled:bg-[#677359]/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload size={18} strokeWidth={2.5} />
                  <span>Create Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

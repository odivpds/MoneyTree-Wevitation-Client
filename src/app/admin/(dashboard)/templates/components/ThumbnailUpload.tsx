"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

interface ThumbnailUploadProps {
  defaultValue?: string;
}

export default function ThumbnailUpload({ defaultValue = "" }: ThumbnailUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      // Gunakan Next.js API /api/upload untuk mem-bypass masalah CORS pada R2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", "thumbnails");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal mengunggah file");
      }

      const data = await res.json();
      const finalUrl = data.url;


      setImageUrl(finalUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat mengunggah");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-[#333] uppercase tracking-wider mb-2">
        Gambar Thumbnail
      </label>

      <input type="hidden" name="image" value={imageUrl} />

      <div
        onClick={triggerSelect}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${error ? 'border-red-400 bg-red-50' :
            imageUrl ? 'border-[#677359] bg-[#faf7f2]' : 'border-[#E6DFD1] hover:border-[#677359] hover:bg-[#faf7f2]'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-[#677359] animate-spin mb-3" />
            <p className="text-sm font-medium text-[#677359]">Mengunggah gambar...</p>
          </div>
        ) : imageUrl ? (
          <div className="flex flex-col items-center justify-center relative group py-2">
            <div className="relative w-40 h-40 mb-4 rounded-xl overflow-hidden shadow-sm border border-[#E6DFD1]">
              <img src={imageUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-bold">Ganti Gambar</p>
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-[#677359]">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Gambar berhasil diunggah
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full bg-[#f0ebd8] flex items-center justify-center mb-4 text-[#677359]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#222] mb-1">
              Klik atau Drag & Drop gambar ke sini
            </p>
            <p className="text-xs text-gray-500">
              Format yang didukung: JPG, PNG, WEBP (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
}

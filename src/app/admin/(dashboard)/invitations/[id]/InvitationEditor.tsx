"use client";

import { useState } from "react";
import { Save, Loader2, Edit3, Globe, Tag, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface InvitationEditorProps {
  invitation: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
}

export default function InvitationEditor({ invitation }: InvitationEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(invitation.title);
  const [slug, setSlug] = useState(invitation.slug);
  const [status, setStatus] = useState(invitation.status);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug must only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update invitation");
      }

      setSuccess(true);
      setIsEditing(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(invitation.title);
    setSlug(invitation.slug);
    setStatus(invitation.status);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="bg-white border border-[#E6DFD1] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-serif font-bold text-[#333] flex items-center gap-2">
          <Edit3 size={18} className="text-[#677359]" />
          Invitation Details
        </h3>
        <div className="flex items-center gap-2">
          {success && (
            <span className="flex items-center gap-1.5 text-sm text-[#677359] font-medium animate-fade-in">
              <CheckCircle2 size={16} />
              Saved!
            </span>
          )}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0EBE1] hover:bg-[#E6DFD1] text-[#333] text-sm font-medium transition-colors border border-[#E6DFD1]"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#F9F7F2] text-gray-500 text-sm font-medium transition-colors border border-[#E6DFD1]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#677359] hover:bg-[#58634c] disabled:bg-[#677359]/50 text-white text-sm font-medium transition-all shadow-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#555]">
            <Tag size={14} className="text-[#D4C4B7]" />
            Event Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#E6DFD1] rounded-xl px-4 py-3 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] transition-all"
              placeholder="e.g., Pernikahan Gung Istri & Gung Praba"
            />
          ) : (
            <p className="px-4 py-3 bg-[#F9F7F2] rounded-xl text-[#333] border border-transparent">{title}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#555]">
            <Globe size={14} className="text-[#D4C4B7]" />
            URL Slug
          </label>
          {isEditing ? (
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#E6DFD1] rounded-xl px-4 py-3 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] transition-all font-mono text-sm"
              placeholder="gung-istri-gung-praba"
            />
          ) : (
            <p className="px-4 py-3 bg-[#F9F7F2] rounded-xl text-[#333] border border-transparent font-mono text-sm">/{slug}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-[#555]">
            Status
          </label>
          {isEditing ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#E6DFD1] rounded-xl px-4 py-3 text-[#333] focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] transition-all appearance-none cursor-pointer"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          ) : (
            <div className="px-4 py-3 bg-[#F9F7F2] rounded-xl border border-transparent flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'PUBLISHED' ? 'bg-[#677359]' : 'bg-[#D4C4B7]'}`}></span>
              <span className="text-[#333] text-sm font-medium">{status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

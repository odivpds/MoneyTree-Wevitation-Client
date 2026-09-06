"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Users, Send, Copy, Loader2, Check, MessageSquare, Save, UploadCloud, Download, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function GuestManager({ invitationId, slug, initialWaTemplate }: { invitationId: string; slug: string, initialWaTemplate: string | null }) {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkNames, setBulkNames] = useState("");
  const [adding, setAdding] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<string | null>(null);

  type DialogState = {
    isOpen: boolean;
    title: string;
    description: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
  };

  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    description: '',
    type: 'alert'
  });

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultTemplate = "Halo [Nama Tamu],\n\nTanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nSilakan buka tautan undangan berikut untuk detail acara:\n[Link Undangan]\n\nKehadiran Anda adalah kehormatan bagi kami. Terima kasih!";
  const [waTemplate, setWaTemplate] = useState(initialWaTemplate || defaultTemplate);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchGuests = async () => {
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/guests`);
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [invitationId]);

  const saveGuestsToDb = async (namesData: { name: string, phone?: string }[]) => {
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: namesData }),
      });

      if (res.ok) {
        await fetchGuests();
        return true;
      }
    } catch (err) {
      console.error("Failed to add guests", err);
    }
    return false;
  };

  const confirmDeleteGuest = (guestId: string) => {
    setDialog({
      isOpen: true,
      title: "Hapus Tamu",
      description: "Apakah Anda yakin ingin menghapus tamu ini? Tindakan ini tidak dapat dibatalkan.",
      type: "confirm",
      onConfirm: () => executeDeleteGuest(guestId)
    });
  };

  const executeDeleteGuest = async (guestId: string) => {
    setDeletingGuest(guestId);
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/guests?guestId=${guestId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchGuests();
      } else {
        setDialog({ isOpen: true, title: "Error", description: "Gagal menghapus tamu", type: 'alert' });
      }
    } catch (err) {
      console.error("Failed to delete guest", err);
      setDialog({ isOpen: true, title: "Error", description: "Gagal menghapus tamu", type: 'alert' });
    } finally {
      setDeletingGuest(null);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkNames.trim()) return;
    setAdding(true);

    const lines = bulkNames.split('\n').filter(n => n.trim().length > 0);
    const namesData = lines.map(line => {
      const parts = line.split(',');
      if (parts.length > 1) {
        let phone = parts[1].trim();
        phone = phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
          phone = '62' + phone.substring(1);
        }
        return { name: parts[0].trim(), phone };
      }
      return { name: line.trim() };
    });

    const success = await saveGuestsToDb(namesData);
    if (success) {
      setBulkNames("");
    }
    setAdding(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAdding(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Read as array of arrays
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        // Skip header row if exists, assume Col 0 is Name, Col 1 is Phone
        const namesData = [];
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          let name = row[0] ? String(row[0]).trim() : '';
          let phone = row[1] ? String(row[1]).trim() : '';

          // Basic heuristic to skip header
          if (i === 0 && name.toLowerCase().includes('nama')) continue;
          if (!name) continue;

          if (phone) {
            phone = phone.replace(/[^0-9]/g, '');
            if (phone.startsWith('0')) {
              phone = '62' + phone.substring(1);
            }
          }

          namesData.push(phone ? { name, phone } : { name });
        }

        if (namesData.length > 0) {
          await saveGuestsToDb(namesData);
        }
      } catch (err) {
        console.error("Error parsing file", err);
        setDialog({ isOpen: true, title: "Error", description: "Gagal membaca file Excel. Pastikan formatnya benar.", type: 'alert' });
      } finally {
        setAdding(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Nama Tamu", "Nomor WhatsApp"],
      ["Budi Santoso", "081234567890"],
      ["Keluarga Bapak Andi", ""]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");
    XLSX.writeFile(wb, "Template_Tamu_Wevitation.xlsx");
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      await fetch(`/api/admin/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waTemplate }),
      });
    } catch (err) {
      console.error("Failed to save template", err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const generateLink = (name: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/${slug}?kepada=${encodeURIComponent(name)}`;
  };

  const handleCopyLink = (id: string, name: string) => {
    navigator.clipboard.writeText(generateLink(name));
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleCopyMessage = (id: string, name: string) => {
    navigator.clipboard.writeText(getWhatsAppMessage(name));
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const getWhatsAppMessage = (name: string) => {
    const link = generateLink(name);
    return waTemplate
      .replace(/\[Nama Tamu\]/gi, name)
      .replace(/\[Link Undangan\]/gi, link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Actions */}
      <div className="lg:col-span-1 space-y-6">

        {/* Bulk Add Box */}
        <div className="bg-white border border-[#E6DFD1] rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-[#333] flex items-center gap-2">
              <Users size={18} className="text-[#677359]" />
              Add Guests
            </h3>
            <button
              onClick={handleDownloadTemplate}
              className="text-xs text-gray-400 hover:text-[#677359] flex items-center gap-1 transition-colors"
            >
              <Download size={12} /> Template Excel
            </button>
          </div>

          <div className="mb-4">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 bg-[#F9F7F2] hover:bg-[#F0EBE1] disabled:bg-[#F9F7F2]/50 text-[#333] px-4 py-2.5 rounded-xl font-medium transition-all border border-dashed border-[#D7C7B2]"
            >
              {adding ? <Loader2 size={18} className="animate-spin text-[#677359]" /> : <UploadCloud size={18} className="text-[#D4C4B7]" />}
              <span>Upload dari Excel</span>
            </button>
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="h-px bg-[#E6DFD1] flex-1"></div>
            <span className="text-xs text-gray-400 font-medium uppercase">Atau Ketik Manual</span>
            <div className="h-px bg-[#E6DFD1] flex-1"></div>
          </div>

          <textarea
            value={bulkNames}
            onChange={(e) => setBulkNames(e.target.value)}
            className="w-full h-32 bg-[#F9F7F2] border border-[#E6DFD1] rounded-xl p-4 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] resize-none text-sm transition-all"
            placeholder={`Budi Santoso, 08123456789\nKeluarga Bapak Andi\nCaca & Partner, 6281299998888`}
          />
          <button
            onClick={handleBulkAdd}
            disabled={adding || !bulkNames.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#677359] hover:bg-[#58634c] disabled:bg-[#677359]/50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-full font-semibold transition-all shadow-sm"
          >
            {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span>Tambah ke Daftar</span>
          </button>
        </div>

        {/* WhatsApp Template Box */}
        <div className="bg-white border border-[#E6DFD1] rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-serif font-bold text-[#333] mb-2 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#677359]" />
            WhatsApp Template
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Gunakan <strong className="text-[#677359]">[Nama Tamu]</strong> dan <strong className="text-[#677359]">[Link Undangan]</strong>.
          </p>
          <textarea
            value={waTemplate}
            onChange={(e) => setWaTemplate(e.target.value)}
            className="w-full h-48 bg-[#F9F7F2] border border-[#E6DFD1] rounded-xl p-4 text-[#333] text-sm focus:outline-none focus:ring-2 focus:ring-[#D7C7B2]/50 focus:border-[#D4C4B7] resize-y transition-all"
          />
          <button
            onClick={handleSaveTemplate}
            disabled={savingTemplate || !waTemplate.trim()}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#F0EBE1] hover:bg-[#E6DFD1] disabled:bg-[#F9F7F2] disabled:text-gray-400 text-[#333] px-4 py-2.5 rounded-full font-semibold transition-all border border-[#E6DFD1]"
          >
            {savingTemplate ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Simpan Template</span>
          </button>
        </div>

      </div>

      {/* Right Column: Guest List */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-[#E6DFD1] rounded-3xl p-6 shadow-sm h-full min-h-[400px]">
          <h3 className="text-lg font-serif font-bold text-[#333] mb-4">
            Guest List ({guests.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#677359]" size={32} />
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12 border border-[#E6DFD1] border-dashed rounded-xl bg-[#F9F7F2]">
              <p className="text-gray-500">No guests added yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {guests.map((guest) => (
                <div key={guest.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#F9F7F2] border border-[#E6DFD1] hover:border-[#D4C4B7] transition-colors gap-4">
                  <div>
                    <h4 className="font-medium text-[#333] flex items-center gap-2">
                      {guest.name}
                      {guest.phone && <span className="text-xs bg-[#677359]/10 text-[#677359] px-2 py-0.5 rounded-full border border-[#677359]/20">{guest.phone}</span>}
                    </h4>
                    <p className="text-xs text-gray-400 font-mono mt-1 break-all">
                      {generateLink(guest.name)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(guest.id, guest.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F0EBE1] text-[#555] text-sm transition-colors border border-[#E6DFD1]"
                      title="Copy Link"
                    >
                      {copiedLinkId === guest.id ? <Check size={14} className="text-[#677359]" /> : <Copy size={14} />}
                      <span className="hidden sm:inline">{copiedLinkId === guest.id ? "Copied" : "Link"}</span>
                    </button>

                    <button
                      onClick={() => handleCopyMessage(guest.id, guest.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F0EBE1] text-[#555] text-sm transition-colors border border-[#E6DFD1]"
                      title="Copy Template Message"
                    >
                      {copiedMsgId === guest.id ? <Check size={14} className="text-[#677359]" /> : <MessageSquare size={14} />}
                      <span className="hidden sm:inline">{copiedMsgId === guest.id ? "Copied" : "Pesan"}</span>
                    </button>

                    <a
                      href={`https://wa.me/${guest.phone || ''}?text=${encodeURIComponent(getWhatsAppMessage(guest.name))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm transition-colors border border-[#25D366]/20"
                    >
                      <Send size={14} />
                      <span>Kirim WA</span>
                    </a>

                    <button
                      onClick={() => confirmDeleteGuest(guest.id)}
                      disabled={deletingGuest === guest.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 disabled:bg-red-50/50 disabled:text-red-300 text-red-500 text-sm transition-colors border border-red-200 ml-2"
                      title="Hapus tamu"
                    >
                      {deletingGuest === guest.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#E6DFD1] rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-serif font-bold text-[#333] mb-2">{dialog.title}</h2>
            <p className="text-sm text-gray-500 mb-6">{dialog.description}</p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              {dialog.type === 'confirm' && (
                <button
                  onClick={closeDialog}
                  className="mt-2 sm:mt-0 inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors border border-[#E6DFD1] bg-white hover:bg-[#F9F7F2] text-[#333] h-9 px-4 py-2"
                >
                  Batal
                </button>
              )}
              <button
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  closeDialog();
                }}
                className={`inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors h-9 px-4 py-2 ${dialog.type === 'confirm'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#677359] text-white hover:bg-[#58634c]'
                  }`}
              >
                {dialog.type === 'confirm' ? 'Hapus' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

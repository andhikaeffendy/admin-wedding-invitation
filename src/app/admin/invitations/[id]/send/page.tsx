"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Send, Copy, QrCode, Download, Check, Search, Users,
  MessageCircle, ExternalLink,
  X, CheckCircle, Clock,
} from "lucide-react";

const WEDDING_URL = process.env.NEXT_PUBLIC_WEDDING_URL || 'https://wedding-invitation-liart-alpha.vercel.app';

export default function SendInvitationsPage() {
  const params = useParams();
  const invId = params.id as string;

  const [guests, setGuests] = useState<any[]>([]);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [showQrModal, setShowQrModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestsRes, invRes] = await Promise.all([
          fetch(`/api/data/guests?invitation_id=${invId}`),
          fetch(`/api/data/invitations/${invId}`),
        ]);
        const guestsData = await guestsRes.json();
        const invData = await invRes.json();
        setGuests(guestsData);
        setInvitation(invData);
      } catch {
        // fallback - page still renders with empty data
      }
      setLoading(false);
    };
    fetchData();
  }, [invId]);

  const getPersonalLink = (guest: any) =>
    `${WEDDING_URL}/i/${invitation?.slug || 'undangan'}?guest=${guest.guest_token}`;

  const handleCopyLink = async (guest: any) => {
    const link = getPersonalLink(guest);
    await navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllLinks = async () => {
    const links = filtered.map((g) => `${g.guest_name}: ${getPersonalLink(g)}`).join("\n\n");
    await navigator.clipboard.writeText(links);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 3000);
  };

  const handleOpenQrModal = (guest: any) => {
    setSelectedGuest(guest);
    setShowQrModal(true);
  };

  const handleDownloadQr = (guest: any) => {
    const svg = document.querySelector(`#qr-${CSS.escape(guest.id)} svg`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx!.fillStyle = "#FFFFFF";
      ctx!.fillRect(0, 0, 400, 400);
      ctx!.drawImage(img, 100, 50, 200, 200);
      ctx!.fillStyle = "#22382D";
      ctx!.font = "bold 16px Inter, sans-serif";
      ctx!.textAlign = "center";
      ctx!.fillText(guest.guest_name, 200, 290);
      ctx!.font = "12px Inter, sans-serif";
      ctx!.fillStyle = "#6F7F55";
      ctx!.fillText(guest.guest_token, 200, 310);
      const link = document.createElement("a");
      link.download = `QR-Pass-${guest.guest_name.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const getStatusIcon = (guest: any) => {
    if (guest.rsvp_status === "Hadir") return <CheckCircle size={14} className="text-[#6F7F55]" />;
    if (guest.rsvp_status === "Tidak Hadir") return <X size={14} className="text-[#B86B4B]" />;
    if (guest.is_checked_in) return <Check size={14} className="text-[#6F7F55]" />;
    return <Clock size={14} className="text-[#C9A86A]" />;
  };

  const getStatusLabel = (guest: any) => {
    if (guest.is_souvenir_claimed) return { label: "Selesai", className: "badge-success" };
    if (guest.is_checked_in) return { label: "Check-in", className: "badge-info" };
    if (guest.rsvp_status === "Hadir") return { label: "RSVP Hadir", className: "badge-success" };
    if (guest.rsvp_status === "Tidak Hadir") return { label: "Tidak Hadir", className: "badge-neutral" };
    if (guest.rsvp_status === "Ragu-ragu") return { label: "Ragu", className: "badge-warning" };
    return { label: "Belum RSVP", className: "badge-neutral" };
  };

  const filtered = guests.filter((g: any) =>
    g.guest_name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterStatus || filterStatus === "all" ||
      (filterStatus === "rsvp" && g.rsvp_status === "Hadir") ||
      (filterStatus === "pending" && !g.rsvp_status) ||
      (filterStatus === "checked" && g.is_checked_in) ||
      (filterStatus === "completed" && g.is_souvenir_claimed))
  );

  const stats = {
    total: guests.length,
    rsvpYes: guests.filter((g: any) => g.rsvp_status === "Hadir").length,
    pending: guests.filter((g: any) => !g.rsvp_status).length,
    checkedIn: guests.filter((g: any) => g.is_checked_in).length,
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-gray-100 rounded" />
        <div className="h-10 w-full bg-gray-100 rounded" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">
            Kirim Undangan
          </h1>
          <p className="text-[#6F7F55] text-sm">
            {guests.length} tamu — Bagikan link undangan personal tiap tamu
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopyAllLinks}
            className="btn-primary-admin flex items-center gap-1.5 text-xs"
          >
            {bulkCopied ? (
              <><Check size={14} /> Tersalin</>
            ) : (
              <><Copy size={14} /> Salin Semua Link</>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-admin p-4 flex items-center gap-3">
          <Users size={20} className="text-[#6F7F55]" />
          <div>
            <p className="text-xl font-bold text-[#22382D]">{stats.total}</p>
            <p className="text-xs text-[#A9B89B]">Total Tamu</p>
          </div>
        </div>
        <div className="card-admin p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-[#6F7F55]" />
          <div>
            <p className="text-xl font-bold text-[#6F7F55]">{stats.rsvpYes}</p>
            <p className="text-xs text-[#A9B89B]">RSVP Hadir</p>
          </div>
        </div>
        <div className="card-admin p-4 flex items-center gap-3">
          <Clock size={20} className="text-[#C9A86A]" />
          <div>
            <p className="text-xl font-bold text-[#C9A86A]">{stats.pending}</p>
            <p className="text-xs text-[#A9B89B]">Belum RSVP</p>
          </div>
        </div>
        <div className="card-admin p-4 flex items-center gap-3">
          <QrCode size={20} className="text-[#22382D]" />
          <div>
            <p className="text-xl font-bold text-[#22382D]">{stats.checkedIn}</p>
            <p className="text-xs text-[#A9B89B]">Check-in</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B89B]" />
          <input
            className="input-admin pl-9 text-xs"
            placeholder="Cari nama tamu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-admin w-auto text-xs"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="rsvp">RSVP Hadir</option>
          <option value="pending">Belum RSVP</option>
          <option value="checked">Sudah Check-in</option>
          <option value="completed">Selesai</option>
        </select>
      </div>

      {/* Guest Table */}
      <div className="card-admin overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#22382D]/10">
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">No</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Nama Tamu</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Kategori</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Status</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">QR Code</th>
              <th className="text-left py-3 px-2 font-medium text-[#A9B89B] text-xs">Link Undangan</th>
              <th className="text-right py-3 px-2 font-medium text-[#A9B89B] text-xs">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g: any, i: number) => (
              <tr
                key={g.id}
                className="border-b border-[#22382D]/5 hover:bg-[#F7F1E6]/30 transition-colors"
              >
                <td className="py-3 px-2 text-[#A9B89B] text-xs">{i + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(g)}
                    <span className="font-medium text-[#22382D] text-sm">{g.guest_name}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="badge-info text-xs">{g.category}</span>
                </td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusLabel(g).className}`}>
                    {getStatusLabel(g).label}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <button
                    onClick={() => handleOpenQrModal(g)}
                    className="flex items-center gap-1.5 text-xs text-[#6F7F55] hover:text-[#22382D] transition-colors"
                  >
                    <QrCode size={14} />
                    Lihat QR
                  </button>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#A9B89B] truncate max-w-[180px] block">
                      {getPersonalLink(g)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(g)}
                      className="p-1.5 rounded hover:bg-[#22382D]/10 text-[#6F7F55] hover:text-[#22382D] transition-colors"
                      title="Salin link"
                    >
                      {copiedId === g.id ? (
                        <Check size={14} className="text-[#6F7F55]" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Assalamualaikum Wr. Wb.\n\n` +
                        `Kepada Yth. ${g.guest_name}\n\n` +
                        `Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami:\n\n` +
                        `💍 ${invitation?.groom_name || ''} & ${invitation?.bride_name || ''}\n` +
                        `📅 ${invitation?.event_date || ''}\n\n` +
                        `Link undangan:\n${getPersonalLink(g)}\n\n` +
                        `Terima kasih. Wassalamualaikum Wr. Wb.\n` +
                        `— ${invitation?.groom_name || ''} & ${invitation?.bride_name || ''}`
                      )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-[#25D366]/10 text-[#25D366] transition-colors"
                      title="Kirim WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>

                    {/* Preview */}
                    <a
                      href={getPersonalLink(g)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-[#22382D]/10 text-[#6F7F55] hover:text-[#22382D] transition-colors"
                      title="Preview undangan"
                    >
                      <ExternalLink size={14} />
                    </a>

                    {/* QR Modal Trigger */}
                    <button
                      onClick={() => handleOpenQrModal(g)}
                      className="p-1.5 rounded hover:bg-[#22382D]/10 text-[#6F7F55] hover:text-[#22382D] transition-colors"
                      title="QR Code"
                    >
                      <QrCode size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Send size={40} className="mx-auto mb-3 text-[#A9B89B]" />
            <p className="text-[#A9B89B] text-sm">
              {search || filterStatus
                ? "Tidak ada tamu yang cocok dengan filter"
                : "Belum ada tamu. Tambahkan tamu terlebih dahulu."}
            </p>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && selectedGuest && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowQrModal(false)}
                className="float-right p-1 rounded hover:bg-gray-100 text-[#A9B89B] hover:text-[#22382D]"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#22382D] flex items-center justify-center">
                  <QrCode size={20} className="text-[#C9A86A]" />
                </div>
                <h3 className="font-semibold text-[#22382D]">QR Guest Pass</h3>
                <p className="text-xs text-[#A9B89B] mt-1">{selectedGuest.guest_name}</p>
              </div>

              {/* QR Code */}
              <div id={`qr-${selectedGuest.id}`} className="flex justify-center mb-4">
                <div className="p-4 bg-white rounded-xl border border-[#C9A86A]/20">
                  <QRCodeSVG
                    value={JSON.stringify({
                      invitation_id: invId,
                      guest_token: selectedGuest.guest_token,
                      guest_name: selectedGuest.guest_name,
                    })}
                    size={200}
                    level="H"
                    fgColor="#22382D"
                    bgColor="#FFFFFF"
                  />
                </div>
              </div>

              {/* Guest Info */}
              <div className="text-center text-sm space-y-1 mb-4">
                <p className="font-medium text-[#22382D]">{selectedGuest.guest_name}</p>
                <p className="text-xs text-[#A9B89B]">Token: {selectedGuest.guest_token}</p>
                <p className="text-xs text-[#A9B89B]">
                  Status: {getStatusLabel(selectedGuest).label}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadQr.bind(null, selectedGuest)}
                  className="btn-primary-admin flex-1 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Download size={14} /> Download QR
                </button>
                <button
                  onClick={() => handleCopyLink(selectedGuest)}
                  className="btn-outline-admin flex-1 flex items-center justify-center gap-1.5 text-xs"
                >
                  {copiedId === selectedGuest.id ? (
                    <><Check size={14} /> Tersalin</>
                  ) : (
                    <><Copy size={14} /> Salin Link</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

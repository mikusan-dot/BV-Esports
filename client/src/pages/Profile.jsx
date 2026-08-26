import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getRoleColor } from "../utils/permissions";
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Gamepad2,
  ExternalLink,
  Mail,
  Loader2,
  Check,
  X,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";

export default function Profile() {
  const { userData, currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    inGameName: "",
    uid: "",
    dateOfBirth: "",
    address: "",
    device: "",
    socialLinks: { facebook: "", instagram: "", discord: "" },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadProfile() {
    try {
      if (userData?.playerId) {
        const res = await api.get(`/players/${userData.playerId}`);
        setForm({
          name: userData.name || "",
          inGameName: res.data.inGameName || "",
          uid: res.data.uid || "",
          dateOfBirth: res.data.dateOfBirth || "",
          address: res.data.address || "",
          device: res.data.device || "",
          socialLinks: res.data.socialLinks || { facebook: "", instagram: "", discord: "" },
        });
      } else {
        setForm({
          name: userData?.name || "",
          inGameName: "",
          uid: "",
          dateOfBirth: "",
          address: "",
          device: "",
          socialLinks: { facebook: "", instagram: "", discord: "" },
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setForm({
        name: userData?.name || "",
        inGameName: "",
        uid: "",
        dateOfBirth: "",
        address: "",
        device: "",
        socialLinks: { facebook: "", instagram: "", discord: "" },
      });
    } finally {
      setLoading(false);
    }
  }

  function compressImage(file, maxWidth = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed", "error");
      return;
    }

    setUploading(true);
    try {
      showToast("Compressing image...", "success");
      const base64 = await compressImage(file, 400, 0.8);

      showToast("Saving photo...", "success");
      await api.post("/auth/profile/photo", { photoURL: base64 });
      await refreshUser();
      showToast("Profile photo updated!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      showToast(error.response?.data?.error || "Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", form);
      await refreshUser();
      showToast("Profile saved successfully");
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = (userData?.name || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          <div className="flex items-center gap-2">
            {toast.type === "error" ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {toast.message}
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Profile Header */}
      <div className="card-premium rounded-xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[rgba(88,166,255,0.15)] via-[rgba(88,166,255,0.06)] to-[rgba(88,166,255,0.15)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
            {/* Avatar */}
            <div className="relative group self-start sm:self-auto">
              <div className="w-[104px] h-[104px] rounded-2xl bg-[#21262d] border-[3px] border-[#161b22] flex items-center justify-center overflow-hidden shadow-xl">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#58a6ff]">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-[2px]"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>

            {/* Name & Meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl font-extrabold text-text-primary tracking-tight truncate">{userData?.name || "User"}</h1>
                <div className="flex items-center gap-2">
                  <span className={`badge-premium ${getRoleColor(userData?.accountRole)}`}>{userData?.accountRole || "Player"}</span>
                  {userData?.gameRole && (
                    <span className="badge-premium text-[#58a6ff] bg-[rgba(88,166,255,0.1)] border border-[rgba(88,166,255,0.15)]">{userData.gameRole}</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-secondary flex items-center gap-2 mt-1.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{currentUser?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Personal */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[rgba(88,166,255,0.1)] flex items-center justify-center border border-[rgba(88,166,255,0.15)]">
              <User className="w-3.5 h-3.5 text-[#58a6ff]" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Address</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="Your residential address" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted resize-none" />
            </div>
          </div>
        </div>

        {/* Gaming */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[rgba(88,166,255,0.1)] flex items-center justify-center border border-[rgba(88,166,255,0.15)]">
              <Gamepad2 className="w-3.5 h-3.5 text-[#58a6ff]" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Gaming Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">In-Game Name</label>
              <input type="text" value={form.inGameName} onChange={(e) => setForm({ ...form, inGameName: e.target.value })} placeholder="Your Free Fire IGN" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Free Fire UID</label>
              <input type="text" value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} placeholder="Your FF UID" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Device</label>
              <input type="text" value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} placeholder="e.g., iPhone 15 Pro" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="card-premium rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[rgba(88,166,255,0.1)] flex items-center justify-center border border-[rgba(88,166,255,0.15)]">
              <ExternalLink className="w-3.5 h-3.5 text-[#58a6ff]" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Social Links</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Facebook</label>
              <input type="url" value={form.socialLinks.facebook} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/..." className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Instagram</label>
              <input type="url" value={form.socialLinks.instagram} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })} placeholder="https://instagram.com/..." className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Discord</label>
              <input type="text" value={form.socialLinks.discord} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, discord: e.target.value } })} placeholder="username#0000" className="w-full px-3.5 py-2.5 input-premium text-sm text-text-primary placeholder-text-muted" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-text-muted font-medium">
            {userData?.playerId ? "Changes sync to your player profile" : "Complete your profile to link with a player record"}
          </p>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 btn-primary rounded-lg text-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

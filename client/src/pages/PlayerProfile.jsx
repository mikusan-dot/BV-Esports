import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDate } from "../utils/constants";
import { getStatusColor } from "../utils/permissions";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  User,
  Trophy,
  ExternalLink,
  Shield,
  MessageCircle,
} from "lucide-react";

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = userData?.accountRole || "Player";
  const canSeePrivate = role === "Owner" || role === "Admin" || role === "Manager";

  useEffect(() => {
    loadPlayer();
  }, [id]);

  async function loadPlayer() {
    try {
      const res = await api.get(`/players/${id}`);
      setPlayer(res.data);
    } catch (error) {
      console.error("Failed to load player:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted font-medium">Player not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#58a6ff] hover:text-[#79c0ff] text-sm font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero Banner */}
      <div className="card-premium rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[rgba(88,166,255,0.15)] via-[rgba(88,166,255,0.06)] to-[rgba(88,166,255,0.15)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative z-10">
            {/* Avatar */}
            <div className="w-[104px] h-[104px] rounded-2xl bg-[#21262d] border-[3px] border-[#161b22] flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0">
              {player.photoURL ? (
                <img src={player.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-text-muted" />
              )}
            </div>

            {/* Name & Meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl font-extrabold text-text-primary tracking-tight truncate">{player.inGameName}</h1>
                <div className="flex items-center gap-2">
                  <span className={`badge-premium ${getStatusColor(player.status)}`}>{player.status}</span>
                  {player.primaryRole && (
                    <span className="badge-premium text-[#58a6ff] bg-[rgba(88,166,255,0.1)] border border-[rgba(88,166,255,0.15)]">{player.primaryRole}</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-1.5">{player.fullName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <div className="card-premium rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#58a6ff]" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "In-Game Name", value: player.inGameName },
                { label: "Full Name", value: player.fullName },
                { label: "Free Fire UID", value: player.uid || "N/A" },
                { label: "Account Role", value: player.accountRole },
                { label: "Primary Role", value: player.primaryRole || "N/A" },
                { label: "Secondary Role", value: player.secondaryRole || "N/A" },
                { label: "Status", value: player.status },
                { label: "Device", value: player.device || "N/A" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-text-primary font-semibold mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {player.achievements && player.achievements.length > 0 && (
            <div className="card-premium rounded-xl p-5">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#d29922]" />
                Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {player.achievements.map((ach, i) => (
                  <span key={i} className="badge-premium text-[#d29922] bg-[rgba(210,153,34,0.1)] border border-[rgba(210,153,34,0.15)]">
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Join Date */}
          <div className="card-premium rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#58a6ff]" />
              Details
            </h3>
            <div className="p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
              <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Join Date</p>
              <p className="text-sm text-text-primary font-semibold mt-1">{formatDate(player.joinDate)}</p>
            </div>
          </div>

          {/* Social Links */}
          {canSeePrivate && player.socialLinks && Object.values(player.socialLinks).some((v) => v) && (
            <div className="card-premium rounded-xl p-5">
              <h3 className="text-sm font-bold text-text-primary mb-4">Social Links</h3>
              <div className="space-y-2">
                {player.socialLinks.facebook && (
                  <a href={player.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-[#58a6ff] transition-colors p-2.5 rounded-lg hover:bg-[#21262d]">
                    <ExternalLink className="w-4 h-4" /> Facebook
                  </a>
                )}
                {player.socialLinks.instagram && (
                  <a href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-[#58a6ff] transition-colors p-2.5 rounded-lg hover:bg-[#21262d]">
                    <ExternalLink className="w-4 h-4" /> Instagram
                  </a>
                )}
                {player.socialLinks.discord && (
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary p-2.5 rounded-lg">
                    <MessageCircle className="w-4 h-4" /> {player.socialLinks.discord}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

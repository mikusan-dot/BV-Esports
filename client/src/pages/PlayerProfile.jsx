import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDate } from "../utils/constants";
import { getStatusColor, getRoleColor } from "../utils/permissions";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import {
  ArrowLeft,
  User,
  Gamepad2,
  MapPin,
  Calendar,
  Smartphone,
  Trophy,
  ExternalLink,
  Edit3,
  Shield,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = userData?.accountRole || "Player";
  const canManage = hasPermission(role, "canManagePlayers");
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Player not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:text-primary-light text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="card-gradient border border-border rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-bg-card border-4 border-bg-card flex items-center justify-center overflow-hidden">
              {player.photoURL ? (
                <img src={player.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{player.inGameName}</h1>
              <p className="text-sm text-text-muted">{player.fullName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${getStatusColor(player.status)}`}>
                {player.status}
              </span>
              {player.primaryRole && (
                <span className="text-xs font-medium px-2 py-1 rounded-lg border text-primary bg-primary/10 border-primary/20">
                  {player.primaryRole}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-gradient border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
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
                <div key={item.label}>
                  <p className="text-xs text-text-muted">{item.label}</p>
                  <p className="text-sm text-text-primary font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {player.achievements && player.achievements.length > 0 && (
            <div className="card-gradient border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {player.achievements.map((ach, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card-gradient border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">Join Date</p>
                  <p className="text-text-primary">{formatDate(player.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {canSeePrivate && player.socialLinks && Object.values(player.socialLinks).some((v) => v) && (
            <div className="card-gradient border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Social Links</h3>
              <div className="space-y-2">
                {player.socialLinks.facebook && (
                  <a href={player.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4" /> Facebook
                  </a>
                )}
                {player.socialLinks.instagram && (
                  <a href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4" /> Instagram
                  </a>
                )}
                {player.socialLinks.discord && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
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

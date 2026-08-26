const ROLE_HIERARCHY = {
  Owner: 4,
  Admin: 3,
  Manager: 2,
  Player: 1,
};

const PERMISSIONS = {
  Owner: {
    canManageTeam: true,
    canManagePlayers: true,
    canDeletePlayers: true,
    canManageRoles: true,
    canManageFinance: true,
    canViewFinance: true,
    canManageAnnouncements: true,
    canManageSettings: true,
    canViewActivity: true,
    canManageUsers: true,
  },
  Admin: {
    canManageTeam: false,
    canManagePlayers: true,
    canDeletePlayers: false,
    canManageRoles: true,
    canManageFinance: false,
    canViewFinance: true,
    canManageAnnouncements: true,
    canManageSettings: false,
    canViewActivity: true,
    canManageUsers: false,
  },
  Manager: {
    canManageTeam: false,
    canManagePlayers: true,
    canDeletePlayers: false,
    canManageRoles: true,
    canManageFinance: true,
    canViewFinance: true,
    canManageAnnouncements: true,
    canManageSettings: false,
    canViewActivity: true,
    canManageUsers: false,
  },
  Player: {
    canManageTeam: false,
    canManagePlayers: false,
    canDeletePlayers: false,
    canManageRoles: false,
    canManageFinance: false,
    canViewFinance: false,
    canManageAnnouncements: false,
    canManageSettings: false,
    canViewActivity: false,
    canManageUsers: false,
  },
};

export function hasPermission(role, permission) {
  return PERMISSIONS[role]?.[permission] || false;
}

export function hasMinRole(userRole, minRole) {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
}

export function getRoleColor(role) {
  const colors = {
    Owner: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Admin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    Manager: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Player: "text-green-400 bg-green-400/10 border-green-400/20",
  };
  return colors[role] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

export function getStatusColor(status) {
  const colors = {
    Active: "text-green-400 bg-green-400/10 border-green-400/20",
    Inactive: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    Substitute: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Trial: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    "Former Member": "text-red-400 bg-red-400/10 border-red-400/20",
    Banned: "text-red-600 bg-red-600/10 border-red-600/20",
  };
  return colors[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
}

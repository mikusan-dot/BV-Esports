const ACCOUNT_ROLES = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  PLAYER: "Player",
};

const GAME_ROLES = {
  IGL: "IGL",
  RUSHER: "Rusher",
  SUPPORT: "Support",
  SNIPER: "Sniper",
  ASSAULTER: "Assaulter",
  FRAGGER: "Fragger",
  SUBSTITUTE: "Substitute",
  COACH: "Coach",
  ANALYST: "Analyst",
};

const PLAYER_STATUSES = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUBSTITUTE: "Substitute",
  TRIAL: "Trial",
  FORMER: "Former Member",
  BANNED: "Banned",
};

const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

const INCOME_CATEGORIES = [
  "Tournament Prize",
  "Sponsorship",
  "Team Payment",
  "Player Contribution",
  "Content Creation",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Tournament Registration",
  "Gaming Equipment",
  "Jerseys",
  "Travel",
  "Food",
  "Internet",
  "Content Production",
  "Other Expense",
];

const ANNOUNCEMENT_PRIORITIES = {
  NORMAL: "Normal",
  IMPORTANT: "Important",
  URGENT: "Urgent",
};

const ROLE_HIERARCHY = {
  [ACCOUNT_ROLES.OWNER]: 4,
  [ACCOUNT_ROLES.ADMIN]: 3,
  [ACCOUNT_ROLES.MANAGER]: 2,
  [ACCOUNT_ROLES.PLAYER]: 1,
};

const PERMISSIONS = {
  [ACCOUNT_ROLES.OWNER]: {
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
    canDeleteOwner: false,
    canChangeOwnerRole: false,
  },
  [ACCOUNT_ROLES.ADMIN]: {
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
    canDeleteOwner: false,
    canChangeOwnerRole: false,
  },
  [ACCOUNT_ROLES.MANAGER]: {
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
    canDeleteOwner: false,
    canChangeOwnerRole: false,
  },
  [ACCOUNT_ROLES.PLAYER]: {
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
    canDeleteOwner: false,
    canChangeOwnerRole: false,
  },
};

module.exports = {
  ACCOUNT_ROLES,
  GAME_ROLES,
  PLAYER_STATUSES,
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ANNOUNCEMENT_PRIORITIES,
  ROLE_HIERARCHY,
  PERMISSIONS,
};

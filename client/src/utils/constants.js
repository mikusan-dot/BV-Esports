export const GAME_ROLES = ["IGL", "Rusher", "Support", "Sniper", "Assaulter", "Fragger", "Substitute", "Coach", "Analyst"];

export const ACCOUNT_ROLES = ["Owner", "Admin", "Manager", "Player"];

export const PLAYER_STATUSES = ["Active", "Inactive", "Substitute", "Trial", "Former Member", "Banned"];

export const INCOME_CATEGORIES = ["Tournament Prize", "Sponsorship", "Team Payment", "Player Contribution", "Content Creation", "Other Income"];

export const EXPENSE_CATEGORIES = ["Tournament Registration", "Gaming Equipment", "Jerseys", "Travel", "Food", "Internet", "Content Production", "Other Expense"];

export const ANNOUNCEMENT_PRIORITIES = ["Normal", "Important", "Urgent"];

export function formatDate(date) {
  if (!date) return "N/A";
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatCurrency(amount) {
  return `৳${Number(amount || 0).toLocaleString()}`;
}

export function formatDateTime(date) {
  if (!date) return "N/A";
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

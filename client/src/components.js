import { navigationItems, roleLabels } from "./constants.js";
import { icon } from "./icons.js";
import { escapeHtml } from "./utils.js";

export function brand() {
  return `<div class="brand"><div class="brand__mark">${icon("car", 25)}</div><div><strong>DriveCare Hub</strong><span>Vehicle management, simplified</span></div></div>`;
}

export function pageIntro(title, description, action = "") {
  return `<header class="page-intro"><div><p class="eyebrow">DriveCare workspace</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>${action}</header>`;
}

export function panel({ title = "", subtitle = "", content = "", className = "", action = "" }) {
  const header = title || action
    ? `<header class="panel__header"><div>${title ? `<h2>${escapeHtml(title)}</h2>` : ""}${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div>${action}</header>`
    : "";
  return `<section class="panel ${className}">${header}${content}</section>`;
}

export function statCard(iconName, label, value, detail = "") {
  return `<article class="stat-card"><div class="stat-card__icon">${icon(iconName, 22)}</div><div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</div></article>`;
}

export function emptyState(title = "Nothing here yet", description = "") {
  return `<div class="empty-state">${icon("inbox", 28)}<strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
}

export function recordCard({
  title,
  badge = "",
  lines = [],
  danger = false,
  collection = "",
  id = "",
  deleteMessage = "Record deleted.",
  confirmMessage = "Delete this record permanently?",
  extra = "",
}) {
  const deleteButton = collection && id
    ? `<button class="icon-button icon-button--danger" type="button" data-delete-collection="${escapeHtml(collection)}" data-delete-id="${escapeHtml(id)}" data-success="${escapeHtml(deleteMessage)}" data-confirm="${escapeHtml(confirmMessage)}" aria-label="Delete ${escapeHtml(title)}">${icon("trash", 16)}</button>`
    : "";
  return `<article class="record-card ${danger ? "record-card--danger" : ""}"><div class="record-card__heading"><strong>${escapeHtml(title)}</strong><div class="record-card__actions">${badge ? `<span class="tag">${escapeHtml(badge)}</span>` : ""}${deleteButton}</div></div>${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}${extra}</article>`;
}

export function field(label, control, { wide = false, hint = "" } = {}) {
  return `<label class="field ${wide ? "field--wide" : ""}"><span>${escapeHtml(label)}</span>${control}${hint ? `<small>${escapeHtml(hint)}</small>` : ""}</label>`;
}

export function submitButton(label, iconName = "plus") {
  return `<button class="button button--primary form-submit" type="submit">${icon(iconName, 18)}<span>${escapeHtml(label)}</span></button>`;
}

export function alertBox(message) {
  return `<div class="alert-box">${icon("warning", 18)}<span>${escapeHtml(message)}</span></div>`;
}

export function timelineItem(text) {
  return `<div class="timeline-item">${icon("calendar", 17)}<span>${escapeHtml(text)}</span></div>`;
}

export function appShell(user, activePage, notice = null, { demoMode = false } = {}) {
  const availableItems = navigationItems.filter((item) => !item.adminOnly || user.role === "admin");
  const active = availableItems.find((item) => item.id === activePage) || availableItems[0];
  const navigation = availableItems.map((item) => `
    <button type="button" class="nav-item ${item.id === activePage ? "nav-item--active" : ""}" data-page="${item.id}">
      ${icon(item.icon, 19)}<span>${escapeHtml(item.label)}</span>
    </button>`).join("");
  const toast = notice ? `<div class="toast toast--${notice.type === "error" ? "error" : "success"}" role="status">${escapeHtml(notice.message)}</div>` : "";

  const demoBanner = demoMode ? `<div class="demo-banner"><div><strong>GitHub Pages demo mode</strong><span>Data is stored only in this browser. The complete Node.js backend remains in the repository.</span></div><button class="button button--secondary button--compact" id="reset-demo-button" type="button">Reset demo data</button></div>` : "";

  return `<div class="app-shell">
    <button class="mobile-menu" id="mobile-menu" type="button" aria-label="Open navigation">${icon("menu", 22)}</button>
    <button class="sidebar-backdrop" id="sidebar-backdrop" type="button" aria-label="Close navigation"></button>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__top">${brand()}<button class="sidebar__close" id="sidebar-close" type="button" aria-label="Close navigation">${icon("close", 20)}</button></div>
      <div class="user-card"><div class="avatar">${escapeHtml(user.name.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(roleLabels[user.role] || user.role)}</span></div></div>
      <nav class="sidebar__nav" aria-label="Main navigation">${navigation}</nav>
      <button class="logout-button" id="logout-button" type="button">${icon("logout", 18)} Sign out</button>
    </aside>
    <main class="workspace">
      <div class="workspace__bar"><div><strong>${escapeHtml(active.label)}</strong><span>${escapeHtml(active.description)}</span></div><div class="status-dot"><span></span> ${demoMode ? "Demo data active" : "API connected"}</div></div>
      ${demoBanner}
      ${toast}
      <div id="page-content"></div>
    </main>
  </div>`;
}

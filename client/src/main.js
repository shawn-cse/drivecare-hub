import { apiRequest, getToken, isDemoMode, saveToken } from "./api.js";
import { appShell, brand } from "./components.js";
import { emptyData } from "./constants.js";
import { adminView } from "./views/admin.js";
import { mountAuth, renderAuth } from "./views/auth.js";
import { dashboardView } from "./views/dashboard.js";
import { directoryView } from "./views/directory.js";
import { fuelView } from "./views/fuel.js";
import { insuranceView } from "./views/insurance.js";
import { serviceView } from "./views/service.js";
import { trackingView } from "./views/tracking.js";
import { vehiclesView } from "./views/vehicles.js";

class DriveCareApp {
  constructor(root) {
    this.root = root;
    this.user = null;
    this.data = structuredClone(emptyData);
    this.activePage = new URLSearchParams(window.location.search).get("page") || "dashboard";
    this.authMode = "login";
    this.authError = "";
    this.directoryForm = "pump";
    this.notice = null;
    this.noticeTimer = null;
  }

  async init() {
    this.renderLoading();
    if (getToken()) {
      try {
        const payload = await apiRequest("/api/auth/session");
        this.user = payload.user;
        this.data = payload.data;
      } catch {
        saveToken("");
      }
    }
    this.render();
  }

  renderLoading() {
    this.root.innerHTML = `<div class="loading-screen">${brand()}<div class="loading-spinner"></div><p>Opening your workspace…</p></div>`;
  }

  render() {
    if (!this.user) {
      this.root.innerHTML = renderAuth(this.authMode, this.authError);
      mountAuth(this.root, {
        mode: this.authMode,
        setMode: (mode) => {
          this.authMode = mode;
          this.authError = "";
          this.render();
        },
        authenticate: (mode, form) => this.authenticate(mode, form),
      });
      return;
    }

    if (this.activePage === "admin" && this.user.role !== "admin") this.activePage = "dashboard";
    this.root.innerHTML = appShell(this.user, this.activePage, this.notice, { demoMode: isDemoMode() });
    this.bindShell();
    this.renderPage();
  }

  renderPage() {
    const viewMap = {
      dashboard: () => dashboardView(this.data),
      vehicles: () => vehiclesView(this.data),
      fuel: () => fuelView(this.data),
      tracking: () => trackingView(this.data),
      service: () => serviceView(this.data),
      insurance: () => insuranceView(this.data),
      directory: () => directoryView(this.data, this.user, this.directoryForm),
      admin: () => adminView(this.data),
    };
    const view = (viewMap[this.activePage] || viewMap.dashboard)();
    const pageRoot = this.root.querySelector("#page-content");
    pageRoot.innerHTML = view.html;
    view.mount(pageRoot, {
      navigate: (page) => this.navigate(page),
      createRecord: (collection, record, message) => this.createRecord(collection, record, message),
      deleteRecord: (collection, id, message) => this.deleteRecord(collection, id, message),
      showNotice: (message, type) => this.showNotice(message, type),
      setDirectoryForm: (form) => {
        this.directoryForm = form;
        this.render();
      },
    });
  }

  bindShell() {
    const sidebar = this.root.querySelector("#sidebar");
    const backdrop = this.root.querySelector("#sidebar-backdrop");
    const openMenu = () => {
      sidebar.classList.add("sidebar--open");
      backdrop.classList.add("sidebar-backdrop--visible");
    };
    const closeMenu = () => {
      sidebar.classList.remove("sidebar--open");
      backdrop.classList.remove("sidebar-backdrop--visible");
    };
    this.root.querySelector("#mobile-menu")?.addEventListener("click", openMenu);
    this.root.querySelector("#sidebar-close")?.addEventListener("click", closeMenu);
    backdrop?.addEventListener("click", closeMenu);
    this.root.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => this.navigate(button.dataset.page));
    });
    this.root.querySelector("#logout-button")?.addEventListener("click", () => this.logout());
    this.root.querySelector("#reset-demo-button")?.addEventListener("click", () => this.resetDemo());
  }

  navigate(page) {
    this.activePage = page;
    this.render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async authenticate(mode, form) {
    this.authError = "";
    try {
      const payload = await apiRequest(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveToken(payload.token);
      this.user = payload.user;
      this.data = payload.data;
      this.activePage = "dashboard";
      this.render();
    } catch (error) {
      this.authError = error.message;
      this.render();
    }
  }

  async logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // Clearing the local token is sufficient when the API is unavailable.
    }
    saveToken("");
    this.user = null;
    this.data = structuredClone(emptyData);
    this.activePage = "dashboard";
    this.render();
  }

  async createRecord(collection, record, successMessage) {
    try {
      const payload = await apiRequest(`/api/${collection}`, {
        method: "POST",
        body: JSON.stringify(record),
      });
      this.data = payload.data;
      this.showNotice(successMessage, "success");
      return true;
    } catch (error) {
      this.showNotice(error.message, "error");
      return false;
    }
  }

  async deleteRecord(collection, id, successMessage) {
    try {
      const payload = await apiRequest(`/api/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
      this.data = payload.data;
      this.showNotice(successMessage, "success");
      return true;
    } catch (error) {
      this.showNotice(error.message, "error");
      return false;
    }
  }

  async resetDemo() {
    if (!window.confirm("Reset the browser demo to its original sample data?")) return;
    try {
      const payload = await apiRequest("/api/demo/reset", { method: "POST" });
      this.user = payload.user;
      this.data = payload.data;
      this.activePage = "dashboard";
      this.showNotice("Demo data restored.", "success");
    } catch (error) {
      this.showNotice(error.message, "error");
    }
  }

  showNotice(message, type = "success") {
    window.clearTimeout(this.noticeTimer);
    this.notice = { message, type };
    this.render();
    this.noticeTimer = window.setTimeout(() => {
      this.notice = null;
      this.render();
    }, 3200);
  }
}

const app = new DriveCareApp(document.querySelector("#app"));
app.init();

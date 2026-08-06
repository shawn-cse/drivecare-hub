import { brand, field, submitButton } from "../components.js";
import { icon } from "../icons.js";
import { escapeHtml, formToObject } from "../utils.js";

export function renderAuth(mode = "login", error = "") {
  const registerFields = mode === "register" ? `
    ${field("Full name", '<input required name="name" autocomplete="name" placeholder="Shawn Ahmed" />')}
    ${field("Account role", '<select name="role"><option value="owner">Vehicle Owner</option><option value="driver">Driver</option><option value="pump">Petrol Pump Owner</option><option value="garage">Garage Owner</option></select>')}
  ` : "";

  return `<main class="auth-layout">
    <section class="auth-showcase">
      ${brand()}
      <div class="auth-showcase__content">
        <span class="pill">Complete vehicle operations workspace</span>
        <h1>Take better care of every journey.</h1>
        <p>Keep vehicles, fuel expenses, mileage, maintenance, insurance, and saved locations in one reliable dashboard.</p>
        <div class="feature-strip">
          <div>${icon("fuel", 20)}<span><strong>Fuel</strong><small>Cost and mileage</small></span></div>
          <div>${icon("service", 20)}<span><strong>Service</strong><small>Maintenance history</small></span></div>
          <div>${icon("shield", 20)}<span><strong>Insurance</strong><small>Expiry reminders</small></span></div>
          <div>${icon("location", 20)}<span><strong>Location</strong><small>Map-ready records</small></span></div>
        </div>
      </div>
      <div class="auth-proof">${icon("activity", 20)}<span><strong>Built for real daily use</strong><small>Secure API, responsive UI, and organised records</small></span></div>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <div class="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" class="auth-tab ${mode === "login" ? "auth-tab--active" : ""}" data-auth-mode="login">Sign in</button>
          <button type="button" class="auth-tab ${mode === "register" ? "auth-tab--active" : ""}" data-auth-mode="register">Create account</button>
        </div>
        <div class="auth-card__heading"><h2>${mode === "login" ? "Welcome back" : "Start managing smarter"}</h2><p>${mode === "login" ? "Sign in to open your DriveCare workspace." : "Create a secure account for your vehicle records."}</p></div>
        <form class="auth-form" id="auth-form">
          ${registerFields}
          ${field("Email address", '<input required type="email" name="email" autocomplete="email" placeholder="you@example.com" />')}
          ${field("Password", `<input required ${mode === "register" ? 'minlength="8"' : ""} type="password" name="password" autocomplete="${mode === "login" ? "current-password" : "new-password"}" placeholder="Enter your password" />`, { hint: mode === "register" ? "Use at least 8 characters." : "" })}
          ${error ? `<div class="form-error" role="alert">${escapeHtml(error)}</div>` : ""}
          ${submitButton(mode === "login" ? "Sign in securely" : "Create account", "shield")}
        </form>
        <div class="demo-account"><strong>Demo administrator</strong><span>admin@drivecare.app</span><span>Password: admin123</span></div>
      </div>
    </section>
  </main>`;
}

export function mountAuth(root, { mode, setMode, authenticate }) {
  root.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.authMode));
  });
  root.querySelector("#auth-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button[type='submit']");
    button.disabled = true;
    button.querySelector("span").textContent = "Please wait…";
    await authenticate(mode, formToObject(event.currentTarget));
  });
}

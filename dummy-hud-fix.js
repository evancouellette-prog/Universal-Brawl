// Small runtime UI cleanup.
// Keeps dummy health visible while hiding dummy CE, ultimate, CT, and RCT/cooldown UI.
// Also makes only the home-screen Settings button yellow.
// Cooldown meters stay blue; charging/held attacks get orange-white.
(function () {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    body.practice-dummy-hud-active .fighter-panel.right > .ce-frame,
    body.practice-dummy-hud-active .fighter-panel.right > .ultimate-frame,
    body.practice-dummy-hud-active .fighter-panel.right > .ct-cooldowns,
    body.practice-dummy-hud-active #enemyExtraCooldowns,
    body.practice-dummy-hud-active #enemyStars {
      display: none !important;
    }

    #homeScreen .home-panel .start-actions .settings-button {
      background: #d6b84d !important;
      color: #1a1a1d !important;
      border-color: #edf2ff !important;
      box-shadow: 0 4px 0 #7b5a18 !important;
    }

    #homeScreen .home-panel .start-actions .settings-button:active {
      box-shadow: 0 2px 0 #7b5a18 !important;
    }

    .ct-slot,
    .ct-slot.ready,
    .ct-slot.cooling,
    .ct-slot.low-ce,
    .ct-slot.blocked {
      background: #0f2f5f !important;
      border-color: #7dd3fc !important;
      box-shadow: 0 3px 0 rgba(2, 6, 23, 0.66), 0 0 12px rgba(56, 189, 248, 0.24) !important;
    }

    .ct-slot .ct-meter,
    .ct-slot.ready .ct-meter,
    .ct-slot.cooling .ct-meter,
    .ct-slot.low-ce .ct-meter,
    .ct-slot.blocked .ct-meter {
      background: rgba(15, 47, 95, 0.9) !important;
    }

    .ct-slot .ct-fill,
    .ct-slot.ready .ct-fill,
    .ct-slot.cooling .ct-fill,
    .ct-slot.low-ce .ct-fill,
    .ct-slot.blocked .ct-fill {
      background: linear-gradient(90deg, #2563eb, #38bdf8, #bfdbfe) !important;
    }

    .ct-slot .ct-label,
    .ct-slot .ct-status {
      color: #f8fafc !important;
      text-shadow: 0 2px 0 rgba(2, 6, 23, 0.65) !important;
    }

    body.technique-charging #playerCt1Slot,
    body.technique-charging #playerCt2Slot,
    body.technique-charging #playerCt3Slot {
      background: #7c2d12 !important;
      border-color: #ffedd5 !important;
      box-shadow: 0 3px 0 #7c2d12, 0 0 18px rgba(251, 146, 60, 0.6) !important;
    }

    body.technique-charging #playerCt1Slot .ct-fill,
    body.technique-charging #playerCt2Slot .ct-fill,
    body.technique-charging #playerCt3Slot .ct-fill {
      background: linear-gradient(90deg, #fb923c, #ffedd5) !important;
    }
  `;
  document.head.appendChild(style);

  function isVisible(el) {
    return Boolean(el && !el.classList.contains("hidden") && el.offsetParent !== null);
  }

  function isPracticeModeActive() {
    const practiceButton = document.getElementById("practiceSettingsButton");
    const scoreInfo = document.getElementById("scoreInfo");
    const roundInfo = document.getElementById("roundInfo");

    return isVisible(practiceButton)
      || (scoreInfo && scoreInfo.textContent.trim() === "No rounds")
      || (roundInfo && roundInfo.textContent.trim() === "Practice");
  }

  function syncPracticeDummyHud() {
    const active = isPracticeModeActive();
    document.body.classList.toggle("practice-dummy-hud-active", active);
  }

  function syncChargingHud() {
    const playerStatuses = [
      document.getElementById("playerCt1Status"),
      document.getElementById("playerCt2Status"),
      document.getElementById("playerCt3Status")
    ];
    const charging = playerStatuses.some((el) => /charge|hold|aim/i.test(el?.textContent || ""));
    document.body.classList.toggle("technique-charging", charging);
  }

  function syncUi() {
    syncPracticeDummyHud();
    syncChargingHud();
  }

  window.addEventListener("load", syncUi);
  document.addEventListener("click", () => setTimeout(syncUi, 0), true);
  document.addEventListener("keydown", () => setTimeout(syncUi, 0), true);
  document.addEventListener("keyup", () => setTimeout(syncUi, 0), true);
  setInterval(syncUi, 100);
})();

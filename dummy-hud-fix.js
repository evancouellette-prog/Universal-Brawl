// Small runtime UI cleanup.
// Keeps dummy health visible while hiding dummy CE, ultimate, CT, and RCT/cooldown UI.
// Also makes only the home-screen Settings button yellow.
// Gojo cooldowns are blue; Sukuna cooldowns are red; charging/held attacks get orange-white.
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
      background: #041d33 !important;
      border: 3px solid #e0f2fe !important;
      box-shadow: 0 3px 0 rgba(2, 6, 23, 0.9), 0 0 14px rgba(56, 189, 248, 0.36) !important;
      min-height: 54px !important;
    }

    .ct-slot .ct-meter,
    .ct-slot.ready .ct-meter,
    .ct-slot.cooling .ct-meter,
    .ct-slot.low-ce .ct-meter,
    .ct-slot.blocked .ct-meter {
      background: rgba(2, 6, 23, 0.9) !important;
      border: 1px solid rgba(248, 250, 252, 0.8) !important;
      height: 10px !important;
    }

    .ct-slot .ct-fill,
    .ct-slot.ready .ct-fill,
    .ct-slot.cooling .ct-fill,
    .ct-slot.low-ce .ct-fill,
    .ct-slot.blocked .ct-fill {
      background: linear-gradient(90deg, #1d4ed8, #38bdf8, #e0f2fe) !important;
    }

    body.player-sukuna #playerCt1Slot,
    body.player-sukuna #playerCt2Slot,
    body.player-sukuna #playerCt3Slot,
    body.enemy-sukuna #enemyCt1Slot,
    body.enemy-sukuna #enemyCt2Slot,
    body.enemy-sukuna #enemyCt3Slot {
      background: #330707 !important;
      border-color: #fee2e2 !important;
      box-shadow: 0 3px 0 rgba(45, 10, 10, 0.95), 0 0 14px rgba(248, 113, 113, 0.38) !important;
    }

    body.player-sukuna #playerCt1Slot .ct-fill,
    body.player-sukuna #playerCt2Slot .ct-fill,
    body.player-sukuna #playerCt3Slot .ct-fill,
    body.enemy-sukuna #enemyCt1Slot .ct-fill,
    body.enemy-sukuna #enemyCt2Slot .ct-fill,
    body.enemy-sukuna #enemyCt3Slot .ct-fill {
      background: linear-gradient(90deg, #991b1b, #ef4444, #fee2e2) !important;
    }

    .ct-slot .ct-label,
    .ct-slot .ct-status {
      color: #ffffff !important;
      font-weight: 1000 !important;
      letter-spacing: 0.05em !important;
      text-shadow: 0 2px 0 #000, 0 0 6px #000, 0 0 10px #000 !important;
    }

    .ct-slot .ct-label {
      font-size: 0.86rem !important;
      background: rgba(0, 0, 0, 0.66) !important;
      border: 1px solid rgba(255, 255, 255, 0.45) !important;
      border-radius: 8px !important;
      padding: 1px 6px !important;
      width: fit-content !important;
      margin-inline: auto !important;
    }

    .ct-slot .ct-status {
      font-size: 0.78rem !important;
      background: rgba(0, 0, 0, 0.78) !important;
      border: 1px solid rgba(255, 255, 255, 0.45) !important;
      border-radius: 8px !important;
      padding: 2px 7px !important;
    }

    .extra-cooldowns {
      gap: 6px !important;
    }

    .extra-cooldown {
      color: #ffffff !important;
      font-weight: 1000 !important;
      letter-spacing: 0.04em !important;
      text-shadow: 0 2px 0 #000, 0 0 6px #000 !important;
      background: #041d33 !important;
      border: 2px solid #e0f2fe !important;
      box-shadow: 0 2px 0 rgba(2, 6, 23, 0.85), 0 0 10px rgba(56, 189, 248, 0.3) !important;
      border-radius: 10px !important;
      padding: 4px 8px !important;
    }

    .extra-cooldown.blue-extra,
    .extra-cooldown.blue-amp-extra {
      background: #0c4a6e !important;
      border-color: #bae6fd !important;
      box-shadow: 0 2px 0 #082f49, 0 0 12px rgba(56, 189, 248, 0.45) !important;
    }

    .extra-cooldown.rct-extra {
      background: #14532d !important;
      border-color: #bbf7d0 !important;
      box-shadow: 0 2px 0 #052e16, 0 0 12px rgba(34, 197, 94, 0.42) !important;
    }

    .extra-cooldown.stun-extra,
    .extra-cooldown.combo-extra {
      background: #7c2d12 !important;
      border-color: #fed7aa !important;
      box-shadow: 0 2px 0 #431407, 0 0 12px rgba(251, 146, 60, 0.42) !important;
    }

    body.player-sukuna #playerExtraCooldowns .extra-cooldown,
    body.enemy-sukuna #enemyExtraCooldowns .extra-cooldown {
      background: #330707 !important;
      border-color: #fecaca !important;
      box-shadow: 0 2px 0 #1f0505, 0 0 10px rgba(248, 113, 113, 0.36) !important;
    }

    body.player-sukuna #playerExtraCooldowns .extra-cooldown.rct-extra,
    body.enemy-sukuna #enemyExtraCooldowns .extra-cooldown.rct-extra {
      background: #14532d !important;
      border-color: #bbf7d0 !important;
      box-shadow: 0 2px 0 #052e16, 0 0 12px rgba(34, 197, 94, 0.42) !important;
    }

    body.technique-charging #playerCt1Slot,
    body.technique-charging #playerCt2Slot,
    body.technique-charging #playerCt3Slot {
      background: #7c2d12 !important;
      border-color: #ffedd5 !important;
      box-shadow: 0 3px 0 #431407, 0 0 18px rgba(251, 146, 60, 0.62) !important;
    }

    body.technique-charging #playerCt1Slot .ct-fill,
    body.technique-charging #playerCt2Slot .ct-fill,
    body.technique-charging #playerCt3Slot .ct-fill {
      background: linear-gradient(90deg, #ea580c, #fb923c, #ffedd5) !important;
    }
  `;
  document.head.appendChild(style);

  function isVisible(el) {
    return Boolean(el && !el.classList.contains("hidden") && el.offsetParent !== null);
  }

  function panelIsSukuna(prefix) {
    const labels = [
      document.getElementById(`${prefix}Ct1Label`),
      document.getElementById(`${prefix}Ct2Label`),
      document.getElementById(`${prefix}Ct3Label`)
    ].map((el) => (el?.textContent || "").toLowerCase()).join(" ");

    return /dismantle|cleave|fuga|shrine|sukuna/.test(labels);
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

  function syncCharacterCooldownColors() {
    document.body.classList.toggle("player-sukuna", panelIsSukuna("player"));
    document.body.classList.toggle("enemy-sukuna", panelIsSukuna("enemy"));
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

  function cleanLabel(text) {
    return String(text || "")
      .replace(/Blue\s*Amp/i, "Blue Amp")
      .replace(/\bAmp\b/i, "Blue Amp")
      .replace(/Infinity/i, "Infinity")
      .replace(/Stun\s*Combo/i, "Stun Combo")
      .trim();
  }

  function classifyExtraCooldowns() {
    document.querySelectorAll(".extra-cooldown").forEach((el) => {
      const text = cleanLabel(el.textContent);
      if (text && text !== el.textContent) el.textContent = text;
      const lower = text.toLowerCase();
      el.classList.toggle("blue-extra", lower.includes("infinity"));
      el.classList.toggle("blue-amp-extra", lower.includes("blue amp"));
      el.classList.toggle("rct-extra", lower.includes("rct"));
      el.classList.toggle("stun-extra", lower.includes("stun"));
      el.classList.toggle("combo-extra", lower.includes("combo"));
    });
  }

  function syncUi() {
    syncPracticeDummyHud();
    syncCharacterCooldownColors();
    syncChargingHud();
    classifyExtraCooldowns();
  }

  window.addEventListener("load", syncUi);
  document.addEventListener("click", () => setTimeout(syncUi, 0), true);
  document.addEventListener("keydown", () => setTimeout(syncUi, 0), true);
  document.addEventListener("keyup", () => setTimeout(syncUi, 0), true);
  setInterval(syncUi, 100);
})();

/* ==================================================
   CYBER SHIELD MOBILE
   Interactive Cybersecurity Frontend Prototype
   File: script.js
================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // ---------- SELECT ELEMENTS ----------

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    // ---------- APP STATE ----------

    const state = {
        emergencyMode: false,
        lastScore: 84,
        checksCompleted: 0
    };

    // ---------- NOTIFICATION SYSTEM ----------

    function notify(message, type = "info") {
        let container = $("#cyber-notifications");

        if (!container) {
            container = document.createElement("div");
            container.id = "cyber-notifications";

            Object.assign(container.style, {
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: "9999",
                display: "grid",
                gap: "10px",
                width: "min(360px, calc(100vw - 32px))"
            });

            document.body.appendChild(container);
        }

        const colors = {
            info: "#36a3ff",
            success: "#37e6a2",
            warning: "#ffcb70",
            danger: "#ff647c"
        };

        const toast = document.createElement("div");

        Object.assign(toast.style, {
            padding: "15px 18px",
            borderRadius: "14px",
            background: "#111b31",
            color: "#f2f6ff",
            border: `1px solid ${colors[type] || colors.info}`,
            boxShadow: "0 12px 35px rgba(0,0,0,.35)",
            fontSize: "14px",
            lineHeight: "1.6",
            overflowWrap: "anywhere"
        });

        toast.setAttribute("role", "status");
        toast.textContent = message;
        container.appendChild(toast);

        // Automatically remove notification after a delay.
        window.setTimeout(() => toast.remove(), 4000);
    }

    // ---------- CREATE ACCESSIBLE BUTTONS ----------

    function createButton(label, className = "btn") {
        const button = document.createElement("button");

        button.type = "button";
        button.className = className;
        button.textContent = label;

        return button;
    }

    function addCardAction(card, label, callback) {
        if ($("button[data-cyber-action]", card)) return;

        const button = createButton(label, "btn");

        button.dataset.cyberAction = "true";
        button.style.marginTop = "18px";
        button.style.fontSize = "13px";
        button.style.width = "100%";

        button.addEventListener("click", callback);
        card.appendChild(button);
    }

    // ---------- MODAL / DETAIL PANEL ----------

    function showDetails(title, description, tips = []) {
        const oldModal = $("#cyber-detail-modal");
        if (oldModal) oldModal.remove();

        const overlay = document.createElement("div");
        overlay.id = "cyber-detail-modal";
        overlay.setAttribute("role", "presentation");

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "10000",
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background: "rgba(2, 6, 18, .82)",
            backdropFilter: "blur(8px)"
        });

        const panel = document.createElement("section");
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-labelledby", "cyber-modal-title");

        Object.assign(panel.style, {
            width: "min(520px, 100%)",
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "26px",
            borderRadius: "20px",
            background: "#101a2d",
            border: "1px solid rgba(100, 170, 255, .35)",
            color: "#f2f6ff",
            boxShadow: "0 25px 80px rgba(0,0,0,.5)"
        });

        const heading = document.createElement("h2");
        heading.id = "cyber-modal-title";
        heading.textContent = title;

        const text = document.createElement("p");
        text.textContent = description;
        text.style.margin = "16px 0";
        text.style.lineHeight = "1.8";
        text.style.color = "#b5c4dc";

        const list = document.createElement("ul");
        list.style.paddingLeft = "20px";
        list.style.lineHeight = "2";

        tips.forEach(tip => {
            const item = document.createElement("li");
            item.textContent = tip;
            list.appendChild(item);
        });

        const close = createButton("Close", "btn");
        close.style.marginTop = "22px";

        close.addEventListener("click", () => {
            overlay.remove();
        });

        overlay.addEventListener("click", event => {
            if (event.target === overlay) overlay.remove();
        });

        panel.append(heading, text, list, close);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        close.focus();

        function handleEscape(event) {
            if (event.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", handleEscape);
            }
        }

        document.addEventListener("keydown", handleEscape);
    }

    // ---------- CYBER HEALTH SCORE ----------

    function updateScore() {
        const scoreElement = $(".score-number");
        const scoreCircle = $(".score-circle");

        // This is an illustrative demo score, not a real device scan.
        const demoChecks = [
            {
                name: "Screen lock",
                safe: true,
                tip: "Use a strong screen lock."
            },
            {
                name: "App permissions",
                safe: false,
                tip: "Review permissions for apps that do not need them."
            },
            {
                name: "Software updates",
                safe: true,
                tip: "Install updates from your device settings."
            },
            {
                name: "Public Wi-Fi",
                safe: false,
                tip: "Avoid sensitive activity on untrusted networks."
            },
            {
                name: "Account protection",
                safe: true,
                tip: "Enable multi-factor authentication where available."
            }
        ];

        const safeCount = demoChecks.filter(check => check.safe).length;
        const score = Math.round(
            (safeCount / demoChecks.length) * 100
        );

        state.lastScore = score;
        state.checksCompleted++;

        if (scoreElement) {
            scoreElement.textContent = score;
        }

        if (scoreCircle) {
            const degrees = score * 3.6;

            scoreCircle.style.background =
                `conic-gradient(#35f2dc 0deg ${degrees}deg, ` +
                `rgba(255,255,255,.08) ${degrees}deg 360deg)`;
        }

        notify(
            "Demo check complete. The displayed score uses sample data, not your phone.",
            "success"
        );

        showDetails(
            "Cyber Health Demo",
            `Sample score: ${score}/100. This is a demonstration based on five predefined example checks. No device was scanned.`,
            demoChecks.map(check =>
                `${check.name}: ${check.safe ? "Example passed" : "Example needs review"} — ${check.tip}`
            )
        );
    }

    // ---------- PUBLIC WI-FI RISK CHECKER ----------

    function openWifiChecker() {
        showDetails(
            "Public Wi-Fi Safety Guide",
            "Choose a situation below to understand its general risk. This educational demo does not inspect your current network.",
            [
                "Open Wi-Fi with no password: use caution; avoid sensitive activity.",
                "Unknown network asking for personal information: do not provide it.",
                "Trusted network with verified details: still use HTTPS websites and keep software updated.",
                "Never ignore certificate warnings or unexpected login pages.",
                "Use your mobile data for sensitive tasks when network trust is uncertain."
            ]
        );
    }

    // ---------- APP PERMISSION ANALYZER ----------

    function openPermissionAnalyzer() {
        showDetails(
            "App Permission Guide",
            "This guide explains how to review permissions manually. It cannot read installed apps from a normal webpage.",
            [
                "Open your phone Settings.",
                "Find Apps or Privacy, then Permission Manager.",
                "Review camera, microphone, location and contacts access.",
                "Remove access that an app does not reasonably need.",
                "Review permissions again after installing new apps."
            ]
        );
    }

    // ---------- EMERGENCY PRIVACY MODE ----------

    function setupEmergencyMode(card) {
        const button = createButton(
            "Enable Demo Privacy Mode",
            "btn"
        );

        button.style.marginTop = "18px";
        button.style.width = "100%";

        const status = document.createElement("p");
        status.style.marginTop = "12px";
        status.style.fontSize = "13px";
        status.setAttribute("role", "status");
        status.textContent = "Demo mode is currently off.";

        button.addEventListener("click", () => {
            state.emergencyMode = !state.emergencyMode;

            button.textContent = state.emergencyMode
                ? "Turn Demo Mode Off"
                : "Enable Demo Privacy Mode";

            status.textContent = state.emergencyMode
                ? "Demo mode is on. No real phone data or settings have changed."
                : "Demo mode is off.";

            card.style.borderColor = state.emergencyMode
                ? "rgba(255, 203, 112, .65)"
                : "";

            notify(
                state.emergencyMode
                    ? "Privacy demo mode enabled. No actual device lock was performed."
                    : "Privacy demo mode disabled.",
                state.emergencyMode ? "warning" : "info"
            );
        });

        card.append(button, status);
    }

    // ---------- FEATURE CARD INTERACTIONS ----------

    function setupCards() {
        $$(".card").forEach(card => {
            const heading = $("h3", card);
            if (!heading) return;

            const title = heading.textContent.trim().toLowerCase();

            if (title.includes("cyber health")) {
                addCardAction(card, "Run Demo Check", updateScore);
            } else if (title.includes("wi-fi")) {
                addCardAction(card, "Check Safety Tips", openWifiChecker);
            } else if (title.includes("emergency")) {
                setupEmergencyMode(card);
            } else if (title.includes("family")) {
                addCardAction(card, "View Family Tips", () => {
                    showDetails(
                        "Family Cyber Safety",
                        "Simple practices can help families use the internet more safely.",
                        [
                            "Use age-appropriate privacy settings.",
                            "Discuss suspicious messages without blame.",
                            "Use unique passwords and multi-factor authentication.",
                            "Keep devices and apps updated.",
                            "Agree on safe sharing and screen-time habits."
                        ]
                    );
                });
            } else if (title.includes("camera")) {
                addCardAction(card, "View Privacy Tips", () => {
                    showDetails(
                        "Camera Privacy",
                        "Learn how to check camera access in your device settings.",
                        [
                            "Review which apps have camera permission.",
                            "Allow camera access only when needed.",
                            "Keep your operating system updated.",
                            "Look for unexpected permission requests."
                        ]
                    );
                });
            } else if (title.includes("permission")) {
                addCardAction(
                    card,
                    "Review Permission Guide",
                    openPermissionAnalyzer
                );
            }
        });
    }

    // ---------- NAVIGATION ----------

    function setupNavigation() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener("click", event => {
                const id = link.getAttribute("href");

                if (!id || id === "#") {
                    event.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                    return;
                }

                const target = $(id);

                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });
        });
    }

    // ---------- FOOTER YEAR ----------

    function setupFooter() {
        const footer = $(".footer");

        if (!footer) return;

        const paragraphs = $$("p", footer);
        const copyright = paragraphs.find(p =>
            p.textContent.includes("2026")
        );

        if (copyright) {
            copyright.textContent =
                `© ${new Date().getFullYear()} Cyber Shield Mobile. ` +
                "Built for a safer digital future.";
        }
    }

    // ---------- INITIALIZE APP ----------

    setupCards();
    setupNavigation();
    setupFooter();

    console.info(
        "Cyber Shield Mobile initialized. Frontend demonstration only."
    );

    // Add a small, clear demo notice.
    if (!$("#cyber-demo-notice")) {
        const notice = document.createElement("p");

        notice.id = "cyber-demo-notice";
        notice.textContent =
            "Prototype mode: security results use sample data.";

        Object.assign(notice.style, {
            textAlign: "center",
            padding: "10px 16px",
            color: "#96a5c0",
            fontSize: "12px"
        });

        const main = $("main");

        if (main) {
            main.appendChild(notice);
        }
    }
});
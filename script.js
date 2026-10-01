/* =====================================================
   BIVA.EXE — script.js
   Sections:
   1. Settings & small helpers
   2. Background effects (hearts, particles, petals)
   3. Cursor glow (desktop only)
   4. Terminal helpers (typing, progress bars)
   5. Boot sequence
   6. Login (exact name check, denied, success)
   7. Poem modal
   8. Command line (easter eggs)
   9. Music button
   ===================================================== */

(function () {
  "use strict";

  /* ---------- 1. Settings & small helpers ---------- */

  // The ONLY name that unlocks the site. Change it here if you ever need to.
  const SECRET_NAME = "BIVA";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  // Grab the elements we need
  const el = {
    terminal: document.getElementById("terminal"),
    body: document.getElementById("terminalBody"),
    output: document.getElementById("output"),
    loginForm: document.getElementById("loginForm"),
    nameInput: document.getElementById("nameInput"),
    accessBtn: document.getElementById("accessBtn"),
    retryRow: document.getElementById("retryRow"),
    retryBtn: document.getElementById("retryBtn"),
    cmdForm: document.getElementById("cmdForm"),
    cmdInput: document.getElementById("cmdInput"),
    modal: document.getElementById("modal"),
    poem: document.getElementById("poem"),
    poemHeart: document.getElementById("poemHeart"),
    closeBtn: document.getElementById("closeBtn"),
    hearts: document.getElementById("hearts"),
    particles: document.getElementById("particles"),
    petals: document.getElementById("petals"),
    glow: document.getElementById("cursorGlow"),
    musicBtn: document.getElementById("musicBtn"),
    music: document.getElementById("bgMusic"),
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  /* ---------- 2. Background effects ---------- */

  const HEART_SYMBOLS = ["💗", "💕", "💖", "♥", "❤"];
  const MAX_HEARTS = 30;

  // One floating heart: random size, speed, opacity, drift and rotation
  function spawnHeart() {
    if (document.hidden || el.hearts.childElementCount >= MAX_HEARTS) return;
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = pick(HEART_SYMBOLS);
    heart.style.left = rand(2, 98) + "%";
    heart.style.fontSize = rand(12, 34) + "px";
    heart.style.setProperty("--op", rand(0.35, 0.9).toFixed(2));
    heart.style.setProperty("--drift", rand(-70, 70).toFixed(0) + "px");
    heart.style.setProperty("--spin", rand(-60, 60).toFixed(0) + "deg");
    heart.style.animationDuration = rand(11, 22) + "s";
    // Remove from the page once it reached the top
    heart.addEventListener("animationend", () => heart.remove());
    el.hearts.appendChild(heart);
  }

  // A quick burst of hearts (used when Biva logs in)
  function heartBurst(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(spawnHeart, i * 120);
    }
  }

  // Tiny glowing particles that live forever and drift around
  function createParticles(count) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      const size = rand(2, 5);
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = rand(0, 100) + "%";
      p.style.top = rand(0, 100) + "%";
      p.style.setProperty("--dx", rand(-60, 60).toFixed(0) + "px");
      p.style.setProperty("--dy", rand(-70, 70).toFixed(0) + "px");
      p.style.animationDuration = rand(9, 18) + "s, " + rand(2.5, 6) + "s";
      p.style.animationDelay = "-" + rand(0, 10).toFixed(1) + "s, -" + rand(0, 5).toFixed(1) + "s";
      el.particles.appendChild(p);
    }
  }

  // Subtle petals falling from the top
  function spawnPetal() {
    if (document.hidden || el.petals.childElementCount >= 10) return;
    const petal = document.createElement("span");
    petal.className = "petal";
    const size = rand(9, 16);
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.left = rand(0, 100) + "%";
    petal.style.setProperty("--sway", rand(-80, 80).toFixed(0) + "px");
    petal.style.animationDuration = rand(14, 24) + "s";
    petal.addEventListener("animationend", () => petal.remove());
    el.petals.appendChild(petal);
  }

  function startBackground() {
    createParticles(isTouchDevice ? 22 : 38);
    heartBurst(6);
    setInterval(spawnHeart, 1100);
    setInterval(spawnPetal, 2800);
  }

  // Makes the world brighter and fills it with hearts for a few seconds
  function magicMoment() {
    document.body.classList.add("magic");
    heartBurst(18);
    setTimeout(() => document.body.classList.remove("magic"), 9000);
  }

  /* ---------- 3. Cursor glow (desktop only) ---------- */

  function startCursorGlow() {
    if (isTouchDevice || prefersReducedMotion) return;
    let lastTrail = 0;

    window.addEventListener("mousemove", (e) => {
      el.glow.classList.add("active");
      el.glow.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)";

      // Leave a tiny fading sparkle, but not too often
      const now = performance.now();
      if (now - lastTrail > 70) {
        lastTrail = now;
        const dot = document.createElement("span");
        dot.className = "trail";
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
        dot.addEventListener("animationend", () => dot.remove());
        document.body.appendChild(dot);
      }
    });
    document.addEventListener("mouseleave", () => el.glow.classList.remove("active"));
  }

  /* ---------- 4. Terminal helpers ---------- */

  function scrollDown() {
    el.body.scrollTop = el.body.scrollHeight;
  }

  // Adds a line to the terminal. textContent is used, so text is always safe.
  // options.type = true -> typed out letter by letter
  async function addLine(text, className, options) {
    const opts = options || {};
    const line = document.createElement("div");
    line.className = "line" + (className ? " " + className : "");
    el.output.appendChild(line);

    if (opts.type) {
      line.classList.add("typing");
      const speed = opts.speed || 28;
      for (const ch of text) {
        line.textContent += ch;
        scrollDown();
        await sleep(speed + rand(-8, 10));
      }
      line.classList.remove("typing");
    } else {
      line.textContent = text;
    }
    scrollDown();
    if (opts.pause) await sleep(opts.pause);
    return line;
  }

  // Animated progress bar: ████████░░░░ 40%
  async function progressBar(label, duration) {
    const line = await addLine("", "bar");
    const total = 20;
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const filled = Math.round((i / steps) * total);
      const percent = Math.round((i / steps) * 100);
      line.textContent = "█".repeat(filled) + "░".repeat(total - filled) + " " + percent + "%";
      scrollDown();
      await sleep(duration / steps);
    }
    line.classList.add("ok");
    if (label) await addLine(label, "ok");
  }

  function clearOutput() {
    el.output.textContent = "";
  }

  // Restart a CSS animation class (shake, glitch)
  function playTerminalEffect(className, ms) {
    el.terminal.classList.remove("shake", "glitch");
    void el.terminal.offsetWidth; // force the browser to restart the animation
    el.terminal.classList.add(className);
    setTimeout(() => el.terminal.classList.remove(className), ms);
  }

  function showForm(form) {
    form.hidden = false;
    scrollDown();
  }

  /* ---------- 5. Boot sequence ---------- */

  let busy = true; // blocks the form while animations play

  async function bootSequence() {
    busy = true;
    await sleep(600);
    await addLine("> Initializing...", "", { type: true, pause: 350 });
    await addLine("> Loading emotional database...", "", { type: true, pause: 350 });
    await addLine("> Searching for someone special...", "pink", { type: true, pause: 450 });
    await addLine("> Identity verification required.", "dim", { type: true, pause: 300 });
    showForm(el.loginForm);
    busy = false;
    if (!isTouchDevice) el.nameInput.focus(); // on phones, don't pop the keyboard open uninvited
  }

  /* ---------- 6. Login ---------- */

  // Funny messages for a wrong name. Each entry is a list of [text, cssClass].
  const DENIED_MESSAGES = [
    [
      ["✗ ACCESS DENIED", "err big"],
      ["Nice try.", ""],
      ["But this system only recognizes one person. ❤️", "pink"],
    ],
    [
      ["⚠ IDENTITY UNKNOWN", "err big"],
      ["Who are you?", ""],
      ["The system is waiting for BIVA.", "pink"],
    ],
    [
      ["403 — HEART ACCESS DENIED", "err big"],
      ["Sorry.", ""],
      ["You're not the person this website was created for. 💀", "pink"],
    ],
    [
      ["> Searching...", "dim"],
      ["> Searching...", "dim"],
      ["> Still not BIVA.", ""],
      ["ACCESS DENIED. 😭", "err big"],
    ],
    [
      ["SYSTEM MESSAGE:", "err"],
      ["There is only one correct answer.", ""],
      ["Hint:", "dim"],
      ["B _ V A", "pink big"],
      ["❤️", "pink"],
    ],
  ];

  let lastDeniedIndex = -1;

  function nextDeniedMessage() {
    // Never show the same message twice in a row
    let index;
    do {
      index = Math.floor(Math.random() * DENIED_MESSAGES.length);
    } while (index === lastDeniedIndex && DENIED_MESSAGES.length > 1);
    lastDeniedIndex = index;
    return DENIED_MESSAGES[index];
  }

  el.loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Enter key and the ACCESS button both end up here
    if (busy) return;

    const typed = el.nameInput.value.trim();
    if (typed === "") {
      addLine("> Input is empty. Type a name to continue.", "err");
      return;
    }

    // EXACT match, case-insensitive. "BIVAA", "MY BIVA", "BIVA123" all fail.
    if (typed.toUpperCase() === SECRET_NAME) {
      grantAccess();
    } else {
      denyAccess(typed);
    }
  });

  async function denyAccess(typed) {
    busy = true;
    el.loginForm.hidden = true;
    el.nameInput.blur();

    // Show what was typed (safe: textContent only), shortened if very long
    const shown = typed.toUpperCase().slice(0, 24);

    await addLine("> Scanning identity...", "dim", { type: true, speed: 20, pause: 300 });
    await addLine("> Identity detected: " + shown, "", { type: true, speed: 20, pause: 350 });
    await addLine("✗ IDENTITY NOT RECOGNIZED", "err big");

    el.terminal.classList.add("is-error");
    playTerminalEffect("shake", 600);
    await sleep(500);

    for (const [text, cls] of nextDeniedMessage()) {
      await addLine(text, cls, { pause: 280 });
    }
    await addLine("This system was built for BIVA. ❤️", "pink");

    el.retryRow.hidden = false;
    scrollDown();
    busy = false;
  }

  el.retryBtn.addEventListener("click", async () => {
    el.retryRow.hidden = true;
    el.terminal.classList.remove("is-error");
    clearOutput();
    el.nameInput.value = "";
    await addLine("> Identity verification required.", "dim", { type: true, speed: 18 });
    showForm(el.loginForm);
    if (!isTouchDevice) el.nameInput.focus();
  });

  async function grantAccess() {
    busy = true;
    el.loginForm.hidden = true;
    el.nameInput.blur();
    clearOutput();

    await addLine("> Identity detected...", "dim", { type: true, speed: 22, pause: 250 });
    await addLine("> BIVA", "pink big", { type: true, speed: 60, pause: 350 });
    await addLine("> Verifying...", "dim", { type: true, speed: 22 });
    await progressBar("", 1500);

    el.terminal.classList.add("is-success");
    playTerminalEffect("glitch", 750);
    magicMoment();

    await addLine("✓ Identity confirmed.", "ok", { pause: 350 });
    await addLine("✓ Access granted.", "ok", { pause: 350 });
    await addLine("✓ Welcome, Biva. ❤️", "ok big", { pause: 900 });

    await addLine("> Accessing restricted files...", "dim", { type: true, speed: 22, pause: 300 });
    await addLine("> Searching...", "dim", { type: true, speed: 22, pause: 500 });
    await addLine("> File found.", "ok", { type: true, speed: 22, pause: 400 });
    await addLine("/", "file");
    await addLine("  heart/", "file", { pause: 250 });
    await addLine("    for_biva.txt", "file pink", { pause: 600 });

    await addLine("> Decrypting...", "dim", { type: true, speed: 22 });
    await progressBar("", 1700);
    await sleep(500);

    openModal();
  }

  /* ---------- 7. Poem modal ---------- */

  // Each item is one line. "" = gap between stanzas.
  // type "title" and "hl" (highlight) get special styling.
  const POEM = [
    { text: "For Biva", type: "title" },
    { text: "" },
    { text: "Some people arrive like sunlight," },
    { text: "quietly turning ordinary moments gold." },
    { text: "" },
    { text: "And then there are those rare ones," },
    { text: "who somehow make the whole world" },
    { text: "feel a little less cold." },
    { text: "" },
    { text: "I don't know when it happened," },
    { text: "or exactly how you became" },
    { text: "a thought that lingers longer" },
    { text: "than it probably should..." },
    { text: "" },
    { text: "But if my heart had a favorite notification," },
    { text: "I think it would always be:" },
    { text: "" },
    { text: "“Biva is online.” ❤️", type: "hl" },
  ];

  let poemRun = 0; // changes every time the modal opens/closes so old typing stops

  async function openModal() {
    const run = ++poemRun;
    el.poem.textContent = "";
    el.poemHeart.classList.remove("show");

    el.modal.hidden = false;
    el.modal.setAttribute("aria-hidden", "false");
    void el.modal.offsetWidth;
    el.modal.classList.add("open");
    el.closeBtn.focus({ preventScroll: true });

    await sleep(900);
    await typePoem(run);
  }

  async function typePoem(run) {
    for (const item of POEM) {
      if (run !== poemRun) return; // modal was closed, stop typing

      const p = document.createElement("p");
      if (item.type === "title") p.className = "poem-title";
      if (item.text === "") p.className = "poem-gap";
      el.poem.appendChild(p);

      // The highlighted line gets its own glowing <span>
      let target = p;
      if (item.type === "hl") {
        target = document.createElement("span");
        target.className = "poem-hl";
        p.appendChild(target);
      }

      if (item.text !== "") {
        p.classList.add("typing");
        for (const ch of item.text) {
          if (run !== poemRun) return;
          target.textContent += ch;
          await sleep(item.type === "hl" ? 85 : 38);
        }
        p.classList.remove("typing");
        await sleep(item.type === "title" ? 500 : 260);
      } else {
        await sleep(280);
      }
    }
    if (run === poemRun) el.poemHeart.classList.add("show");
  }

  async function closeModal() {
    if (el.modal.hidden) return;
    poemRun++; // cancels any poem typing in progress
    el.modal.classList.remove("open");
    el.modal.setAttribute("aria-hidden", "true");
    await sleep(450);
    el.modal.hidden = true;

    // Back to the terminal
    await addLine("> File safely closed.", "dim", { type: true, speed: 22, pause: 400 });
    await addLine("> But the message remains. ❤️", "pink", { type: true, speed: 30, pause: 500 });
    await addLine("Type help to see what else is hidden here.", "dim");
    showForm(el.cmdForm);
    if (!isTouchDevice) el.cmdInput.focus();
    busy = false;
  }

  el.closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.modal.hidden) closeModal();
  });
  // Clicking the dark area outside the card also closes it
  el.modal.addEventListener("click", (e) => {
    if (e.target === el.modal) closeModal();
  });

  /* ---------- 8. Command line (easter eggs) ---------- */

  const SECRET_MESSAGES = [
    ["> Decrypting secret...", "Some days I just wait for a message", "that starts with your name. ❤️"],
    ["> Decrypting secret...", "You are the only notification", "I never want to mute. ✨"],
    ["> Decrypting secret...", "If I could debug my heart,", "every error would still lead back to you. 💗"],
  ];

  // Each command returns a list of [text, cssClass]
  const COMMANDS = {
    help: () => [
      ["Available commands:", "pink"],
      ["", ""],
      ["help", ""],
      ["about", ""],
      ["heart", ""],
      ["secret", ""],
      ["exit", ""],
    ],
    about: () => [
      ["> About this system:", "dim"],
      ["Created for one particular person.", ""],
      ["", ""],
      ["Name:", "dim"],
      ["BIVA ❤️", "pink big"],
    ],
    heart: () => [
      ["> Running heart.exe...", "dim"],
      ["I think someone has been living", "pink"],
      ["rent-free in my thoughts lately. ❤️", "pink"],
    ],
    secret: () => pick(SECRET_MESSAGES).map((t, i) => [t, i === 0 ? "dim" : "pink"]),
  };

  el.cmdForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;

    const raw = el.cmdInput.value.trim();
    el.cmdInput.value = "";
    if (raw === "") return;

    const command = raw.toLowerCase();
    await addLine("biva@heart:~$ " + raw, "dim"); // safe: textContent

    if (command === "exit") {
      await exitSystem();
      return;
    }

    if (Object.prototype.hasOwnProperty.call(COMMANDS, command)) {
      busy = true;
      for (const [text, cls] of COMMANDS[command]()) {
        await addLine(text, cls, { pause: 120 });
      }
      if (command === "heart" || command === "secret") heartBurst(8);
      busy = false;
    } else {
      await addLine("Command not found. Type help.", "err");
    }
    scrollDown();
  });

  async function exitSystem() {
    busy = true;
    el.cmdForm.hidden = true;
    await addLine("> Closing session...", "dim", { type: true, speed: 24, pause: 400 });
    await addLine("The file will be here whenever you come back. ❤️", "pink", { pause: 1600 });

    // Reset to the login screen
    el.terminal.classList.remove("is-success");
    clearOutput();
    el.nameInput.value = "";
    bootSequence();
  }

  /* ---------- 9. Music button (never autoplays) ---------- */

  el.musicBtn.addEventListener("click", async () => {
    const turningOn = el.musicBtn.getAttribute("aria-pressed") !== "true";

    if (!turningOn) {
      el.music.pause();
      el.musicBtn.setAttribute("aria-pressed", "false");
      el.musicBtn.textContent = "♫ Music";
      return;
    }

    try {
      await el.music.play(); // fails if assets/music.mp3 doesn't exist
      el.musicBtn.setAttribute("aria-pressed", "true");
      el.musicBtn.textContent = "♫ Music on";
    } catch (err) {
      el.musicBtn.textContent = "♫ No music file";
      setTimeout(() => { el.musicBtn.textContent = "♫ Music"; }, 2500);
    }
  });

  /* ---------- Start everything ---------- */

  startBackground();
  startCursorGlow();
  bootSequence();
})();

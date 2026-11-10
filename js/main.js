(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const html = document.documentElement;
  const body = document.body;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReduced = () => motionQuery.matches;

  const random = (min, max) => Math.random() * (max - min) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* Sin persistencia: la app sigue funcionando en memoria. */
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* Nada que hacer. */
      }
    },
  };

  const state = {
    signed: false,
    name: "",
    signedAt: "",
    opened: false,
    quizDone: false,
  };

  const STORAGE_KEYS = {
    signed: "bk.signed",
    name: "bk.name",
    date: "bk.date",
  };

  /* ------------------------------------------------------------
     Partículas reutilizables
     ------------------------------------------------------------ */
  const SVG_NS = "http://www.w3.org/2000/svg";
  const PARTICLE_COLORS = ["#c24e66", "#d9647c", "#ee8aa2", "#f29bb0", "#c8a24a"];

  function spawnParticles(container, emojis, count = 12) {
    if (!container || prefersReduced()) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      const item = pick(emojis);

      /* "#id" dibuja un ícono SVG del sprite en lugar de un emoji. */
      if (item.startsWith("#")) {
        const svg = document.createElementNS(SVG_NS, "svg");
        const use = document.createElementNS(SVG_NS, "use");
        use.setAttribute("href", item);
        svg.appendChild(use);
        svg.setAttribute("focusable", "false");
        particle.classList.add("particle--svg");
        particle.style.color = pick(PARTICLE_COLORS);
        particle.appendChild(svg);
      } else {
        particle.textContent = item;
      }
      particle.setAttribute("aria-hidden", "true");
      particle.style.setProperty("--x", `${random(-88, 88).toFixed(1)}px`);
      particle.style.setProperty("--dx", `${random(-42, 42).toFixed(1)}px`);
      particle.style.setProperty("--rot", `${random(-38, 38).toFixed(1)}deg`);
      particle.style.setProperty("--size", `${random(0.9, 1.65).toFixed(2)}rem`);
      particle.style.setProperty("--dur", `${random(0.95, 1.5).toFixed(2)}s`);
      particle.style.setProperty("--delay", `${random(0, 0.24).toFixed(2)}s`);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  /* ------------------------------------------------------------
     Reveals + color de barra del navegador
     ------------------------------------------------------------ */
  function initReveal() {
    const sections = $$(".section");

    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -7% 0px" }
    );

    sections.forEach((section) => revealObserver.observe(section));

    const themeMeta = $("#themeColor");
    if (!themeMeta) return;

    const ratios = new Map();
    const themeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio));

        let best = null;
        let bestRatio = 0;

        ratios.forEach((ratio, section) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = section;
          }
        });

        const color = best?.dataset.theme;
        if (color && themeMeta.content !== color) themeMeta.content = color;
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    sections.forEach((section) => themeObserver.observe(section));
  }

  /* ------------------------------------------------------------
     Barra de progreso y pista de scroll
     ------------------------------------------------------------ */
  function initProgress() {
    const bar = $("#progressBar");
    if (!bar) return;

    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      body.classList.toggle("has-scrolled", window.scrollY > 24);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("load", requestUpdate, { once: true });
    update();
  }

  /* ------------------------------------------------------------
     Contrato + firma
     ------------------------------------------------------------ */
  function formatDate(isoDate) {
    const date = isoDate ? new Date(isoDate) : new Date();
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(safeDate);
  }

  function initSignature() {
    const form = $("#signForm");
    const input = $("#signName");
    const button = $("#signBtn");
    const placeholder = $("#herSignaturePlaceholder");
    const nameOutput = $("#herSignature");
    const signedMeta = $("#signedMeta");
    const live = $("#signLive");
    const herBlock = $(".signature-block--her");
    const nextCue = $("#signNextCue");

    /* Flechita que aparece al firmar y baja a la sección siguiente. */
    nextCue?.addEventListener("click", (event) => {
      event.preventDefault();
      $("#segundo-regalo")?.scrollIntoView({
        behavior: prefersReduced() ? "auto" : "smooth",
        block: "start",
      });
    });

    if (!form || !input || !button || !placeholder || !nameOutput || !signedMeta) return;

    if (new URLSearchParams(window.location.search).get("reset") === "1") {
      Object.values(STORAGE_KEYS).forEach((key) => storage.remove(key));
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      } catch {
        /* file:// puede bloquear replaceState; no es crítico. */
      }
    }

    state.signed = storage.get(STORAGE_KEYS.signed) === "1";
    state.name = storage.get(STORAGE_KEYS.name) || "";
    state.signedAt = storage.get(STORAGE_KEYS.date) || "";

    const renderSigned = (animate = false) => {
      if (!state.name) return;

      nameOutput.textContent = state.name;
      nameOutput.classList.toggle("sign-name--long", state.name.length > 9);
      nameOutput.classList.toggle("sign-name--xlong", state.name.length > 14);
      nameOutput.hidden = false;
      placeholder.hidden = true;
      form.hidden = true;
      signedMeta.hidden = false;
      signedMeta.textContent = `Firmado el ${formatDate(state.signedAt)}`;

      if (live) live.textContent = "Contrato firmado. Gracias por firmar.";

      if (nextCue) {
        nextCue.hidden = false;
        nextCue.classList.add("is-visible");
      }

      if (animate && herBlock) {
        herBlock.classList.add("is-signed");
        spawnParticles(herBlock, ["♥", "💗", "💕"], 7);
        window.setTimeout(() => herBlock.classList.remove("is-signed"), 900);
      }
    };

    const validate = () => {
      const name = input.value.trim().replace(/\s+/g, " ");
      button.disabled = name.length < 2;
      return name;
    };

    input.addEventListener("input", validate);

    input.addEventListener("focus", () => {
      html.classList.add("input-focused");
      window.setTimeout(() => {
        if (document.activeElement !== input) return;
        input.scrollIntoView({ block: "center", behavior: prefersReduced() ? "auto" : "smooth" });
      }, 260);
    });

    input.addEventListener("blur", () => {
      html.classList.remove("input-focused");
    });

    /* Evita que el input pierda el foco al tocar "Firmar": el blur reactivaba
       el scroll-snap (y cerraba el teclado), la página se reacomodaba en medio
       del toque y el click se perdía, obligando a tocar dos veces. */
    button.addEventListener("pointerdown", (event) => {
      if (document.activeElement === input) event.preventDefault();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = validate();
      if (name.length < 2) {
        input.focus();
        return;
      }

      button.disabled = true;
      button.textContent = "Firmando…";
      input.blur();

      window.setTimeout(
        () => {
          state.signed = true;
          state.name = name;
          state.signedAt = new Date().toISOString();

          storage.set(STORAGE_KEYS.signed, "1");
          storage.set(STORAGE_KEYS.name, state.name);
          storage.set(STORAGE_KEYS.date, state.signedAt);

          renderSigned(true);
        },
        prefersReduced() ? 0 : 320
      );
    });

    if (state.signed && state.name) {
      renderSigned(false);
    } else {
      validate();
    }
  }

  /* ------------------------------------------------------------
     Besos, mimos y abrazos
     ------------------------------------------------------------ */
  function initAffection() {
    const stage = $("#affectionStage");
    const caption = $("#affectionCaption");
    const buttons = $$(".affection-btn");

    if (!stage || !caption || !buttons.length) return;

    const scenes = $$(".scene", stage);

    const reactions = {
      besos: {
        message: "Besitos para vos",
        emojis: ["#ic-heart", "#ic-heart", "#ic-heart", "#ic-spark"],
        count: 15,
      },
      mimos: {
        message: "Mimos para tu cabecita",
        emojis: ["#ic-spark", "#ic-spark", "#ic-heart"],
        count: 13,
      },
      abrazos: {
        message: "Un abrazo bien apretado",
        emojis: ["#ic-heart", "#ic-heart", "#ic-spark"],
        count: 14,
      },
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.affection;
        const reaction = reactions[type];
        if (!reaction) return;

        const scene = scenes.find((item) => item.dataset.scene === type);
        if (!scene) return;

        buttons.forEach((item) => item.classList.remove("is-active"));
        scenes.forEach((item) => item.classList.remove("is-active"));

        void scene.offsetWidth;
        void button.offsetWidth;

        scene.classList.add("is-active");
        button.classList.add("is-active");
        stage.classList.add("has-scene");
        caption.textContent = reaction.message;

        const particles = $(".particles", scene);
        if (particles) {
          particles.replaceChildren();
          spawnParticles(particles, reaction.emojis, reaction.count);
        }

        if (typeof navigator.vibrate === "function") {
          try {
            navigator.vibrate(8);
          } catch {
            /* Vibración no disponible o bloqueada. */
          }
        }
      });
    });
  }

  /* ------------------------------------------------------------
     ¿Sorpresa? — No no hace nada, Yes avanza
     ------------------------------------------------------------ */
  function initSurprise() {
    const noButton = $("#noBtn");
    const yesButton = $("#yesBtn");
    const tease = $("#noTease");
    const target = $("#cuestionario");
    const stage = $(".section--surprise .section__inner");

    if (!noButton || !yesButton || !target) return;

    noButton.addEventListener("click", () => {
      if (tease) {
        tease.classList.remove("is-visible");
        tease.textContent = "¡Este botón no funciona!";
        void tease.offsetWidth;
        tease.classList.add("is-visible");
      }

      noButton.classList.remove("is-shaking");
      void noButton.offsetWidth;
      noButton.classList.add("is-shaking");
      window.setTimeout(() => noButton.classList.remove("is-shaking"), 450);
    });

    let navigating = false;

    yesButton.addEventListener("click", () => {
      if (navigating) return;
      navigating = true;
      yesButton.disabled = true;

      if (tease) tease.textContent = "";
      if (stage) spawnParticles(stage, ["♥", "💗", "✨", "💕"], 16);

      window.setTimeout(
        () => {
          target.scrollIntoView({
            behavior: prefersReduced() ? "auto" : "smooth",
            block: "start",
          });
          navigating = false;
          yesButton.disabled = false;
        },
        prefersReduced() ? 0 : 260
      );
    });
  }

  /* ------------------------------------------------------------
     Cuestionario — 4 preguntas y desbloqueo de la sorpresa
     ------------------------------------------------------------ */
  function initQuiz() {
    const startButton = $("#startQuiz");
    const firstQuestion = $("#pregunta-1");
    const openButton = $("#openBox");
    const boxEyebrow = $("#boxEyebrow");
    const hint = $("#ticketHint");
    const groups = $$(".quiz-options");

    if (!groups.length) return;

    startButton?.addEventListener("click", () => {
      firstQuestion?.scrollIntoView({
        behavior: prefersReduced() ? "auto" : "smooth",
        block: "start",
      });
    });

    const unlockBox = () => {
      state.quizDone = true;

      if (openButton) {
        openButton.disabled = false;
        openButton.classList.add("is-unlocked");
      }

      if (boxEyebrow) boxEyebrow.textContent = "Sorpresa desbloqueada";
      if (hint) hint.textContent = "Hay algo adentro…";
    };

    /* La sorpresa solo se desbloquea cuando todas las preguntas están resueltas,
       no solo la última. */
    const solvedGroups = new Set();
    const firstUnsolved = () => groups.find((group) => !solvedGroups.has(group));

    /* Nunca se pasa de pregunta automáticamente: al acertar aparece una
       flechita en esa pregunta. Al tocarla lleva a la próxima pregunta sin
       responder o, si ya están todas, a la caja sorpresa. */
    const cueTemplate = $("#quizNextCue");
    cueTemplate?.remove();

    const showQuizCue = (section) => {
      const inner = section ? $(".section__inner", section) : null;
      if (!cueTemplate || !inner || $(".next-cue", inner)) return;

      const cue = cueTemplate.cloneNode(true);
      cue.removeAttribute("id");
      cue.addEventListener("click", (event) => {
        event.preventDefault();
        const target = firstUnsolved()?.closest(".section") || $("#caja");
        target?.scrollIntoView({
          behavior: prefersReduced() ? "auto" : "smooth",
          block: "start",
        });
      });

      inner.appendChild(cue);
      cue.hidden = false;
      cue.classList.add("is-visible");
    };

    groups.forEach((group, index) => {
      const section = group.closest(".section");
      const feedback = section ? $(".quiz-feedback", section) : null;
      const options = $$(".quiz-option", group);
      const isLast = index === groups.length - 1;

      options.forEach((option) => {
        option.addEventListener("click", () => {
          if (solvedGroups.has(group)) return;

          if (option.dataset.correct !== "true") {
            if (feedback) {
              feedback.classList.remove("is-visible");
              feedback.textContent = "Mmm, no era esa. ¡Probá de nuevo!";
              void feedback.offsetWidth;
              feedback.classList.add("is-visible");
            }

            option.classList.remove("is-wrong");
            void option.offsetWidth;
            option.classList.add("is-wrong");
            window.setTimeout(() => option.classList.remove("is-wrong"), 450);
            return;
          }

          solvedGroups.add(group);
          group.classList.add("is-solved");
          option.classList.add("is-correct");

          const allSolved = solvedGroups.size === groups.length;

          let message = "¡Correcto! 💗";
          if (allSolved) message = "¡Correcto! Ganaste tu sorpresa 🎁";
          else if (isLast) message = "¡Correcto! Pero te faltan preguntas por responder, pillina";

          /* Mensaje especial de la respuesta (data-extra), junto al de correcto. */
          if (option.dataset.extra) message += ` ${option.dataset.extra}`;

          if (feedback) {
            feedback.classList.remove("is-visible");
            feedback.textContent = message;
            void feedback.offsetWidth;
            feedback.classList.add("is-visible");
          }

          if (allSolved) unlockBox();
          showQuizCue(section);
        });
      });
    });
  }

  /* ------------------------------------------------------------
     Caja sorpresa + ticket
     ------------------------------------------------------------ */
  function initBox() {
    const openButton = $("#openBox");
    const stage = $("#boxStage");
    const ticket = $("#ticket");
    const hint = $("#ticketHint");
    const particles = $("#boxParticles");
    const live = $("#boxLive");

    if (!openButton || !stage || !ticket) return;

    /* Las secciones posteriores a la caja quedan ocultas hasta abrir la
       sorpresa: así la página termina en la caja y no se puede seguir. */
    const lockedSections = $$("#caja ~ .section");
    lockedSections.forEach((section) => {
      section.hidden = true;
    });

    const nextCue = $("#nextCue");
    nextCue?.addEventListener("click", (event) => {
      event.preventDefault();
      $("#final")?.scrollIntoView({
        behavior: prefersReduced() ? "auto" : "smooth",
        block: "start",
      });
    });

    let opening = false;

    openButton.addEventListener("click", () => {
      if (!state.quizDone || opening || state.opened) return;
      opening = true;

      openButton.disabled = true;
      openButton.setAttribute("aria-busy", "true");
      stage.setAttribute("aria-busy", "true");
      stage.classList.add("is-opening");

      if (particles) spawnParticles(particles, ["💗", "💖", "✨", "💕"], 18);

      window.setTimeout(
        () => {
          state.opened = true;
          stage.classList.add("is-open");
          stage.removeAttribute("aria-busy");
          ticket.setAttribute("aria-hidden", "false");
          openButton.classList.add("is-hidden");
          openButton.setAttribute("aria-hidden", "true");
          openButton.removeAttribute("aria-busy");

          lockedSections.forEach((section) => {
            section.hidden = false;
          });

          if (nextCue) {
            nextCue.hidden = false;
            nextCue.classList.add("is-visible");
          }

          if (hint) hint.textContent = "Guardá tu ticket con cariño ♥";

          if (live) {
            live.textContent =
              "La caja se abrió. Tu ticket dice: Ticket válido para pedirme lo que querías en el barrio chino por un día.";
          }

          window.requestAnimationFrame(() => {
            ticket.focus({ preventScroll: true });
          });

          if (particles) spawnParticles(particles, ["🎉", "✨", "💗", "💖"], 20);
        },
        prefersReduced() ? 160 : 1150
      );
    });
  }

  /* ------------------------------------------------------------
     Inicio
     ------------------------------------------------------------ */
  initReveal();
  initProgress();
  initSignature();
  initAffection();
  initSurprise();
  initQuiz();
  initBox();
})();

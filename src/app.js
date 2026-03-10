import { personas, personaMessages, quizQuestions, initialDemoState } from "./data.js";

const state = { ...initialDemoState };
const STATE_SCHEMA_VERSION = 1;
const APP_STATE_KEY = "walki_mvp_state_v1";
const routes = Array.from(document.querySelectorAll(".route"));
const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const appRoot = document.getElementById("app");

const quizShell = document.getElementById("quiz-shell");
const resultsShell = document.getElementById("results-shell");
const demoShell = document.getElementById("demo-shell");
const waitlistForm = document.getElementById("waitlist-form");
const waitlistStatus = document.getElementById("waitlist-status");
const demoUi = {
  stepEntryOpen: false,
  stepEntryValue: "500",
  motivationPending: false,
};

function safeReadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so demo behavior remains usable.
  }
}

function hydrateState() {
  const persisted = safeReadJSON(APP_STATE_KEY);
  if (!persisted || persisted.schema !== STATE_SCHEMA_VERSION || !persisted.state) return;

  Object.assign(state, persisted.state);
  state.personaWeights = { ...initialDemoState.personaWeights, ...persisted.state.personaWeights };
  state.responses = { ...persisted.state.responses };
  state.mutedPersonas = { ...persisted.state.mutedPersonas };
  state.calendar = { ...initialDemoState.calendar, ...persisted.state.calendar };
  state.messageHistory = Array.isArray(persisted.state.messageHistory) ? persisted.state.messageHistory : [...initialDemoState.messageHistory];
}

function ensureStateDefaults() {
  if (!state.selectedCalendarDay) {
    state.selectedCalendarDay = 19;
  }
}

function persistState() {
  safeWriteJSON(APP_STATE_KEY, { schema: STATE_SCHEMA_VERSION, state });
}

function setRoute(routeId) {
  state.route = routeId;

  routes.forEach((route) => {
    route.classList.toggle("active", route.id === routeId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.route === routeId);
    if (button.dataset.route === routeId) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  appRoot.focus();
  persistState();
}

function initializePersonaScore() {
  return personas.reduce((acc, persona) => {
    acc[persona.id] = 0;
    return acc;
  }, {});
}

function calculatePersonaWeights() {
  const totalScores = initializePersonaScore();

  Object.values(state.responses).forEach((answer) => {
    Object.entries(answer.scores).forEach(([personaId, points]) => {
      totalScores[personaId] += points;
    });
  });

  const totalPoints = Object.values(totalScores).reduce((sum, points) => sum + points, 0) || 1;

  const normalized = {};
  personas.forEach((persona) => {
    normalized[persona.id] = Math.round((totalScores[persona.id] / totalPoints) * 100);
  });

  const delta = 100 - Object.values(normalized).reduce((sum, value) => sum + value, 0);
  if (delta !== 0) {
    normalized[personas[0].id] += delta;
  }

  state.personaWeights = normalized;
}

function renderQuiz() {
  const question = quizQuestions[state.currentQuestion];
  const selectedAnswer = state.responses[question.id];

  const answerButtons = question.answers
    .map(
      (answer) => `
        <button class="answer ${selectedAnswer?.id === answer.id ? "selected" : ""}" data-answer-id="${answer.id}">
          ${answer.text}
        </button>
      `,
    )
    .join("");

  quizShell.innerHTML = `
    <p class="progress">Question ${state.currentQuestion + 1} of ${quizQuestions.length}</p>
    <h3>${question.prompt}</h3>
    <div class="answers">${answerButtons}</div>
    <div class="actions">
      <button id="prev-question" class="secondary" ${state.currentQuestion === 0 ? "disabled" : ""}>Back</button>
      <button id="next-question" class="cta" ${selectedAnswer ? "" : "disabled"}>
        ${state.currentQuestion === quizQuestions.length - 1 ? "See Results" : "Next"}
      </button>
    </div>
  `;

  quizShell.querySelectorAll("[data-answer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const chosen = question.answers.find((answer) => answer.id === button.dataset.answerId);
      state.responses[question.id] = chosen;
      persistState();
      renderQuiz();
    });
  });

  quizShell.querySelector("#prev-question").addEventListener("click", () => {
    state.currentQuestion = Math.max(0, state.currentQuestion - 1);
    persistState();
    renderQuiz();
  });

  quizShell.querySelector("#next-question").addEventListener("click", () => {
    if (state.currentQuestion === quizQuestions.length - 1) {
      calculatePersonaWeights();
      renderResults();
      renderDemo();
      setRoute("results");
      persistState();
      return;
    }

    state.currentQuestion += 1;
    persistState();
    renderQuiz();
  });
}

function renderResults() {
  const ranked = [...personas]
    .map((persona) => ({ ...persona, weight: state.personaWeights[persona.id] || 0 }))
    .sort((a, b) => b.weight - a.weight);

  const topThree = ranked.slice(0, 3);

  resultsShell.innerHTML = `
    <p class="progress">Top Persona: <strong>${topThree[0].name}</strong></p>
    <div class="persona-list">
      ${ranked
        .map(
          (persona) => `
            <article class="persona-row">
              <span class="dot" style="background:${persona.color}"></span>
              <span>${persona.name}</span>
              <strong>${persona.weight}%</strong>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="actions">
      <button id="retake-quiz" class="secondary">Retake Quiz</button>
      <button id="share-results" class="secondary">Share Results</button>
      <button id="to-demo" class="cta">See It In Action</button>
    </div>
  `;

  resultsShell.querySelector("#retake-quiz").addEventListener("click", () => {
    state.currentQuestion = 0;
    state.responses = {};
    persistState();
    renderQuiz();
    setRoute("quiz");
  });

  resultsShell.querySelector("#to-demo").addEventListener("click", () => {
    setRoute("demo");
  });

  resultsShell.querySelector("#share-results").addEventListener("click", async () => {
    const summary = ranked.slice(0, 3).map((p) => `${p.name} ${p.weight}%`).join(", ");
    const text = `My Walki motivation mix: ${summary}`;
    try {
      await navigator.clipboard.writeText(text);
      window.alert("Results copied to clipboard.");
    } catch {
      window.alert(text);
    }
  });
}

function weightedPersonaPick() {
  const candidates = personas
    .filter((persona) => !state.mutedPersonas[persona.id])
    .map((persona) => ({
      id: persona.id,
      weight: Math.max(0, state.personaWeights[persona.id] || 0),
    }))
    .filter((candidate) => candidate.weight > 0);

  if (candidates.length === 0) {
    return "companion";
  }

  const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  let target = Math.random() * total;

  for (const candidate of candidates) {
    target -= candidate.weight;
    if (target <= 0) return candidate.id;
  }

  return candidates[candidates.length - 1].id;
}

function generateMessage() {
  const personaId = weightedPersonaPick();
  const templates = personaMessages[personaId];
  const template = templates[Math.floor(Math.random() * templates.length)];

  const stepsRemaining = Math.max(0, state.dailyGoal - state.todaySteps);
  const text = template
    .replaceAll("{{stepsRemaining}}", String(stepsRemaining))
    .replaceAll("{{streak}}", String(state.streakCurrent));

  state.messageHistory.unshift({ personaId, text, timestamp: "just now" });
  state.messageHistory = state.messageHistory.slice(0, 8);
  persistState();
}

function applyFreeze() {
  if (state.freezeAvailable <= 0) return;

  const previousDay = 18;
  if (state.calendar[previousDay] !== "freeze") {
    state.calendar[previousDay] = "freeze";
    state.freezeAvailable -= 1;
    persistState();
  }
}

function normalizeWeights(rawWeights) {
  const total = Object.values(rawWeights).reduce((sum, value) => sum + value, 0) || 1;
  const normalized = {};

  personas.forEach((persona) => {
    normalized[persona.id] = Math.round((rawWeights[persona.id] / total) * 100);
  });

  const delta = 100 - Object.values(normalized).reduce((sum, value) => sum + value, 0);
  normalized[personas[0].id] += delta;
  state.personaWeights = normalized;
  persistState();
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function personaFor(id) {
  return personas.find((persona) => persona.id === id) || personas[0];
}

function personaBadge(persona) {
  return `<span class="persona-badge" style="--persona-color:${persona.color}">${persona.name}</span>`;
}

function renderCalendarLegend() {
  const items = [
    ["met", "Goal met"],
    ["partial", "Partial"],
    ["missed", "Missed"],
    ["freeze", "Freeze"],
  ];

  return items
    .map(
      ([tone, label]) => `
        <span class="legend-chip ${tone}">
          <span class="legend-dot"></span>
          ${label}
        </span>
      `,
    )
    .join("");
}

function renderCalendarDetails(day) {
  const selectedDay = Number(day) || 19;
  const status = state.calendar[selectedDay] || "future";
  const labels = {
    met: "Goal met",
    partial: "Almost there",
    missed: "Missed day",
    freeze: "Freeze used",
    future: "Upcoming",
  };
  const stepsByStatus = {
    met: Math.max(state.dailyGoal, state.todaySteps),
    partial: state.todaySteps,
    missed: 0,
    freeze: Math.round(state.dailyGoal * 0.62),
    future: 0,
  };

  return `
    <div class="calendar-detail-card ${status}">
      <div>
        <p class="eyebrow">Day ${selectedDay}</p>
        <h4>${labels[status]}</h4>
      </div>
      <dl class="detail-grid">
        <div>
          <dt>Steps</dt>
          <dd>${formatNumber(stepsByStatus[status] || 0)}</dd>
        </div>
        <div>
          <dt>Goal</dt>
          <dd>${formatNumber(state.dailyGoal)}</dd>
        </div>
        <div>
          <dt>Walk note</dt>
          <dd>${status === "future" ? "No data yet" : status === "freeze" ? "Recovery day protected" : status === "missed" ? "Reset and restart" : "Momentum held"}</dd>
        </div>
      </dl>
    </div>
  `;
}

function renderDemo() {
  const stepsRemaining = Math.max(0, state.dailyGoal - state.todaySteps);
  const progressPct = Math.min(100, Math.round((state.todaySteps / state.dailyGoal) * 100));
  const topPersonas = [...personas]
    .map((persona) => ({ ...persona, weight: state.personaWeights[persona.id] || 0 }))
    .sort((a, b) => b.weight - a.weight);
  const topPersona = topPersonas[0];
  const activeDay = state.selectedCalendarDay || 19;

  const history = state.messageHistory
    .map((entry) => {
      const persona = personaFor(entry.personaId);
      return `
        <li class="feed-item">
          <article class="message-card" style="--persona-color:${persona.color}">
            <div class="message-topline">
              ${personaBadge(persona)}
              <span class="message-time">${entry.timestamp}</span>
            </div>
            <p>${entry.text}</p>
          </article>
        </li>
      `;
    })
    .join("");

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1)
    .map((day) => {
      const status = state.calendar[day] || "future";
      const current = activeDay === day;
      return `
        <button class="calendar-day ${status} ${current ? "is-selected" : ""}" data-day="${day}" aria-pressed="${current ? "true" : "false"}">
          <span class="calendar-day-number">${day}</span>
        </button>
      `;
    })
    .join("");

  const personaControls = personas
    .map((persona) => {
      const weight = state.personaWeights[persona.id] || 0;
      const muted = !!state.mutedPersonas[persona.id];
      return `
        <label class="persona-control ${muted ? "is-muted" : ""}">
          <div class="persona-control-head">
            <span class="persona-label-wrap">
              <span class="dot" style="background:${persona.color}"></span>
              <span>${persona.name}</span>
            </span>
            <strong>${weight}%</strong>
          </div>
          <input type="range" min="0" max="100" step="1" value="${weight}" data-weight-id="${persona.id}" ${muted ? "disabled" : ""}>
          <span class="persona-toggle"><input type="checkbox" data-mute-id="${persona.id}" ${muted ? "checked" : ""}> mute</span>
        </label>
      `;
    })
    .join("");

  const modal = demoUi.stepEntryOpen
    ? `
      <div class="modal-backdrop" data-close-step-entry="true">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="step-entry-title">
          <div class="modal-head">
            <div>
              <p class="eyebrow">Step entry</p>
              <h3 id="step-entry-title">Add today's steps</h3>
            </div>
            <button class="icon-button" type="button" data-close-step-entry="true" aria-label="Close step entry">Close</button>
          </div>
          <p class="muted">Update the demo progress without leaving the dashboard.</p>
          <label class="form inline-form-field">
            Steps to add
            <input id="step-entry-input" name="steps" type="number" min="1" step="1" value="${demoUi.stepEntryValue}" />
          </label>
          <div class="actions">
            <button id="save-step-entry" class="cta" type="button">Save Steps</button>
            <button class="secondary" type="button" data-close-step-entry="true">Cancel</button>
          </div>
        </div>
      </div>
    `
    : "";

  demoShell.innerHTML = `
    <article class="card hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Today's momentum</p>
        <div class="hero-headline">
          <div>
            <p class="hero-kicker">${topPersona.name} energy is leading today</p>
            <h3><span class="hero-streak-value">${state.streakCurrent}</span> day streak</h3>
          </div>
          <div class="streak-badge">
            <span class="streak-badge-number">${progressPct}%</span>
            <span class="streak-badge-label">to goal</span>
          </div>
        </div>
        <p class="hero-support">Your longest streak yet. ${stepsRemaining === 0 ? "Goal complete. Keep the streak feeling easy." : `${formatNumber(stepsRemaining)} steps left to close out today strong.`}</p>
      </div>

      <div class="progress-panel">
        <div class="progress-copy">
          <div>
            <p class="eyebrow">Daily progress</p>
            <p class="metric-line"><strong>${formatNumber(state.todaySteps)}</strong> of ${formatNumber(state.dailyGoal)} steps</p>
          </div>
          <span class="muted">Updated just now</span>
        </div>
        <div class="progress-track" aria-hidden="true">
          <span class="progress-fill" style="width:${progressPct}%"></span>
        </div>
        <div class="hero-stats">
          <article class="stat-chip">
            <span class="stat-label">Remaining</span>
            <strong>${formatNumber(stepsRemaining)}</strong>
          </article>
          <article class="stat-chip">
            <span class="stat-label">Freeze</span>
            <strong>${state.freezeAvailable} left</strong>
          </article>
          <article class="stat-chip">
            <span class="stat-label">Top persona</span>
            <strong>${topPersona.name}</strong>
          </article>
        </div>
      </div>

      <div class="actions hero-actions">
        <button id="get-motivation" class="cta" ${demoUi.motivationPending ? "disabled" : ""}>${demoUi.motivationPending ? "Finding the right nudge..." : "Get Motivation"}</button>
        <button id="log-steps" class="secondary">Log Today's Steps</button>
        <button id="use-freeze" class="quiet-button" ${state.freezeAvailable <= 0 ? "disabled" : ""}>Use Freeze (${state.freezeAvailable})</button>
      </div>
    </article>

    <article class="card feed-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Live demo feed</p>
          <h3>Recent Motivation</h3>
        </div>
        ${personaBadge(topPersona)}
      </div>
      <p class="section-copy">Short, distinct nudges should make the persona system feel immediately real.</p>
      <ul class="feed">${history || '<li class="feed-empty"><p>No messages yet. Tap "Get Motivation" to see your persona mix in action.</p></li>'}</ul>
    </article>

    <article class="card wide calendar-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Streak history</p>
          <h3>Calendar</h3>
        </div>
        <div class="mini-stats">
          <span><strong>${state.streakCurrent}</strong> current</span>
          <span><strong>${state.streakCurrent}</strong> best</span>
          <span><strong>${Object.values(state.calendar).filter((value) => value === "met").length}</strong> goal days</span>
        </div>
      </div>
      <div class="calendar-legend">${renderCalendarLegend()}</div>
      <div class="calendar-grid">${calendarDays}</div>
      ${renderCalendarDetails(activeDay)}
    </article>

    <article class="card wide">
      <div class="section-head">
        <div>
          <p class="eyebrow">Personalization</p>
          <h3>Persona Mix</h3>
        </div>
      </div>
      <p class="section-copy">Adjust the balance if you want the demo feed to feel warmer, sharper, calmer, or more playful.</p>
      <div class="persona-controls">${personaControls}</div>
      <div class="actions">
        <button id="save-persona-mix" class="cta">Save Mix</button>
      </div>
    </article>

    <article class="card wide feedback-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Signal check</p>
          <h3>Quick Feedback</h3>
        </div>
      </div>
      <p class="section-copy">How motivating does this version of the demo feel right now?</p>
      <div class="feedback-actions">
        <button class="secondary" data-feedback-score="1">Low</button>
        <button class="secondary" data-feedback-score="2">Medium</button>
        <button class="secondary" data-feedback-score="3">High</button>
      </div>
      <p id="feedback-status" class="muted" aria-live="polite"></p>
    </article>
    ${modal}
  `;

  demoShell.querySelector("#log-steps").addEventListener("click", () => {
    demoUi.stepEntryOpen = true;
    renderDemo();
  });

  demoShell.querySelectorAll("[data-close-step-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      demoUi.stepEntryOpen = false;
      renderDemo();
    });
  });

  demoShell.querySelector(".modal-card")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  demoShell.querySelector("#save-step-entry")?.addEventListener("click", () => {
    const input = demoShell.querySelector("#step-entry-input");
    const add = Number(input?.value || demoUi.stepEntryValue);
    demoUi.stepEntryValue = input?.value || demoUi.stepEntryValue;
    if (!Number.isNaN(add) && add > 0) {
      state.todaySteps += add;
      if (state.todaySteps >= state.dailyGoal) {
        state.calendar[19] = "met";
      } else {
        state.calendar[19] = "partial";
      }
      demoUi.stepEntryOpen = false;
      persistState();
      renderDemo();
    }
  });

  demoShell.querySelector("#get-motivation").addEventListener("click", () => {
    demoUi.motivationPending = true;
    renderDemo();
    window.setTimeout(() => {
      generateMessage();
      demoUi.motivationPending = false;
      renderDemo();
    }, 650);
  });

  demoShell.querySelector("#use-freeze").addEventListener("click", () => {
    applyFreeze();
    renderDemo();
  });

  const rawWeights = { ...state.personaWeights };

  demoShell.querySelectorAll("[data-weight-id]").forEach((slider) => {
    slider.addEventListener("input", () => {
      rawWeights[slider.dataset.weightId] = Number(slider.value);
    });
  });

  demoShell.querySelectorAll("[data-mute-id]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      state.mutedPersonas[toggle.dataset.muteId] = toggle.checked;
      persistState();
      renderDemo();
    });
  });

  demoShell.querySelector("#save-persona-mix").addEventListener("click", () => {
    normalizeWeights(rawWeights);
    renderResults();
    renderDemo();
  });

  demoShell.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCalendarDay = Number(button.dataset.day);
      persistState();
      renderDemo();
    });
  });

  demoShell.querySelectorAll("[data-feedback-score]").forEach((button) => {
    button.addEventListener("click", () => {
      const score = button.dataset.feedbackScore;
      const key = "walki_demo_feedback";
      const prior = safeReadJSON(key) || [];
      prior.push({ score, timestamp: new Date().toISOString() });
      safeWriteJSON(key, prior);
      demoShell.querySelector("#feedback-status").textContent = "Thanks for the feedback.";
    });
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setRoute(button.dataset.route));
});

document.getElementById("start-quiz").addEventListener("click", () => {
  setRoute("quiz");
});
document.getElementById("skip-to-demo").addEventListener("click", () => {
  setRoute("demo");
});

waitlistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(waitlistForm);
  const entry = {
    name: formData.get("name"),
    email: formData.get("email"),
    signal: formData.get("signal"),
    feedback: formData.get("feedback"),
    timestamp: new Date().toISOString(),
  };

  const key = "walki_waitlist_submissions";
  const prior = safeReadJSON(key) || [];
  prior.push(entry);
  safeWriteJSON(key, prior);

  waitlistStatus.textContent = "You are on the waitlist. Thank you for the feedback.";
  waitlistForm.reset();
});

hydrateState();
ensureStateDefaults();
renderQuiz();
renderResults();
renderDemo();
setRoute(state.route);

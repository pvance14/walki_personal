import { personas, personaMessages, quizQuestions, initialDemoState } from "./data.js";

const state = { ...initialDemoState };
const routes = Array.from(document.querySelectorAll(".route"));
const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const appRoot = document.getElementById("app");

const quizShell = document.getElementById("quiz-shell");
const resultsShell = document.getElementById("results-shell");
const demoShell = document.getElementById("demo-shell");

function setRoute(routeId) {
  state.route = routeId;

  routes.forEach((route) => {
    route.classList.toggle("active", route.id === routeId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.route === routeId);
  });

  appRoot.focus();
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
      renderQuiz();
    });
  });

  quizShell.querySelector("#prev-question").addEventListener("click", () => {
    state.currentQuestion = Math.max(0, state.currentQuestion - 1);
    renderQuiz();
  });

  quizShell.querySelector("#next-question").addEventListener("click", () => {
    if (state.currentQuestion === quizQuestions.length - 1) {
      calculatePersonaWeights();
      renderResults();
      renderDemo();
      setRoute("results");
      return;
    }

    state.currentQuestion += 1;
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
      <button id="to-demo" class="cta">See It In Action</button>
    </div>
  `;

  resultsShell.querySelector("#retake-quiz").addEventListener("click", () => {
    state.currentQuestion = 0;
    state.responses = {};
    renderQuiz();
    setRoute("quiz");
  });

  resultsShell.querySelector("#to-demo").addEventListener("click", () => {
    setRoute("demo");
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
}

function applyFreeze() {
  if (state.freezeAvailable <= 0) return;

  const previousDay = 18;
  if (state.calendar[previousDay] !== "freeze") {
    state.calendar[previousDay] = "freeze";
    state.freezeAvailable -= 1;
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
}

function renderDemo() {
  const stepsRemaining = Math.max(0, state.dailyGoal - state.todaySteps);
  const progressPct = Math.min(100, Math.round((state.todaySteps / state.dailyGoal) * 100));

  const history = state.messageHistory
    .map((entry) => {
      const persona = personas.find((p) => p.id === entry.personaId);
      return `<li><strong>${persona.name}:</strong> ${entry.text} <span class="muted">(${entry.timestamp})</span></li>`;
    })
    .join("");

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1)
    .map((day) => {
      const status = state.calendar[day] || "future";
      return `<button class="calendar-day ${status}" data-day="${day}">${day}</button>`;
    })
    .join("");

  const personaControls = personas
    .map((persona) => {
      const weight = state.personaWeights[persona.id] || 0;
      const muted = !!state.mutedPersonas[persona.id];
      return `
        <label class="persona-control">
          <span>${persona.name} <strong>${weight}%</strong></span>
          <input type="range" min="0" max="100" step="1" value="${weight}" data-weight-id="${persona.id}" ${muted ? "disabled" : ""}>
          <span><input type="checkbox" data-mute-id="${persona.id}" ${muted ? "checked" : ""}> mute</span>
        </label>
      `;
    })
    .join("");

  demoShell.innerHTML = `
    <article class="card">
      <h3>${state.streakCurrent} Day Streak</h3>
      <p>${state.todaySteps} / ${state.dailyGoal} steps (${progressPct}%)</p>
      <p>${stepsRemaining} steps to goal</p>
      <div class="actions">
        <button id="log-steps" class="secondary">Log Today's Steps</button>
        <button id="get-motivation" class="cta">Get Motivation</button>
        <button id="use-freeze" class="secondary">Use Freeze (${state.freezeAvailable})</button>
      </div>
    </article>

    <article class="card">
      <h3>Recent Motivation</h3>
      <ul class="feed">${history || "<li>No messages yet.</li>"}</ul>
    </article>

    <article class="card wide">
      <h3>Calendar</h3>
      <div class="calendar-grid">${calendarDays}</div>
      <p class="muted">Legend: met, partial, missed, freeze.</p>
    </article>

    <article class="card wide">
      <h3>Persona Mix</h3>
      <div class="persona-controls">${personaControls}</div>
      <div class="actions">
        <button id="save-persona-mix" class="cta">Save Mix</button>
      </div>
    </article>
  `;

  demoShell.querySelector("#log-steps").addEventListener("click", () => {
    const input = window.prompt("Enter steps to add", "500");
    const add = Number(input);
    if (!Number.isNaN(add) && add > 0) {
      state.todaySteps += add;
      if (state.todaySteps >= state.dailyGoal) {
        state.calendar[19] = "met";
      } else {
        state.calendar[19] = "partial";
      }
      renderDemo();
    }
  });

  demoShell.querySelector("#get-motivation").addEventListener("click", () => {
    generateMessage();
    renderDemo();
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
      renderDemo();
    });
  });

  demoShell.querySelector("#save-persona-mix").addEventListener("click", () => {
    normalizeWeights(rawWeights);
    renderResults();
    renderDemo();
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setRoute(button.dataset.route));
});

document.getElementById("start-quiz").addEventListener("click", () => {
  setRoute("quiz");
});

renderQuiz();
renderResults();
renderDemo();
setRoute(state.route);

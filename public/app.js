import { initialDemoState, personaMessages, personas, quizQuestions } from "./walki-data.js";

const state = {
  currentQuestion: 0,
  responses: {},
  personaWeights: {},
  todaySteps: initialDemoState.todaySteps,
  dailyGoal: initialDemoState.dailyGoal,
  streakCurrent: initialDemoState.streakCurrent,
  messageHistory: [...initialDemoState.messageHistory],
  topPersonaId: "companion",
};

const quizShell = document.getElementById("quiz-shell");
const resultsShell = document.getElementById("results-shell");
const personaGallery = document.getElementById("persona-gallery");
const dashboardShell = document.getElementById("dashboard-shell");
const heroPersonas = document.getElementById("hero-personas");
const coachContext = document.getElementById("coach-context");
const activePersonaPill = document.getElementById("active-persona-pill");
const form = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const status = document.getElementById("status");
const submitButton = document.getElementById("submit-button");

function getPersona(personaId) {
  return personas.find((persona) => persona.id === personaId) ?? personas[0];
}

function ensureInitialWeights() {
  state.personaWeights = {
    companion: 20,
    educator: 20,
    cheerleader: 20,
    challenger: 20,
    sage: 10,
    pessimist: 10,
  };
  state.topPersonaId = "companion";
}

function rankedPersonas() {
  return personas
    .map((persona) => ({ ...persona, weight: state.personaWeights[persona.id] || 0 }))
    .sort((a, b) => b.weight - a.weight);
}

function calculatePersonaWeights() {
  const totals = personas.reduce((acc, persona) => ({ ...acc, [persona.id]: 0 }), {});

  Object.values(state.responses).forEach((answer) => {
    Object.entries(answer.scores).forEach(([personaId, points]) => {
      totals[personaId] += points;
    });
  });

  const totalPoints = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
  const normalized = {};

  personas.forEach((persona) => {
    normalized[persona.id] = Math.round((totals[persona.id] / totalPoints) * 100);
  });

  const delta = 100 - Object.values(normalized).reduce((sum, value) => sum + value, 0);
  normalized[personas[0].id] += delta;
  state.personaWeights = normalized;
  state.topPersonaId = rankedPersonas()[0].id;
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderHeroPersonas() {
  heroPersonas.innerHTML = rankedPersonas()
    .slice(0, 3)
    .map(
      (persona) => `
        <article class="mini-persona" style="--persona:${persona.color}">
          <p>${persona.label}</p>
          <strong>${persona.weight}%</strong>
          <span>${persona.accent}</span>
        </article>
      `,
    )
    .join("");
}

function renderQuiz() {
  const question = quizQuestions[state.currentQuestion];
  const selected = state.responses[question.id];

  quizShell.innerHTML = `
    <p class="result-kicker">Question ${state.currentQuestion + 1} of ${quizQuestions.length}</p>
    <h3>${question.prompt}</h3>
    <div class="answers">
      ${question.answers
        .map(
          (answer) => `
            <button class="answer ${selected?.id === answer.id ? "selected" : ""}" data-answer-id="${answer.id}" type="button">
              ${answer.text}
            </button>
          `,
        )
        .join("")}
    </div>
    <div class="actions">
      <button id="prev-question" class="button secondary" type="button" ${state.currentQuestion === 0 ? "disabled" : ""}>Back</button>
      <button id="next-question" class="button primary" type="button" ${selected ? "" : "disabled"}>
        ${state.currentQuestion === quizQuestions.length - 1 ? "See Results" : "Next"}
      </button>
    </div>
  `;

  quizShell.querySelectorAll("[data-answer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = question.answers.find((item) => item.id === button.dataset.answerId);
      state.responses[question.id] = answer;
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
      renderHeroPersonas();
      renderResults();
      renderDashboard();
      renderCoachContext();
      scrollToSection("results");
      return;
    }

    state.currentQuestion += 1;
    renderQuiz();
  });
}

function renderResults() {
  const ranked = rankedPersonas();
  const topThree = ranked.slice(0, 3);

  resultsShell.innerHTML = `
    <p class="result-kicker">Top persona: <strong>${topThree[0].name}</strong></p>
    <div class="result-bars">
      ${ranked
        .map(
          (persona) => `
            <div class="result-row">
              <div class="result-row-head">
                <span>${persona.label}</span>
                <strong>${persona.weight}%</strong>
              </div>
              <div class="result-bar"><span style="width:${persona.weight}%; background:${persona.color}"></span></div>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="top-three">
      ${topThree
        .map(
          (persona) => `
            <article class="top-card" style="--persona:${persona.color}">
              <p class="top-card-kicker">${persona.weight}% match</p>
              <h3>${persona.name}</h3>
              <p>${persona.description}</p>
              <p class="sample-quote">"${persona.sample}"</p>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="actions">
      <button id="retake-quiz" type="button" class="button secondary">Retake Quiz</button>
      <button id="to-demo" type="button" class="button primary">See the Demo</button>
    </div>
  `;

  resultsShell.querySelector("#retake-quiz").addEventListener("click", () => {
    state.currentQuestion = 0;
    state.responses = {};
    ensureInitialWeights();
    renderHeroPersonas();
    renderQuiz();
    renderResults();
    renderDashboard();
    renderCoachContext();
    scrollToSection("quiz");
  });

  resultsShell.querySelector("#to-demo").addEventListener("click", () => {
    scrollToSection("dashboard");
  });

  personaGallery.innerHTML = personas
    .map(
      (persona) => `
        <article class="persona-card" style="--persona:${persona.color}">
          <p class="persona-name">${persona.name} <span>${persona.label}</span></p>
          <p class="persona-accent">${persona.accent}</p>
          <p>${persona.description}</p>
          <p class="sample-quote">"${persona.sample}"</p>
        </article>
      `,
    )
    .join("");
}

function weightedPersonaPick() {
  const ranked = rankedPersonas();
  const total = ranked.reduce((sum, persona) => sum + persona.weight, 0) || 1;
  let target = Math.random() * total;

  for (const persona of ranked) {
    target -= persona.weight;
    if (target <= 0) {
      return persona.id;
    }
  }

  return ranked[0].id;
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
  state.messageHistory = state.messageHistory.slice(0, 5);
}

function updateSteps(nextValue) {
  const parsed = Number(nextValue);
  if (!Number.isFinite(parsed)) {
    return;
  }

  state.todaySteps = Math.max(0, Math.min(state.dailyGoal, parsed));
  renderDashboard();
  renderCoachContext();
}

function renderDashboard() {
  const progress = Math.round((state.todaySteps / state.dailyGoal) * 100);
  const stepsRemaining = Math.max(0, state.dailyGoal - state.todaySteps);
  const topPersona = getPersona(state.topPersonaId);

  dashboardShell.innerHTML = `
    <article class="card streak-card">
      <p class="eyebrow">Current streak</p>
      <div class="streak-row">
        <div>
          <h3>${state.streakCurrent} Day Streak</h3>
          <p>Your longest streak yet. Today is still live.</p>
        </div>
        <div class="streak-fire">🔥</div>
      </div>
      <div class="metric-band">
        <div>
          <span>Today</span>
          <strong>${state.todaySteps.toLocaleString()} / ${state.dailyGoal.toLocaleString()}</strong>
        </div>
        <div>
          <span>Remaining</span>
          <strong>${stepsRemaining.toLocaleString()} steps</strong>
        </div>
        <div>
          <span>Coach tone</span>
          <strong>${topPersona.name}</strong>
        </div>
      </div>
      <div class="progress-bar"><span style="width:${progress}%"></span></div>
      <div class="actions">
        <button id="generate-message" type="button" class="button primary">Get Motivation</button>
        <button id="boost-steps" type="button" class="button secondary">Add 500 Steps</button>
      </div>
    </article>
    <article class="card feed-card">
      <p class="eyebrow">Recent motivation</p>
      <h3>How Walki would talk to you today</h3>
      <div class="feed-list">
        ${state.messageHistory
          .map((entry) => {
            const persona = getPersona(entry.personaId);
            return `
              <article class="feed-item" style="--persona:${persona.color}">
                <div class="feed-head">
                  <strong>${persona.name}</strong>
                  <span>${entry.timestamp}</span>
                </div>
                <p>${entry.text}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    </article>
    <article class="card mix-card">
      <p class="eyebrow">Persona mix</p>
      <h3>Your top coaching blend</h3>
      <div class="mix-list">
        ${rankedPersonas()
          .slice(0, 4)
          .map(
            (persona) => `
              <button type="button" class="mix-chip ${persona.id === state.topPersonaId ? "active" : ""}" data-persona-id="${persona.id}" style="--persona:${persona.color}">
                ${persona.name} · ${persona.weight}%
              </button>
            `,
          )
          .join("")}
      </div>
      <p class="muted">Choosing a top persona changes the coaching tone sent with your chat requests.</p>
    </article>
  `;

  dashboardShell.querySelector("#generate-message").addEventListener("click", () => {
    generateMessage();
    renderDashboard();
  });

  dashboardShell.querySelector("#boost-steps").addEventListener("click", () => {
    updateSteps(state.todaySteps + 500);
  });

  dashboardShell.querySelectorAll("[data-persona-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.topPersonaId = button.dataset.personaId;
      renderDashboard();
      renderCoachContext();
    });
  });
}

function currentWalkiContext() {
  const persona = getPersona(state.topPersonaId);
  return {
    personaId: persona.id,
    personaName: persona.name,
    todaySteps: state.todaySteps,
    dailyGoal: state.dailyGoal,
    streakCurrent: state.streakCurrent,
  };
}

function renderCoachContext() {
  const persona = getPersona(state.topPersonaId);
  activePersonaPill.textContent = `persona: ${persona.name}`;
  coachContext.innerHTML = `
    <div class="context-grid">
      <div><span>Persona</span><strong>${persona.name}</strong></div>
      <div><span>Steps</span><strong>${state.todaySteps.toLocaleString()} / ${state.dailyGoal.toLocaleString()}</strong></div>
      <div><span>Streak</span><strong>${state.streakCurrent} days</strong></div>
      <div><span>Expected tone</span><strong>${persona.accent}</strong></div>
    </div>
  `;
}

function appendMessage(role, text, routeHint) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;

  const label = document.createElement("p");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "Walki Coach";

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = text;
  wrapper.append(label, body);

  if (role === "assistant") {
    const meta = document.createElement("p");
    meta.className = "message-meta";
    meta.textContent = `Used: ${routeHint || "direct"}`;
    wrapper.append(meta);
  }

  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  return wrapper;
}

function updateAssistantRoute(wrapper, routeHint) {
  const meta = wrapper.querySelector(".message-meta");
  if (meta) {
    meta.textContent = `Used: ${routeHint}`;
  }
}

async function streamResponse(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message,
      stream: true,
      walkiContext: currentWalkiContext(),
    }),
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => ({ error: "Request failed." }));
    throw new Error(errorBody.error || "Request failed.");
  }

  const assistantWrapper = appendMessage("assistant", "", "direct");
  const assistantBody = assistantWrapper.querySelector(".message-body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const event = JSON.parse(line);
      if (event.type === "meta" && event.routeHint) {
        status.textContent = `Routing: ${event.routeHint}`;
        updateAssistantRoute(assistantWrapper, event.routeHint);
      }
      if (event.type === "chunk" && typeof event.text === "string") {
        assistantBody.textContent += event.text;
        messages.scrollTop = messages.scrollHeight;
      }
      if (event.type === "error" && event.error) {
        throw new Error(event.error);
      }
      if (event.type === "done") {
        status.textContent = "Ready";
      }
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) {
    return;
  }

  appendMessage("user", message);
  status.textContent = "Waiting for coach...";
  submitButton.disabled = true;
  messageInput.disabled = true;
  messageInput.value = "";

  try {
    await streamResponse(message);
  } catch (error) {
    appendMessage("assistant", error instanceof Error ? error.message : "Unexpected error.", "direct");
    status.textContent = "Request failed";
  } finally {
    submitButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.prompt;
    messageInput.focus();
  });
});

ensureInitialWeights();
renderHeroPersonas();
renderQuiz();
renderResults();
renderDashboard();
renderCoachContext();
appendMessage(
  "assistant",
  "Tell me where you are in your step goal, ask for current walking guidance, or ask for a motivation style that matches your top persona.",
  "direct",
);

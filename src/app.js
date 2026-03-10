import { personas, quizQuestions, initialDemoState } from "./data.js";

const state = { ...initialDemoState };
const routes = Array.from(document.querySelectorAll(".route"));
const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const appRoot = document.getElementById("app");

const quizShell = document.getElementById("quiz-shell");
const resultsShell = document.getElementById("results-shell");

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

  const prev = quizShell.querySelector("#prev-question");
  const next = quizShell.querySelector("#next-question");

  prev.addEventListener("click", () => {
    state.currentQuestion = Math.max(0, state.currentQuestion - 1);
    renderQuiz();
  });

  next.addEventListener("click", () => {
    if (state.currentQuestion === quizQuestions.length - 1) {
      calculatePersonaWeights();
      renderResults();
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

navButtons.forEach((button) => {
  button.addEventListener("click", () => setRoute(button.dataset.route));
});

document.getElementById("start-quiz").addEventListener("click", () => {
  setRoute("quiz");
});

renderQuiz();
renderResults();
setRoute(state.route);

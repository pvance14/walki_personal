import { personas, quizQuestions, initialDemoState } from "./data.js";

const state = { ...initialDemoState };
const routes = Array.from(document.querySelectorAll(".route"));
const navButtons = Array.from(document.querySelectorAll(".nav-link"));
const appRoot = document.getElementById("app");

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

navButtons.forEach((button) => {
  button.addEventListener("click", () => setRoute(button.dataset.route));
});

document.getElementById("start-quiz").addEventListener("click", () => {
  setRoute("quiz");
});

// Baseline hydration so foundational shared data structures are confirmed at runtime.
console.info("Walki shell ready", {
  personaCount: personas.length,
  quizQuestionCount: quizQuestions.length,
  initialState: state,
});

setRoute(state.route);

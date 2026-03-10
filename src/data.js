export const personas = [
  { id: "companion", name: "Companion", color: "#f4a261", style: "supportive" },
  { id: "educator", name: "Educator", color: "#2a9d8f", style: "fact-based" },
  { id: "cheerleader", name: "Cheerleader", color: "#e76f51", style: "high-energy" },
  { id: "challenger", name: "Challenger", color: "#d62828", style: "competitive" },
  { id: "sage", name: "Sage", color: "#588157", style: "mindful" },
  { id: "pessimist", name: "Pessimist", color: "#6c757d", style: "dark-humor" },
];

export const quizQuestions = [
  {
    id: "q1",
    prompt: "It is 9 PM and you are short on steps. What gets you moving?",
    answers: [
      { id: "a", text: "A friend would be proud of me.", scores: { companion: 2, cheerleader: 1 } },
      { id: "b", text: "Health risks increase when I skip movement.", scores: { educator: 3 } },
      { id: "c", text: "I refuse to break my streak.", scores: { challenger: 2, sage: 1 } },
      { id: "d", text: "A walk would help me decompress.", scores: { sage: 2, companion: 1 } },
    ],
  },
];

export const initialDemoState = {
  route: "landing",
  personaWeights: {
    companion: 20,
    educator: 20,
    cheerleader: 20,
    challenger: 20,
    sage: 10,
    pessimist: 10,
  },
  todaySteps: 6247,
  dailyGoal: 7000,
  streakCurrent: 18,
};

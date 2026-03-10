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
    prompt: "It's 9 PM and you're 2,000 steps short. What gets you moving?",
    answers: [
      { id: "a", text: "A friend would be proud of me.", scores: { companion: 2, cheerleader: 1 } },
      { id: "b", text: "Missing a day raises health risk.", scores: { educator: 3 } },
      { id: "c", text: "I refuse to break my streak.", scores: { challenger: 2, sage: 1 } },
      { id: "d", text: "A walk would help me decompress.", scores: { sage: 2, companion: 1 } },
    ],
  },
  {
    id: "q2",
    prompt: "You hit 7 straight days. What message feels best?",
    answers: [
      { id: "a", text: "Big celebration and hype.", scores: { cheerleader: 3 } },
      { id: "b", text: "Health fact and measurable impact.", scores: { educator: 3 } },
      { id: "c", text: "A challenge to push further.", scores: { challenger: 3 } },
      { id: "d", text: "Warm encouragement from a friend.", scores: { companion: 3 } },
    ],
  },
  {
    id: "q3",
    prompt: "Why do you want to walk more consistently?",
    answers: [
      { id: "a", text: "To feel energized and proud.", scores: { cheerleader: 2, companion: 1 } },
      { id: "b", text: "For specific health outcomes.", scores: { educator: 3 } },
      { id: "c", text: "To prove I can stay disciplined.", scores: { challenger: 2, pessimist: 1 } },
      { id: "d", text: "To reduce stress and clear my mind.", scores: { sage: 3 } },
    ],
  },
  {
    id: "q4",
    prompt: "Which communication style resonates most?",
    answers: [
      { id: "a", text: "Warm and supportive.", scores: { companion: 3 } },
      { id: "b", text: "Direct and fact-based.", scores: { educator: 2, challenger: 1 } },
      { id: "c", text: "Playful and high-energy.", scores: { cheerleader: 3 } },
      { id: "d", text: "Calm and reflective.", scores: { sage: 3 } },
    ],
  },
  {
    id: "q5",
    prompt: "You miss a day. What helps you restart?",
    answers: [
      { id: "a", text: "It's okay, start fresh.", scores: { companion: 2, cheerleader: 1 } },
      { id: "b", text: "Consistency matters over perfection.", scores: { sage: 2, educator: 1 } },
      { id: "c", text: "Beat your old record.", scores: { challenger: 3 } },
      { id: "d", text: "Blunt honesty and accountability.", scores: { pessimist: 2, challenger: 1 } },
    ],
  },
  {
    id: "q6",
    prompt: "How do you feel about sarcasm and dark humor?",
    answers: [
      { id: "a", text: "Love it.", scores: { pessimist: 3, challenger: 1 } },
      { id: "b", text: "Sometimes, but mostly positive.", scores: { cheerleader: 2, companion: 1 } },
      { id: "c", text: "Not my thing.", scores: { educator: 2, sage: 1 } },
      { id: "d", text: "Depends on my mood.", scores: { companion: 1, educator: 1, cheerleader: 1, challenger: 1, sage: 1, pessimist: 1 } },
    ],
  },
  {
    id: "q7",
    prompt: "If you had a daily walking partner, who would it be?",
    answers: [
      { id: "a", text: "An enthusiastic friend.", scores: { cheerleader: 2, companion: 1 } },
      { id: "b", text: "A knowledgeable coach.", scores: { educator: 3 } },
      { id: "c", text: "A competitive rival.", scores: { challenger: 3 } },
      { id: "d", text: "A wise mentor.", scores: { sage: 3 } },
    ],
  },
  {
    id: "q8",
    prompt: "On a packed day with 15 minutes free, what motivates a short walk?",
    answers: [
      { id: "a", text: "Movement boosts focus and blood flow.", scores: { educator: 3 } },
      { id: "b", text: "I made a promise to myself.", scores: { companion: 2, sage: 1 } },
      { id: "c", text: "Don't let the day beat you.", scores: { challenger: 3 } },
      { id: "d", text: "Use it to reset and breathe.", scores: { sage: 3 } },
    ],
  },
  {
    id: "q9",
    prompt: "What milestone reward feels truly valuable?",
    answers: [
      { id: "a", text: "A public shoutout.", scores: { challenger: 2, cheerleader: 1 } },
      { id: "b", text: "A clear progress report.", scores: { educator: 3 } },
      { id: "c", text: "A heartfelt message.", scores: { companion: 2, cheerleader: 1 } },
      { id: "d", text: "Quiet personal satisfaction.", scores: { sage: 2, pessimist: 1 } },
    ],
  },
  {
    id: "q10",
    prompt: "It's raining and you want to skip. What gets you out the door?",
    answers: [
      { id: "a", text: "Stop making excuses.", scores: { pessimist: 3, challenger: 1 } },
      { id: "b", text: "You'll feel accomplished afterward.", scores: { cheerleader: 2, companion: 1 } },
      { id: "c", text: "It's grounding and mindful.", scores: { sage: 3 } },
      { id: "d", text: "Your health goals still matter.", scores: { educator: 2, challenger: 1 } },
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
  currentQuestion: 0,
  responses: {},
};

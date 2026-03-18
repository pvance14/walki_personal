# Demo Video Checklist

Use this as the script for the required unedited 2-minute screen recording.

## Before Recording

- Start the app with `npm run dev`
- Open `http://localhost:3000`
- Make sure your API keys are configured for the tools you want to demo
- Have the browser devtools console closed unless you specifically want to show logs in the terminal
- Keep a terminal visible with the server running so the grader can tell it is a real app

## Recommended Demo Flow

### 1. Show the app and chat UI
- Briefly show the Walki landing page, quiz/dashboard framing, and the embedded chat area
- Mention that the agent is a Node.js and TypeScript LangChain project with calculator, web search, RAG, and session memory

### 2. Calculator example
- Prompt: `If my daily goal is 7000 steps and I have 6247, how many steps do I have left?`
- What to point out: the answer uses calculator behavior and shows tool metadata in the chat UI

### 3. Web search example
- Prompt: `What are the latest walking or health headlines today?`
- What to point out: the answer uses the web-search tool for current information rather than relying on model memory

### 4. RAG example with visible source
- Prompt: `What does the local evidence say about walking and healthy aging?`
- What to point out: the answer is grounded in the local knowledge base and shows visible source chips/citations

### 5. Follow-up question showing memory
- Prompt: `Summarize that in two short bullet points for someone just getting started.`
- What to point out: the agent understands the follow-up without needing the original question repeated

### 6. Reset behavior
- Use the chat reset control
- Prompt: `What were we just talking about?`
- What to point out: the chat memory is cleared while the broader Walki page state remains intact

## Recording Tips

- Keep the run unedited and concise
- If web search is slow, wait it out instead of cutting away
- If a tool fails because of missing keys, stop and reconfigure before recording the final take
- End on the chat UI so the final frame still shows the working agent

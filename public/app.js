const form = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const status = document.getElementById("status");
const submitButton = document.getElementById("submit-button");

function appendMessage(role, text) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;

  const label = document.createElement("p");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "Agent";

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = text;

  wrapper.append(label, body);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  return body;
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
    }),
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => ({ error: "Request failed." }));
    throw new Error(errorBody.error || "Request failed.");
  }

  const assistantBody = appendMessage("assistant", "");
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
        status.textContent = `Routing hint: ${event.routeHint}`;
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
  status.textContent = "Waiting for agent...";
  submitButton.disabled = true;
  messageInput.disabled = true;
  messageInput.value = "";

  try {
    await streamResponse(message);
  } catch (error) {
    appendMessage("assistant", error instanceof Error ? error.message : "Unexpected error.");
    status.textContent = "Request failed";
  } finally {
    submitButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
});

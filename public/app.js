// script.js
const body = document.body;
const themeCheckbox = document.getElementById("toggleThemeCheckbox");
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// Initialize theme based on checkbox state
if (themeCheckbox.checked) {
  body.classList.add("dark-mode");
  body.classList.remove("light-mode");
} else {
  body.classList.add("light-mode");
  body.classList.remove("dark-mode");
}

// Theme toggle via switch
themeCheckbox.addEventListener("change", () => {
  if (themeCheckbox.checked) {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
  } else {
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");
  }
});

// Append a chat bubble
function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Send handler
function send() {
  const txt = inputEl.value.trim();
  if (!txt) return;
  appendMessage(txt, "user");
  inputEl.value = "";
  // TODO: call backend & append bot response
  setTimeout(() => appendMessage("Bot reply placeholder", "bot"), 500);
}

sendBtn.addEventListener("click", send);
inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") send();
});

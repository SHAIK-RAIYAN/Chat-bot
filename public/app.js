// public/app.js
document.addEventListener("DOMContentLoaded", () => {
  // Select DOM elements
  const body = document.body;
  const themeCheckbox = document.getElementById("toggleThemeCheckbox");
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  // Initialize theme on load
  if (themeCheckbox) {
    toggleTheme(themeCheckbox.checked);
    // Listen for theme switch changes
    themeCheckbox.addEventListener("change", () => {
      toggleTheme(themeCheckbox.checked);
    });
  } else {
    console.error("Theme checkbox not found");
  }

  // Theme toggle helper
  function toggleTheme(isDark) {
    if (isDark) {
      body.classList.add("dark-mode");
      body.classList.remove("light-mode");
    } else {
      body.classList.add("light-mode");
      body.classList.remove("dark-mode");
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Append a message to the chat
  function appendMessage(content, sender, isHTML = false) { //isHTML to check valid htl script or not
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    if (isHTML) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    setTimeout(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 0);
  }

  // Append a typing loader
  function appendLoader() {
    const loader = document.createElement("div");
    loader.classList.add("message", "bot", "loader");
    loader.id = "typing-loader";
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.innerHTML =
      '<div class="typing-indicator"><span></span><span></span><span></span><span></span></div>';
    loader.appendChild(bubble);
    messagesEl.appendChild(loader);
    console.log("Loader appended"); // Debug log
    setTimeout(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 0);
    return loader;
  }

  // Remove the typing loader
  function removeLoader() {
    const loader = document.getElementById("typing-loader");
    if (loader) {
      loader.remove();
      console.log("Loader removed"); // Debug log
    }
  }

  // Send message handler
  async function send() {
    const txt = inputEl.value.trim();
    if (!txt || txt.length < 2) {
      appendMessage("Please enter a more detailed message!", "bot", true);
      inputEl.value = "";
      return;
    }

    inputEl.disabled = true;
    sendBtn.disabled = true;
    appendMessage(txt, "user");
    inputEl.value = "";
    appendLoader();

    // Ensure loader is visible for at least 500ms
    const minLoaderTime = new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const res = await Promise.all([
        fetch("/gemini-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: txt }),
        }),
        minLoaderTime,
      ]).then(([res]) => res);

      removeLoader();
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const reply = data.reply || "No reply received";
      const safe = escapeHtml(reply);
      const html = "<p>" + safe.replace(/\n/g, "<br>") + "</p>";
      appendMessage(html, "bot", true);
    } catch (err) {
      removeLoader();
      console.error("Fetch error:", err);
      appendMessage(
        "Sorry, there was an issue connecting to the chatbot. Please try again.",
        "bot",
        true
      );
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = !inputEl.value.trim();
    }
  }

  // Event listeners for sending messages
  sendBtn.addEventListener("click", () => {
    console.log("Send button clicked");
    send();
  });
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      console.log("Enter key pressed");
      send();
    }
  });

  // Enable/disable send button based on input
  inputEl.addEventListener("input", () => {
    sendBtn.disabled = !inputEl.value.trim();
  });
  sendBtn.disabled = true;
});

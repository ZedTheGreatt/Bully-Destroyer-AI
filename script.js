const a = "gsk_";
const b = "TtlKHJ7EfSuDLZcRZu3SWGdyb3FYbQsJBgxdli982c2diWPXlXqQ";
const GROQ_API_KEY = a + b;

/* ---------------- SYSTEM PROMPT ---------------- */
const systemPrompt = `You are "Bully Destroyer", a kind, empathetic, and professional anti-bullying AI chatbot created for students.

Rules:
1. Be short, supportive, and natural.
2. Validate emotions first before advice.
3. Give simple actionable help.
4. If there is danger, suggest talking to a trusted adult or teacher.
5. No complex formatting or long responses.`;

/* ---------------- TIMEOUT WRAPPER ---------------- */
async function fetchWithTimeout(url, options, timeout = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    )
  ]);
}

/* ---------------- START APP ---------------- */
window.onload = function () {

  setTimeout(() => {

    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";

    displayMessage(
      "Hi. I'm Bully Destroyer AI. You're safe here. How can I help you today?",
      "bot"
    );

  }, 1500);
};


/* ---------------- MAIN AI FUNCTION ---------------- */
async function fetchAIResponse(userMessage) {

  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {

    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    }, 7000); // 7 seconds max wait

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      return "⚠️ I'm having trouble responding right now. Please try again.";
    }

    return data.choices?.[0]?.message?.content ||
      "I couldn't generate a response. Try again.";

  } catch (error) {

    console.error("Error:", error);

    if (error.message === "Timeout") {
      return "⏳ That took too long. Please try again.";
    }

    return "⚠️ Network issue. Please check your connection.";
  }
}


/* ---------------- SEND MESSAGE ---------------- */
async function handleSend() {

  const input = document.getElementById("userInput");
  const message = input.value.trim();

  if (!message) return;

  displayMessage(message, "user");
  input.value = "";

  const typingId = displayTypingIndicator();

  const response = await fetchAIResponse(message);

  removeTypingIndicator(typingId);

  displayMessage(response, "bot");
}


/* ---------------- QUICK SEND ---------------- */
async function sendAI(message) {

  displayMessage(message, "user");

  const typingId = displayTypingIndicator();

  const response = await fetchAIResponse(message);

  removeTypingIndicator(typingId);

  displayMessage(response, "bot");
}


/* ---------------- BULLY TYPE SELECT ---------------- */
async function handleBullyingType() {

  const select = document.getElementById("bullyingTypes");
  const type = select.value;

  if (!type) return;

  const prompt = `Explain briefly what ${type} bullying is and what someone should do if they experience it.`;

  select.value = "";

  sendAI(prompt);
}


/* ---------------- ENTER KEY ---------------- */
function handleKeyPress(event) {
  if (event.key === "Enter") handleSend();
}


/* ---------------- UI: MESSAGE ---------------- */
function displayMessage(text, sender) {

  const container = document.getElementById("messages");

  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;

  const label = document.createElement("span");
  label.className = "sender-label";
  label.innerHTML =
    sender === "user"
      ? "You"
      : "<i class='fas fa-robot'></i> Bully Destroyer AI";

  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.innerHTML = formatText(text);

  wrapper.appendChild(label);
  wrapper.appendChild(message);

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}


/* ---------------- UI: TYPING ---------------- */
function displayTypingIndicator() {

  const id = "typing-" + Date.now();

  const container = document.getElementById("messages");

  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper bot";
  wrapper.id = id;

  const bubble = document.createElement("div");
  bubble.className = "message bot";

  bubble.innerHTML =
    "Thinking " +
    '<i class="fas fa-circle" style="font-size:5px; animation:pulse 1s infinite;"></i> ' +
    '<i class="fas fa-circle" style="font-size:5px; animation:pulse 1s infinite 0.2s;"></i> ' +
    '<i class="fas fa-circle" style="font-size:5px; animation:pulse 1s infinite 0.4s;"></i>';

  wrapper.appendChild(bubble);
  container.appendChild(wrapper);

  container.scrollTop = container.scrollHeight;

  return id;
}


/* ---------------- REMOVE TYPING ---------------- */
function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}


/* ---------------- FORMAT TEXT ---------------- */
function formatText(text) {

  const safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return safe
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/\n/g, "<br>");
}


/* ---------------- CONTACT MODAL ---------------- */
function showContactModal() {
  document.getElementById("contactModal").style.display = "block";
}

function closeContactModal() {
  document.getElementById("contactModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("contactModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
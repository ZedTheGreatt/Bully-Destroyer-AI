// PUT YOUR GOOGLE GEMINI API KEY HERE
const API_KEY = "AIzaSyCNUxR8fuKTkVpv6DAGHhKeiVYAGeUPpsU"; 

const systemPrompt = `You are "Bully Destroyer", a kind, empathetic, and professional anti-bullying AI chatbot created for the students of ICP Meycauayan. 
Your primary goal is to support students facing bullying. 
Rules:
1. Keep your responses short, conversational, comforting, and provide actionable advice. 
2. Never be judgmental. Validate their feelings.
3. If someone is in severe physical danger, gently advise them to contact a teacher.
4. Do not use complex markdown formatting.`;

// We will store the working model here so it only has to search once
let AUTO_MODEL = "";

window.onload = function() {
  setTimeout(() => {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("chatbox").style.display = "flex";
    displayMessage("Hi there. I am the Bully Destroyer AI. You are in a safe, anonymous space. How can I support you today?", "bot");
  }, 1500); 
};

// Updated API Function with SMART AUTO-DETECT
async function fetchAIResponse(userMessage) {
  try {
    // 1. AUTO-DETECT THE CORRECT MODEL
    if (!AUTO_MODEL) {
      const checkModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
      const modelRes = await fetch(checkModelsUrl);
      const modelData = await modelRes.json();
      
      if (modelData.models) {
        // Find the first Gemini model that supports text generation
        const validModel = modelData.models.find(m => 
          m.supportedGenerationMethods && 
          m.supportedGenerationMethods.includes("generateContent") && 
          m.name.includes("gemini")
        );
        
        if (validModel) {
          AUTO_MODEL = validModel.name; // It will look something like "models/gemini-1.5-flash"
          console.log("Success! Auto-detected working model:", AUTO_MODEL);
        } else {
          return "⚠️ API Error: Your Google account doesn't have access to Gemini text models.";
        }
      } else if (modelData.error) {
        return `⚠️ API Error: ${modelData.error.message}`;
      }
    }

    // 2. MAKE THE CHAT REQUEST USING THE DETECTED MODEL
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${AUTO_MODEL}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nUser says: " + userMessage }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Google API Error:", data);
      return `⚠️ API Error: ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "I received a blank response from the AI. Please try again.";
    }
    
  } catch (error) {
    console.error("Network Error:", error);
    return "⚠️ Network error. Are you connected to the internet?";
  }
}

// User clicks send button
async function handleSend() {
  const inputElement = document.getElementById("userInput");
  const message = inputElement.value.trim();
  if (!message) return;

  displayMessage(message, "user");
  inputElement.value = "";

  const typingId = displayTypingIndicator();
  const aiResponse = await fetchAIResponse(message);
  
  removeTypingIndicator(typingId);
  displayMessage(aiResponse, "bot");
}

// Quick-action buttons
async function sendAI(message) {
  displayMessage(message, "user");
  const typingId = displayTypingIndicator();
  const aiResponse = await fetchAIResponse(message);
  removeTypingIndicator(typingId);
  displayMessage(aiResponse, "bot");
}

// Dropdown handler
async function handleBullyingType() {
  const select = document.getElementById("bullyingTypes");
  const type = select.value;
  if (!type) return;

  const prompt = `Can you briefly explain what ${type} bullying is and what I should do if I experience it?`;
  select.value = ""; 
  sendAI(prompt);
}

function handleKeyPress(event) {
  if (event.key === "Enter") handleSend();
}

// --- UI Rendering Functions ---
function displayMessage(text, sender) {
  const messagesContainer = document.getElementById("messages");
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;

  const label = document.createElement("span");
  label.className = "sender-label";
  label.innerHTML = sender === "user" ? "You" : "<i class='fas fa-robot'></i> AI Support";

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = formatText(text);

  wrapper.appendChild(label);
  wrapper.appendChild(messageDiv);
  messagesContainer.appendChild(wrapper);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function displayTypingIndicator() {
  const id = "typing-" + Date.now();
  const messagesContainer = document.getElementById("messages");
  
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper bot";
  wrapper.id = id;

  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot";
  messageDiv.innerHTML = 'Typing <i class="fas fa-circle" style="font-size: 5px; animation: pulse 1s infinite;"></i> <i class="fas fa-circle" style="font-size: 5px; animation: pulse 1s infinite 0.2s;"></i> <i class="fas fa-circle" style="font-size: 5px; animation: pulse 1s infinite 0.4s;"></i>';

  wrapper.appendChild(messageDiv);
  messagesContainer.appendChild(wrapper);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) indicator.remove();
}

function formatText(text) {
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<i>$1</i>");
  formattedText = formattedText.replace(/\n/g, "<br>");
  return formattedText;
}
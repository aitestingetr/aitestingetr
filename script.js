// Insert your Hugging Face API key here
const HF_API_KEY = "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";

// Holds the text extracted from file or website
let currentContent = "";

// DOM elements
const fileInput = document.getElementById("fileInput");
const urlInput = document.getElementById("urlInput");
const fetchUrlBtn = document.getElementById("fetchUrlBtn");
const askBtn = document.getElementById("askBtn");
const questionEl = document.getElementById("question");
const outputEl = document.getElementById("output");

// ------------------------------
// FILE UPLOAD HANDLING
// ------------------------------
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    currentContent = reader.result;
    outputEl.textContent = "File loaded. Ask a question when ready.";
  };
  reader.readAsText(file);
});

// ------------------------------
// WEBSITE FETCH HANDLING
// ------------------------------
fetchUrlBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return alert("Enter a URL first.");

  outputEl.textContent = "Fetching website…";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch URL");

    const html = await res.text();

    // Strip scripts, styles, and HTML tags
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ");

    currentContent = text;
    outputEl.textContent = "Website loaded. Ask a question when ready.";
  } catch (err) {
    console.error(err);
    outputEl.textContent = "Error fetching website (likely CORS blocked).";
  }
});

// ------------------------------
// CALL HUGGING FACE API
// ------------------------------
async function callHuggingFace(prompt) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/google/gemma-2b-it",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    }
  );

  const result = await response.json();
  return result[0]?.generated_text || "No response from model.";
}

// ------------------------------
// ASK BUTTON HANDLER
// ------------------------------
askBtn.addEventListener("click", async () => {
  const question = questionEl.value.trim();
  if (!question) return alert("Enter a question.");
  if (!currentContent) return alert("Upload a file or load a website first.");

  outputEl.textContent = "Thinking…";

  const prompt = `
You are an AI assistant. The user has provided content and a question.

CONTENT:
${currentContent.slice(0, 8000)}

QUESTION:
${question}

Answer clearly and concisely based only on the content above.
`;

  try {
    const answer = await callHuggingFace(prompt);
    outputEl.textContent = answer;
  } catch (err) {
    console.error(err);
    outputEl.textContent = "Error calling Hugging Face API.";
  }
});

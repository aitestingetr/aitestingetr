// ⚠️ For demo only. Exposing API keys in frontend is insecure.
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

let currentContent = ""; // Holds text from file or website

const fileInput = document.getElementById("fileInput");
const urlInput = document.getElementById("urlInput");
const fetchUrlBtn = document.getElementById("fetchUrlBtn");
const askBtn = document.getElementById("askBtn");
const questionEl = document.getElementById("question");
const outputEl = document.getElementById("output");

// Handle file upload
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    currentContent = reader.result;
    outputEl.textContent = "File loaded. Now ask a question.";
  };
  reader.readAsText(file); // works for txt, md, simple docs
});

// Handle website fetch
fetchUrlBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return alert("Enter a URL");

  outputEl.textContent = "Fetching website...";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch URL");
    const html = await res.text();

    // Very naive text extraction: strip tags
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, "")
                     .replace(/<style[\s\S]*?<\/style>/gi, "")
                     .replace(/<[^>]+>/g, " ");
    currentContent = text;
    outputEl.textContent = "Website content loaded. Now ask a question.";
  } catch (err) {
    console.error(err);
    outputEl.textContent = "Error fetching website (CORS or network).";
  }
});

// Call OpenAI API
askBtn.addEventListener("click", async () => {
  const question = questionEl.value.trim();
  if (!question) return alert("Enter a question");
  if (!currentContent) return alert("Upload a file or load a website first.");

  outputEl.textContent = "Thinking...";

  const prompt = `
You are an AI assistant. The user has provided some content and a question.

CONTENT:
${currentContent.slice(0, 8000)}

QUESTION:
${question}

Answer concisely based only on the content above.
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "No response.";
    outputEl.textContent = answer;
  } catch (err) {
    console.error(err);
    outputEl.textContent = "Error calling AI API.";
  }
});


import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview", //gemini-3-flash-preview gemini-2.5-flash
  generationConfig: {
    responseMimeType: "application/json",
  },
  systemInstruction: `
You are a senior MERN stack developer with 10 years of experience.

STRICT RULES:
- Always return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT wrap output in backticks.
- Do NOT add explanations outside JSON.
- Always follow the structure below exactly.

Required JSON structure:

{
  "text": "optional explanation message",
  "fileTree": {
    "filename.js": {
      "file": {
        "contents": "file code here"
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}

If user sends a greeting like "Hello", return:

{
  "text": "Hello, how can I help you today?"
}

IMPORTANT:
- Never use file names like routes/index.js
- Always maintain previous structure if updating code
- Always write scalable, modular, production-ready code
`,
});

export const generateResult = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();

    console.log("AI RAW OUTPUT:", text); // 🔥 Debug line

    return text;
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    throw error;
  }
};

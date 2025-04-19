import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to initialize Gemini AI
const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash", apiVersion: "v1" });
};

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const model = getGeminiModel();

    // Improved prompt with markdown emphasis + formatting instructions
    const prompt = `
You are NetGuard — a friendly, fun, and professional AI chatbot expert in WiFi security.

🎯 Format everything using **Markdown**:
- Use headings (##), bullet points (•), and emojis.
- Keep spacing clean and use punctuation correctly.
- Add relevant emojis at the start of bullet points.
- Always include a **Fun Fact or Alert** section at the end.
- NEVER skip structure or make it a single paragraph.

## ✉️ User Question:
"${message}"

## 🔹 Response Format:
### 🔹 Introduction  
• A short overview of the question or concern.

### ⚠️ Potential Risks  
• Risk 1  
• Risk 2  

### 🛡️ How to Protect Yourself  
• Tip 1  
• Tip 2  

### 💡 Fun Fact or Alert  
Include something surprising or cautionary.

Now reply to the user question using the exact format above.
`;

    const response = await model.generateContent(prompt);

    const reply =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\n/g, "\n\n") ||
      "Sorry, I couldn't understand that.";

    return Response.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}

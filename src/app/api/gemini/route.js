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
    if (!message) return Response.json({ error: "Message is required" }, { status: 400 });

    const model = getGeminiModel();

    // WiFi Security Focused Prompt
    const prompt = `
      You are a WiFi security expert AI chatbot named "NetGuard" designed to educate users about network security threats in a fun and engaging manner.
      - Your responses should be clear and **well-structured** using headings, bullet points, and spacing.
      - If the user asks about hacking or illegal activity, provide a professional warning about the risks.
      - Keep the tone slightly playful but **informative**.
      - Encourage users to stay safe while using public WiFi.

      ---
      ## **User Question:**
      "${message}"

      ## **Response Format:**
      🔹 **Introduction**  
      Briefly summarize the key point of the user's question.

      ### **Potential Risks**  
      - Risk 1  
      - Risk 2  

      ### **How to Protect Yourself**  
      - Tip 1  
      - Tip 2  

      ### **Fun Fact or Alert**  
      Include a hacker-style alert or a fun fact related to WiFi security.

      ---
      ✅ Keep it conversational but professional.
      ✅ Avoid too much technical jargon unless necessary.

      Now answer the user's question using this format:
    `;

    const response = await model.generateContent(prompt);

    // Extract text correctly with markdown-style formatting
    const reply =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\n/g, "\n\n") ||
      "Sorry, I couldn't understand that.";

    return Response.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}

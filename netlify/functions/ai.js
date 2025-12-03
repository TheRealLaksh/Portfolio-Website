import { GoogleGenAI } from "@google/genai";

// --- SYSTEM INSTRUCTION (From your new Digital Twin project) ---
const LAKSH_SYSTEM_INSTRUCTION = `
You are AI Laksh — the official digital twin of Laksh Pradhwani.

Core Identity:
You represent Laksh professionally, authentically, and helpfully. Speak as Laksh’s AI counterpart: disciplined, analytical, curious, ambitious, respectful, and technically insightful. Maintain a friendly, engaging, confident tone. Use clear reasoning and precision.

General Capability:
You are a fully capable general-purpose AI assistant.
You may answer ANY user question on ANY topic.

Laksh-Specific Rules:
If the question is about Laksh himself — his background, profile, achievements, projects, personality, education, experience, links, goals, or traits — you must answer strictly from the verified data below.

Laksh’s Verified Profile Data:
[ BEGIN DATA ]
INTRO: Laksh Pradhwani is an 18-year-old Grade XII student aspiring to become an AI/ML Engineer. He enjoys turning complex problems into real solutions.
ACADEMICS: Sunbeam School Lahartara (PCM + CS). Formerly at Chinmaya International Residential School. Class X: 87.8%.
SKILLS: HTML, CSS, JavaScript, Tailwind, MERN Basics, Python, Django, Firebase, Prompt Engineering, Neural Networks, Clustering, Feature Engineering, Cybersecurity Basics.
INTERNSHIPS: 
- AI/Algo Intern @ IIT Madras (Online)
- Full Stack Intern @ Unified Mentor (Projects: Helios Music Player, CaliBridge)
- Web Developer Intern @ MoreYeahs (Built GigX with Django)
- On-site IT Intern @ Hotel Kavana
ACHIEVEMENTS: Regional Winner VVM, Robowars 2nd Place, National-level Shooting Athlete.
PROJECTS:
- Portfolio: https://www.lakshp.live/
- Stranger Things 3D: https://stranger-things-5.netlify.app/
- Helios: https://music.lakshp.live/
- CaliBridge: https://events.lakshp.live/
CONTACT: laksh.pradhwani@gmail.com, LinkedIn: https://www.linkedin.com/in/laksh-pradhwani/
[ END DATA ]

Behavior:
1. If about Laksh -> use verified data.
2. If not about Laksh -> answer freely and helpfully.
`;

export async function handler(event) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Parse the incoming message
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        // Optional: Support chat history if you update your frontend later
        // format: [{ role: 'user', parts: [{ text: '...' }] }, ...]
        const history = body.history || [];

        if (!userMessage) {
            return { statusCode: 400, body: "Missing message" };
        }

        // Initialize Gemini
        // Make sure GEMINI_API_KEY is set in your Netlify Environment Variables
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Create the chat configuration
        const model = genAI.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: LAKSH_SYSTEM_INSTRUCTION,
                temperature: 0.7,
            },
            history: history
        });

        // Generate response (Non-streaming for compatibility with existing frontend)
        const result = await model.sendMessage(userMessage);
        const responseText = result.response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: responseText })
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "My neural link is fuzzy right now. Please try again later!" })
        };
    }
}
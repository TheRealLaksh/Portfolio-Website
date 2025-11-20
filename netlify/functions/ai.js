import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    let message;
    try {
        message = JSON.parse(event.body).message;
    } catch {
        return { statusCode: 400, body: "Invalid JSON" };
    }

    if (!message) {
        return { statusCode: 400, body: "Missing message" };
    }

    try {
        // Correct directory for Netlify Functions
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, "laksh.json");

        // Read laksh.json
        const profileData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const systemPrompt = `
You are AI Laksh — the professional & friendly AI assistant of Laksh Pradhwani.
Use ONLY the following profile data to answer questions:

${JSON.stringify(profileData, null, 2)}
        `;

        const HF_TOKEN = process.env.HF_API_TOKEN;
        if (!HF_TOKEN) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "HF_API_TOKEN is missing" })
            };
        }

        // HuggingFace inference call
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: `${systemPrompt}\nUser: ${message}\nAI:`,
                    parameters: { max_new_tokens: 200 }
                })
            }
        );

        const data = await response.json();

        let reply = "Sorry, I couldn't understand.";

        // Fix HuggingFace output parsing
        if (Array.isArray(data) && data[0]?.generated_text) {
            reply = data[0].generated_text.replace(/.*AI:/s, "").trim();
        } else if (typeof data.generated_text === "string") {
            reply = data.generated_text.trim();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}

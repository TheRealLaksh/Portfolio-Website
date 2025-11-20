// netlify/functions/ai.js

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

export async function handler(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
        return { statusCode: 400, body: "Missing message" };
    }

    try {
        // ---- Load laksh.json ----
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.join(process.cwd(), "assets", "data", "laksh.json");
        const profileData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const systemPrompt = `
You are AI Laksh — a super smart, funny + professional assistant of Laksh Pradhwani.
Answer ONLY using this data:

${JSON.stringify(profileData)}
        `;

        const HF_TOKEN = process.env.HF_API_TOKEN;

        // ---- NATIVELY AVAILABLE fetch (NO node-fetch) ----
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

        let reply = "Sorry, I couldn't generate a reply.";
        if (Array.isArray(data) && data[0]?.generated_text) {
            reply = data[0].generated_text.replace(/.*AI:/s, "").trim();
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

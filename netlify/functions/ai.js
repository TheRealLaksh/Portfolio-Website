// netlify/functions/ai.js

import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export async function handler(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
        return { statusCode: 400, body: "Missing message" };
    }

    // Load laksh.json
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filePath = path.resolve(__dirname, "../../assets/data/laksh.json");

        const profileData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const systemPrompt = `
You are AI Laksh — a funny + professional personal assistant of Laksh Pradhwani.
Use ONLY the following profile data to answer questions about him:
${JSON.stringify(profileData)}
        `;

        const HF_TOKEN = process.env.HF_API_TOKEN;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: `${systemPrompt}\n\nUser: ${message}\nAI:`,
                    parameters: { max_new_tokens: 250 }
                })
            }
        );

        const data = await response.json();

        const reply =
            data && Array.isArray(data) && data[0] && data[0].generated_text
                ? data[0].generated_text
                : JSON.stringify(data);

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

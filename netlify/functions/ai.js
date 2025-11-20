const path = require("path");
const fs = require("fs");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
        return { statusCode: 400, body: "Missing message" };
    }

    try {
        const filePath = path.resolve(__dirname, "./laksh.json");
        const profileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const systemPrompt = `
You are AI Laksh — assistant of Laksh Pradhwani.
Use ONLY the following profile data:
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

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data[0]?.generated_text || "No reply" })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};

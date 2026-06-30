const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

// 首页
app.get("/", (req, res) => {
    res.send("AI Server is running!");
});

// OpenAI models 接口
app.get("/v1/models", (req, res) => {
    res.json({
        object: "list",
        data: [
            {
                id: "cohere/north-mini-code:free",
                object: "model",
                owned_by: "OpenRouter"
            }
        ]
    });
});

// OpenAI chat 接口
app.post("/v1/chat/completions", async (req, res) => {
    try {
        const model = req.body.model || "cohere/north-mini-code:free";
        const messages = req.body.messages;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: {
                    message: "messages is required"
                }
            });
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model,
                messages
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "ai-server"
                }
            }
        );

        res.json(response.data);

    } catch (err) {
        console.error(err.response?.data || err.message);

        res.status(500).json({
            error: {
                message: err.response?.data || err.message
            }
        });
    }
});

// 保留你原来的 /chat
app.post("/chat", async (req, res) => {

    const userMessage = req.body.message;
    const model = req.body.model || "cohere/north-mini-code:free";

    if (!userMessage) {
        return res.status(400).json({
            error: "message required"
        });
    }

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model,
                messages: [
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "ai-server"
                }
            }
        );

        res.json({
            success: true,
            content: response.data.choices[0].message.content,
            usedModel: model
        });

    } catch (err) {

        console.error(err.response?.data || err.message);

        res.status(500).json({
            error: "Internal server error"
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`AI server running on port ${PORT}`);
});

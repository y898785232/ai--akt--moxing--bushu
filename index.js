// 1. 引入依赖包
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// 2. 创建 app 实例
const app = express();

// 3. 解析 JSON 请求体
app.use(express.json());

// 4. 根路径测试
app.get('/', (req, res) => {
    res.send('AI Server is running!');
});

// 5. /chat 接口
app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    const model = req.body.model || "cohere/north-mini-code:free";

    // 校验：消息不能为空
    if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ error: "Message content is required" });
    }

    if (userMessage.length > 2000) {
        return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: model,
                messages: [{ role: "user", content: userMessage }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "ai-server"
                }
            }
        );

        const content = response.data.choices?.[0]?.message?.content;
        if (!content) {
            return res.status(500).json({ error: "No response from model" });
        }

        res.json({
            success: true,
            content: content,
            usedModel: model
        });

    } catch (err) {
        console.error("OpenRouter API error:", err.response?.data || err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 6. 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AI server running on port ${PORT}`);
});

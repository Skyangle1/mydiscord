const axios = require('axios');

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Google Gemini API key is required');
        }
        this.apiKey = apiKey;
        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    }

    async getDailyLoveQuote() {
        const prompt = `Generate a beautiful, romantic love quote or poem that would be perfect for a daily love message. Make it heartfelt and inspiring. Respond with only the quote/poem, nothing else.`;

        try {
            const response = await axios.post(this.baseUrl, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const quote = response.data.candidates[0].content.parts[0].text.trim();
            return quote;
        } catch (error) {
            console.error('Error getting quote from Gemini:', error);
            // Return a fallback quote if API fails
            return `"Love is composed of a single soul inhabiting two bodies." - Aristotle`;
        }
    }
}

module.exports = GeminiService;
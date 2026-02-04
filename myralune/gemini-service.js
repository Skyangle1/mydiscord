const axios = require('axios');

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Google Gemini API key is required');
        }
        this.apiKey = apiKey;
        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
                },
                timeout: 10000 // 10 second timeout
            });

            if (response.data.candidates && response.data.candidates.length > 0) {
                const quote = response.data.candidates[0].content.parts[0].text.trim();
                return quote;
            } else {
                console.warn('No candidates returned from Gemini API');
                return `"Every moment with you is a blessing." - Anonymous`;
            }
        } catch (error) {
            console.error('Error getting quote from Gemini:', error.message);

            // Handle specific error types
            if (error.response) {
                console.error(`Gemini API Error: ${error.response.status} - ${error.response.statusText}`);
                if (error.response.status === 404) {
                    console.error('Model not found. Please check if gemini-1.5-flash is available in your region.');
                } else if (error.response.status === 400) {
                    console.error('Bad request to Gemini API. Check your prompt or API key.');
                } else if (error.response.status === 403) {
                    console.error('Access forbidden. Check your API key permissions.');
                }
            } else if (error.request) {
                console.error('No response received from Gemini API. Network issue?');
            }

            // Return a fallback quote if API fails
            return `"Love is composed of a single soul inhabiting two bodies." - Aristotle`;
        }
    }
}

module.exports = GeminiService;
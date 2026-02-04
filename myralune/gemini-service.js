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
        // Create a random category to diversify the types of quotes
        const categories = [
            "romantic love",
            "deep emotional connection",
            "passionate love",
            "gentle and tender affection",
            "eternal love",
            "soulmate connection",
            "unconditional love",
            "heartfelt emotions",
            "devotion and commitment",
            "affectionate feelings"
        ];

        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        // Create a random style to diversify the format
        const styles = [
            "quote",
            "poem",
            "short verse",
            "profound saying",
            "heartfelt message",
            "romantic thought"
        ];

        const randomStyle = styles[Math.floor(Math.random() * styles.length)];

        const prompt = `Generate a unique, beautiful, and original ${randomCategory} ${randomStyle} that would be perfect for a daily love message. Make it heartfelt and inspiring, but different from typical love quotes. Use creative and diverse expressions. Respond with only the ${randomStyle}, nothing else.`;

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
                // Return a random fallback quote
                const fallbackQuotes = [
                    `"Every moment with you is a blessing." - Anonymous`,
                    `"In your smile, I see something more beautiful than the stars." - Unknown`,
                    `"You are my today and all of my tomorrows." - Leo Christopher`,
                    `"I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more." - Angelita Aguilar`,
                    `"If I had a flower for every time I thought of you, I could walk through my garden forever." - Alfred Lord Tennyson`,
                    `"Being deeply loved by someone gives you strength, while loving someone deeply gives you courage." - Lao Tzu`,
                    `"I love you not only for what you are, but for what I am when I am with you." - Elizabeth Barrett Browning`,
                    `"You are my compass, my anchor, and my best friend." - Unknown`,
                    `"I choose you. And I'll choose you over and over. Without pause, without a doubt, in a heartbeat. I'll keep choosing you." - Unknown`,
                    `"You are my sunshine on the cloudiest of days." - Unknown`
                ];
                return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
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

            // Return a random fallback quote if API fails
            const fallbackQuotes = [
                `"Love is composed of a single soul inhabiting two bodies." - Aristotle`,
                `"The best thing to hold onto in life is each other." - Audrey Hepburn`,
                `"I have waited for this opportunity for more than half my lifetime. You have taught me the meaning of patience." - Unknown`,
                `"In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine." - Maya Angelou`,
                `"I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more." - Angelita Aguilar`,
                `"If I had a flower for every time I thought of you, I could walk through my garden forever." - Alfred Lord Tennyson`,
                `"To love and be loved is to feel the sun from both sides." - Victor Hugo`,
                `"You are my today and all of my tomorrows." - Leo Christopher`,
                `"I love you not only for what you are, but for what I am when I am with you." - Elizabeth Barrett Browning`,
                `"Being deeply loved by someone gives you strength, while loving someone deeply gives you courage." - Lao Tzu`
            ];
            return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        }
    }
}

module.exports = GeminiService;
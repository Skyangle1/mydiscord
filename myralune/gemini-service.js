const axios = require('axios');

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Google Gemini API key is required');
        }
        this.apiKey = apiKey;
        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    }

    async getDailyLoveQuote() {
        // Daftar mood acak
        const daftarMood = [
            "puitis",
            "ceria",
            "sedikit misterius",
            "penuh dukungan",
            "santai/gaul",
            "romantis mendalam",
            "reflektif",
            "hangat dan lembut",
            "penuh harapan",
            "menghibur"
        ];
        const moodHariIni = daftarMood[Math.floor(Math.random() * daftarMood.length)];

        // Create a random metaphor to diversify the imagery
        const metaphors = [
            "senja",
            "secangkir kopi",
            "binatang bintang",
            "rintik hujan",
            "cahaya bulan",
            "angin malam",
            "tanaman yang tumbuh",
            "melodi yang tak terdengar",
            "bayangan di dinding",
            "kilau embun pagi"
        ];
        const randomMetaphor = metaphors[Math.floor(Math.random() * metaphors.length)];

        // Define the identity and role for Gemini
        const prompt = `Kamu adalah 'Sang Pembisik Rindu', seorang penyair modern yang kreatif.
        Tugasmu: Tulis surat cinta/puisi motivasi anonim yang indah.
        Aturan:
        - Gunakan bahasa yang hangat, puitis, tapi tidak alay.
        - JANGAN gunakan kata-kata yang sering diulang (klise).
        - Gunakan variasi metafora termasuk '${randomMetaphor}'.
        - Buat suasana hati: ${moodHariIni}
        - Pastikan setiap balasan selalu BERBEDA meskipun topiknya sama.
        Tulis dalam bentuk puisi pendek atau kutipan yang penuh makna. Respon hanya dengan puisi/kutipan tersebut, tanpa komentar tambahan.`;

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
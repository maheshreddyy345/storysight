import CONFIG from './config.js';

class LLMService {
    constructor() {
        this.apiKey = CONFIG.OPENAI_API_KEY;
    }

    async extractDataPoints(rawText) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'system',
                        content: 'Extract numerical data points from the text and format them as JSON. Focus on key metrics, trends, and patterns.'
                    }, {
                        role: 'user',
                        content: rawText
                    }],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error extracting data points:', error);
            throw error;
        }
    }

    async generateInsights(dataPoints) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'system',
                        content: 'Analyze the data points and provide key insights, trends, and recommendations.'
                    }, {
                        role: 'user',
                        content: JSON.stringify(dataPoints)
                    }],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating insights:', error);
            throw error;
        }
    }
}

export default LLMService;

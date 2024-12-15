import CONFIG from './config.js';

class LLMService {
    constructor() {
        this.apiKey = CONFIG.OPENAI_API_KEY;
    }

    async extractDataPoints(text) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `You are a data extraction assistant. Extract numerical data points from text and return them in JSON format with meaningful labels and categories. Include additional context like time periods, trends, and relationships between numbers.`
                        },
                        {
                            role: "user",
                            content: text
                        }
                    ],
                    functions: [
                        {
                            name: "process_data_points",
                            description: "Process and structure the extracted data points",
                            parameters: {
                                type: "object",
                                properties: {
                                    dataPoints: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                value: {
                                                    type: "number",
                                                    description: "The numerical value"
                                                },
                                                label: {
                                                    type: "string",
                                                    description: "A descriptive label for the value"
                                                },
                                                category: {
                                                    type: "string",
                                                    description: "Category of the data point (e.g., 'Sales', 'Growth', 'Revenue')"
                                                },
                                                trend: {
                                                    type: "string",
                                                    description: "Optional trend description (e.g., 'increasing', 'decreasing')"
                                                }
                                            },
                                            required: ["value", "label", "category"]
                                        }
                                    },
                                    summary: {
                                        type: "string",
                                        description: "A brief summary of the data insights"
                                    }
                                },
                                required: ["dataPoints", "summary"]
                            }
                        }
                    ],
                    function_call: { name: "process_data_points" }
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            const functionCall = data.choices[0].message.function_call;
            return JSON.parse(functionCall.arguments);
        } catch (error) {
            console.error('Error calling LLM:', error);
            throw error;
        }
    }

    generateInsights(dataPoints) {
        // Additional method to generate insights about the data
        const trends = dataPoints.filter(dp => dp.trend);
        const categories = [...new Set(dataPoints.map(dp => dp.category))];
        
        let insights = [];
        
        // Analyze trends
        if (trends.length > 0) {
            insights.push(`Found ${trends.length} trending metrics:`);
            trends.forEach(t => {
                insights.push(`- ${t.label} is ${t.trend}`);
            });
        }

        // Analyze categories
        if (categories.length > 0) {
            insights.push(`\nData spans ${categories.length} categories:`);
            categories.forEach(cat => {
                const catPoints = dataPoints.filter(dp => dp.category === cat);
                insights.push(`- ${cat}: ${catPoints.length} data points`);
            });
        }

        return insights.join('\n');
    }
}

export default LLMService;

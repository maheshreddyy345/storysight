// Use environment variable for API key
const CONFIG = {
    OPENAI_API_KEY: window.OPENAI_API_KEY || ''  // Will be set from Netlify environment
};

export default CONFIG;

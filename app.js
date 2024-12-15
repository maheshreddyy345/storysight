import LLMService from './llm-service.js';
import * as echarts from 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/+esm';

class App {
    constructor() {
        this.llmService = new LLMService();
        this.chartInstance = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        this.initializeUI();
    }

    initializeUI() {
        const textInput = document.getElementById('text-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const recordBtn = document.getElementById('record-btn');
        const chartContainer = document.getElementById('chart-container');
        
        analyzeBtn.addEventListener('click', () => this.processText(textInput.value));
        recordBtn.addEventListener('click', () => this.toggleRecording());
        
        // Initialize ECharts
        this.chartInstance = echarts.init(chartContainer);
    }

    async processText(rawText) {
        try {
            // Show loading state
            document.getElementById('loading').style.display = 'block';
            
            // Extract data points using GPT-4
            const dataPoints = await this.llmService.extractDataPoints(rawText);
            const parsedData = JSON.parse(dataPoints);
            
            // Generate insights
            const insights = await this.llmService.generateInsights(parsedData);
            
            // Update insights panel
            document.getElementById('insights-panel').innerHTML = insights;
            
            // Create and animate chart
            this.createAnimatedChart(parsedData);
            
            // Hide loading state
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Error processing text:', error);
            document.getElementById('loading').style.display = 'none';
            alert('Error processing text. Please try again.');
        }
    }

    createAnimatedChart(data) {
        const option = {
            title: {
                text: 'Data Visualization',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: [...new Set(data.dataPoints.map(dp => dp.category))],
                bottom: 10
            },
            xAxis: {
                type: 'category',
                data: data.dataPoints.map(dp => dp.label)
            },
            yAxis: {
                type: 'value'
            },
            series: this.createSeriesData(data),
            animationDuration: 2000,
            animationEasing: 'cubicInOut'
        };

        this.chartInstance.setOption(option);
    }

    createSeriesData(data) {
        const categories = [...new Set(data.dataPoints.map(dp => dp.category))];
        return categories.map(category => ({
            name: category,
            type: 'bar',
            data: data.dataPoints
                .filter(dp => dp.category === category)
                .map(dp => dp.value)
        }));
    }

    toggleRecording() {
        if (!this.mediaRecorder) {
            this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            this.recordedChunks = [];
            
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = 'chart-animation.webm';
                a.click();
                
                // Cleanup
                stream.getTracks().forEach(track => track.stop());
                this.mediaRecorder = null;
            };
            
            this.mediaRecorder.start();
            document.getElementById('record-btn').textContent = 'Stop Recording';
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Error starting recording. Please try again.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            document.getElementById('record-btn').textContent = 'Record Animation';
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

import LLMService from './llm-service.js';

class StorySight {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.visualizeBtn = document.getElementById('visualizeBtn');
        this.chartType = document.getElementById('chartType');
        this.animationStyle = document.getElementById('animationStyle');
        this.visualizationArea = document.getElementById('visualizationArea');
        this.replayBtn = document.getElementById('replayBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        this.currentData = null;
        this.llmService = new LLMService();
        this.initialize();
    }

    initialize() {
        this.visualizeBtn.addEventListener('click', () => this.processText());
        this.replayBtn.addEventListener('click', () => this.replayAnimation());
        this.exportBtn.addEventListener('click', () => this.exportVisualization());
    }

    async processText() {
        const text = this.textInput.value;
        if (!text) return;

        try {
            // Show loading state
            this.visualizeBtn.disabled = true;
            this.visualizeBtn.innerHTML = '<span class="animate-spin">↻</span> Processing...';

            // Extract data points using LLM
            const result = await this.llmService.extractDataPoints(text);
            
            // Generate insights
            const insights = this.llmService.generateInsights(result.dataPoints);
            
            // Update the visualization
            this.currentData = {
                values: result.dataPoints.map(dp => dp.value),
                labels: result.dataPoints.map(dp => dp.label),
                categories: result.dataPoints.map(dp => dp.category),
                trends: result.dataPoints.map(dp => dp.trend),
                summary: result.summary,
                insights: insights
            };

            this.createVisualization();
        } catch (error) {
            console.error('Error processing text:', error);
            alert('Error processing text. Please check your API key and try again.');
        } finally {
            // Reset button state
            this.visualizeBtn.disabled = false;
            this.visualizeBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Visualize Text
            `;
        }
    }

    createVisualization() {
        this.visualizationArea.innerHTML = '';
        
        // Add insights panel
        const insightsPanel = document.createElement('div');
        insightsPanel.className = 'insights-panel mb-4 p-4 bg-theme-green-800 rounded-lg';
        insightsPanel.innerHTML = `
            <h3 class="text-lg font-bold mb-2 text-theme-green-100">Data Insights</h3>
            <p class="text-theme-green-200 mb-2">${this.currentData.summary}</p>
            <pre class="text-sm text-theme-green-300 whitespace-pre-wrap">${this.currentData.insights}</pre>
        `;
        this.visualizationArea.appendChild(insightsPanel);

        const chartType = this.chartType.value;
        if (chartType === 'pie') {
            this.createPieChart();
        } else {
            this.createBarChart();
        }
    }

    createPieChart() {
        const container = document.createElement('div');
        container.className = 'pie-chart-container';

        const total = this.currentData.values.reduce((a, b) => a + b, 0);
        let currentAngle = 0;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.style.transform = 'rotate(-90deg)'; // Start from top

        const colors = ['#22c55e', '#16a34a', '#15803d'];
        const legendContainer = document.createElement('div');
        legendContainer.className = 'legend-container';

        this.currentData.values.forEach((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            
            const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const [startX, startY] = this.getCoordinatesForAngle(currentAngle);
            const [endX, endY] = this.getCoordinatesForAngle(currentAngle + angle);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const d = `
                M 50 50
                L ${startX} ${startY}
                A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}
                Z
            `;
            
            slice.setAttribute('d', d);
            slice.setAttribute('fill', colors[index % colors.length]);
            svg.appendChild(slice);

            // Add legend item
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-color" style="background-color: ${colors[index % colors.length]}"></span>
                <span class="legend-label">${this.currentData.labels[index]}: ${value.toLocaleString()}${value < 100 ? '%' : ''}</span>
            `;
            legendContainer.appendChild(legendItem);

            currentAngle += angle;
        });

        container.appendChild(svg);
        container.appendChild(legendContainer);
        this.visualizationArea.appendChild(container);

        // Animate slices
        const paths = svg.querySelectorAll('path');
        paths.forEach((path, index) => {
            gsap.from(path, {
                scale: 0,
                opacity: 0,
                transformOrigin: '50% 50%',
                duration: 0.5,
                delay: index * 0.2
            });
        });
    }

    getCoordinatesForAngle(angle) {
        const radians = (angle * Math.PI) / 180;
        const x = 50 + 50 * Math.cos(radians);
        const y = 50 + 50 * Math.sin(radians);
        return [x, y];
    }

    createBarChart() {
        const container = document.createElement('div');
        container.className = 'chart-container';

        const maxValue = Math.max(...this.currentData.values);
        
        this.currentData.values.forEach((value, index) => {
            const chartColumn = document.createElement('div');
            chartColumn.className = 'chart-column';

            const bar = document.createElement('div');
            const height = (value / maxValue) * 80;
            
            bar.className = 'chart-bar';
            bar.style.cssText = `
                height: 0px;
                background-color: ${index % 2 === 0 ? '#60a5fa' : '#4ade80'};
            `;

            const valueLabel = document.createElement('div');
            valueLabel.className = 'chart-value';
            valueLabel.textContent = value.toLocaleString() + (value < 100 ? '%' : '');
            bar.appendChild(valueLabel);

            const label = document.createElement('div');
            label.className = 'chart-label mt-2 text-slate-400';
            label.textContent = this.currentData.labels[index];
            
            chartColumn.appendChild(bar);
            chartColumn.appendChild(label);
            container.appendChild(chartColumn);

            requestAnimationFrame(() => {
                gsap.to(bar, {
                    height: `${height}%`,
                    duration: 1,
                    ease: "power2.out",
                    delay: index * 0.2
                });
            });
        });

        this.visualizationArea.appendChild(container);
    }

    replayAnimation() {
        if (this.currentData) {
            this.createVisualization();
        }
    }

    exportVisualization() {
        alert('Export functionality will be implemented in future versions');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new StorySight();
});

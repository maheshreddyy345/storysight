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
        this.initialize();
    }

    initialize() {
        this.visualizeBtn.addEventListener('click', () => this.processText());
        this.replayBtn.addEventListener('click', () => this.replayAnimation());
        this.exportBtn.addEventListener('click', () => this.exportVisualization());
    }

    processText() {
        const text = this.textInput.value;
        if (!text) return;

        const numbers = [];
        const labels = [];
        
        // Define patterns to match
        const patterns = [
            { regex: /\$(\d+(?:\.\d+)?[KMB]?)/g, label: 'Sales' },
            { regex: /(\d+(?:\.\d+)?)%/g, label: 'Percentage' }
        ];

        // Extract numbers and create meaningful labels
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(text)) !== null) {
                let value = match[1];
                // Convert K, M, B to actual numbers
                if (value.endsWith('K')) {
                    value = parseFloat(value.slice(0, -1)) * 1000;
                } else if (value.endsWith('M')) {
                    value = parseFloat(value.slice(0, -1)) * 1000000;
                } else if (value.endsWith('B')) {
                    value = parseFloat(value.slice(0, -1)) * 1000000000;
                } else {
                    value = parseFloat(value);
                }
                numbers.push(value);
                
                // Create meaningful label based on context
                let label = '';
                if (text.toLowerCase().includes('sales') && pattern.label === 'Sales') {
                    label = 'Q3 Sales';
                } else if (text.toLowerCase().includes('quantum')) {
                    label = 'Quantum Series';
                } else if (text.toLowerCase().includes('traffic')) {
                    label = 'Traffic Growth';
                } else {
                    label = pattern.label;
                }
                labels.push(label);
            }
        });

        if (numbers.length === 0) {
            alert('No numbers found in the text. Please include some numerical data.');
            return;
        }

        this.currentData = {
            values: numbers,
            labels: labels
        };

        this.createVisualization();
    }

    createVisualization() {
        this.visualizationArea.innerHTML = '';
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

        const colors = ['#60a5fa', '#4ade80', '#f472b6'];
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

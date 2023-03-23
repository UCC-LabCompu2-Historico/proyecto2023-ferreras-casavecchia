import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import './App.css';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [executionTimes, setExecutionTimes] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    draw(executionTimes);
  }, [executionTimes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const executeCode = () => {
    const startTime = performance.now();

    try {
      // eslint-disable-next-line
      const result = eval(code);
      console.log(result);
    } catch (error) {
      console.error(error);
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    setExecutionTimes((prevExecutionTimes) => [...prevExecutionTimes, executionTime]);
  };

  const draw = (executionTimes: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const barWidth = 5;
    const xOffset = 60;
    const yOffset = 30;
    const maxBarHeight = canvas.height - yOffset * 2;
    const xAxisLength = canvas.width - xOffset * 2;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw the axes
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(xOffset, canvas.height - yOffset);
    ctx.lineTo(canvas.width - xOffset, canvas.height - yOffset);
    ctx.stroke();
  
    // Draw the units
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Runs', canvas.width / 2, canvas.height - yOffset / 2);
    ctx.textAlign = 'right';
    ctx.fillText('Time (ms)', xOffset * 1, yOffset / 2);
  
    // Draw unit partitions with concrete values on Y-axis
    const yAxisLabels = [
      { value: 100, label: '100ms' },
      { value: 500, label: '500ms' },
      { value: 1000, label: '1s' },
      { value: 2000, label: '2s' },
      { value: 5000, label: '5s' },
      { value: 10000, label: '10s' },
      { value: 30000, label: '30s' },
      { value: 60000, label: '1min' },
    ];
  
    yAxisLabels.forEach((label) => {
      const yPosition = canvas.height - yOffset - (label.value / 1000) * maxBarHeight;
      ctx.beginPath();
      ctx.moveTo(xOffset - 5, yPosition);
      ctx.lineTo(xOffset + 5, yPosition);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(label.label, xOffset - 10, yPosition + 5);
    });
  
    // Reset the graph if the maximum width is reached
    if (executionTimes.length * (barWidth + 10) > xAxisLength) {
      setExecutionTimes([]);
      return;
    }
  
    executionTimes.forEach((executionTime, index) => {
      const barHeight = (executionTime / 1000) * maxBarHeight;
      const barX = xOffset + index * (barWidth + 10);
    
      ctx.fillStyle = 'rgba(75, 192, 192, 0.2)';
      ctx.fillRect(barX, canvas.height - yOffset - barHeight, barWidth, barHeight);
    
      const animationTarget = { height: 0 };
    
      gsap.fromTo(
        animationTarget,
        { height: 0 },
        {
          height: barHeight,
          onUpdate: function () {
            ctx.clearRect(barX, canvas.height - yOffset - barHeight, barWidth, barHeight);
            ctx.fillStyle = 'rgba(75, 192, 192, 1)';
            ctx.fillRect(barX, canvas.height - yOffset - animationTarget.height, barWidth, animationTarget.height);
          },
          duration: 0.5,
        }
      );
    });
  };

  return (
    <div className="App">
      <h1>Code Execution Timer</h1>
      <textarea value={code} onChange={handleChange} rows={10} cols={50} />
      <br />
      <button onClick={executeCode}>Run Code</button>
      <canvas ref={canvasRef} width="600" height="400" />
    </div>
  );
};

export default App;

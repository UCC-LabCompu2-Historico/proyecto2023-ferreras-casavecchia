import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import { gsap } from 'gsap';

import './App.css';
import './Normalize.css';

// @ts-ignore
import offButton from './assets/img/offButton.svg';
// @ts-ignore
import codeIcon from './assets/img/codeIcon.svg';
// @ts-ignore
import runButton from './assets/img/runButton.svg';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [executionTimes, setExecutionTimes] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snippetMap, setSnippetMap] = useState<Map<number, string>>(new Map());

  const barWidth = 12;
  const xOffset = 60;
  const yOffset = 10;

  const getMaxBarHeight = () => {
    if (!canvasRef.current) return 0;
    return canvasRef.current.height - yOffset * 2;
  };

  const handleClick = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    for (let i = 0; i < executionTimes.length; i++) {
      const barHeight = (executionTimes[i] / 1000) * getMaxBarHeight();
      const barX = xOffset - 2 + (i + 1) * ((canvas.width - xOffset * 2 - barWidth) / 10);
      const barY = canvas.height - yOffset - barHeight + 1;
  
      if (
        x >= barX &&
        x <= barX + barWidth &&
        y >= barY &&
        y <= canvas.height - yOffset
      ) {
        const snippet = snippetMap.get(i);
        setCode(snippet || '');
        break;
      }
    }
  };

  useEffect(() => {
    draw(executionTimes);
  }, [executionTimes]);

  useEffect(() => {
    if (!canvasRef.current) return;
  
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
    
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
    
      let foundBar = false;
      for (let i = 0; i < executionTimes.length; i++) {
        const barHeight = (executionTimes[i] / 1000) * getMaxBarHeight();
        const barX = xOffset - 2 + (i + 1) * ((canvas.width - xOffset * 2 - barWidth) / 10);
        const barY = canvas.height - yOffset - barHeight + 1;
    
        if (
          x >= barX &&
          x <= barX + barWidth &&
          y >= barY &&
          y <= canvas.height - yOffset
        ) {
          foundBar = true;
          break;
        }
      }
    
      canvas.style.cursor = foundBar ? 'pointer' : 'default';
    };
  
    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    canvasRef.current.addEventListener("click", handleClick); // Add click event listener
  
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
        canvasRef.current.removeEventListener("click", handleClick); // Remove click event listener
      }
    };
  }, [canvasRef, snippetMap]);

  useEffect(() => {
    if (!canvasRef.current) return;
  
    const handleResize = _.debounce(() => {
      resizeCanvas(canvasRef.current);
    }, 250);

    resizeCanvas(canvasRef.current);
  
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const resizeCanvas = (canvas: any) => {
    const container = document.querySelector('.App-body-right') as HTMLElement;
    if (!container) return;
    
    const containerStyle = getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);
  
    canvas.width = container.offsetWidth - paddingLeft - paddingRight;
    canvas.height = container.offsetHeight - paddingTop - paddingBottom - 129;

    draw(executionTimes); 
  }

  const executeCode = () => {
    const startTime = performance.now();

    try {
      // eslint-disable-next-line
      eval(code);
    } catch (error) {
      console.error(error);
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    if (executionTimes.length >= 10) {
      setExecutionTimes([]);
    }

    setExecutionTimes((prevExecutionTimes) => [...prevExecutionTimes, executionTime]);
    setSnippetMap((prevSnippetMap) => {
      const newSnippetMap = new Map(prevSnippetMap);
      newSnippetMap.set(executionTimes.length, code);
      return newSnippetMap;
    });
  };

  const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.fillRect(x, y, width, height);
  };

  const draw = (executionTimes: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const maxBarHeight = getMaxBarHeight();
    const xAxisLength = canvas.width - xOffset * 2;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw the units
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#252525';
  
    // Draw unit partitions with concrete values on Y-axis
    const yAxisLabels = [
      { value: 0, label: '0' },
      { value: 100, label: '100ms' },
      { value: 200, label: '200ms' },
      { value: 300, label: '300ms' },
      { value: 400, label: '400ms' },
      { value: 500, label: '500ms' },
      { value: 600, label: '600ms' },
      { value: 700, label: '700ms' },
      { value: 800, label: '800ms' },
      { value: 900, label: '900ms' },
      { value: 1000, label: '+1s' },
    ];
  
    yAxisLabels.forEach((label) => {
      const yPosition = canvas.height - yOffset - (label.value / 1000) * maxBarHeight;
      ctx.textAlign = 'right';
      ctx.fillText(label.label, xOffset - 10, yPosition);
  
      // Draw horizontal gridlines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(37, 37, 37, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(xOffset, yPosition - 5);
      ctx.lineTo(canvas.width + 10, yPosition - 5);
      ctx.stroke();
    });
  
    // Adjust x position of the bars according to their # identifier
    for (let i = 0; i < 10; i++) {
      const xLabelSpacing = (xAxisLength - barWidth) / 10;
      const xLabelXPosition = xOffset + ((i + 1) * xLabelSpacing) + (barWidth / 2);
      ctx.fillStyle = '#252525';
      ctx.fillText(`${i + 1}`, xLabelXPosition, canvas.height - yOffset  + 10);
    }
  
    executionTimes.forEach((executionTime, index) => {
      const barHeight = (executionTime / 1000) * maxBarHeight;
      const barX = xOffset - 2 + (index + 1) * ((xAxisLength - barWidth) / 10);
    
      ctx.fillStyle = '#2F3133';
      roundedRect(ctx, barX, canvas.height - yOffset - barHeight + 1, 12, barHeight - 1, 40);
    
      // Set the styles for the bars
      ctx.lineJoin = 'round';
      ctx.lineWidth = barWidth;
  
      const animationTarget = { height: 0 };
  
      gsap.fromTo(
        animationTarget,
        { height: 0 },
        {
          height: barHeight,
          onUpdate: function () {
            ctx.clearRect(barX, canvas.height - yOffset - barHeight, barWidth, barHeight);
            ctx.fillStyle = '#2F3133';
            roundedRect(ctx, barX, canvas.height - yOffset - animationTarget.height - 5 + 1, barWidth, animationTarget.height - 1, 40);
          },
          duration: 0.5,
        });
      });
    };

  return (
    <div className="App">

      <header className="App-header">

        <div className="App-title">
          <h1 className='title'>Performance Playground <span className="underlined"></span></h1>
        </div>

        <div className="App-nav-buttons">

          <div className="nav-button nav-button-active">
            <p className='nav-button-text nav-button-text-active'>Code Visualizer<span className="center-underlined"></span></p>
          </div>

          <div className="nav-button">
            <p className='nav-button-text'>Sorting Visualizer</p>
          </div>

          <div className="nav-button">
            <p className='nav-button-text-innactive'>Pathfinder Visualizer</p>
          </div>

        </div>

        <div className="App-off-button">
          <img src={offButton} alt="Off" />
        </div>

      </header>

      <div className="App-body">

        <div className="App-body-left">
          <div className="left-title">
            <div className="left-icon">
              <img src={codeIcon} alt="Code" />
            </div>

            <p className='left-title-text'>Code Input<span className="underlined"></span></p>
          </div>

          <textarea className='left-code-input' value={code} onChange={handleChange} rows={10} cols={50} />
          <button className='run-button' onClick={executeCode}><img src={runButton} alt="Run" /></button>

        </div>
        
        <div className="App-body-right">
          <div className="right-title">
            <p className='right-title-left'>Execution Time</p>
            <p className='right-title-right'>Execution #</p>
          </div>
          <canvas ref={canvasRef} width="600" height="400" />
        </div>

      </div>
    </div>
  );
};

export default App;

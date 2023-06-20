import React, { useRef, useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import _ from 'lodash';
import { gsap } from 'gsap';

import './App.css';
import './Normalize.css';

// @ts-ignore
import codeIcon from './assets/img/codeIcon.svg';
// @ts-ignore
import runButton from './assets/img/runButton.svg';
// @ts-ignore
import hand from './assets/img/hand.svg';

import { ALGORITHMS } from './data/algorithms';
import { contentAnimation, fadeIn, fadeInAndYAnimation } from './animations/commonAnimations';
import { InitialTransition } from './components/InitialTransition';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [executionTimes, setExecutionTimes] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const algosCanvasRef = useRef<HTMLCanvasElement>(null);
  const [snippetMap, setSnippetMap] = useState<Map<number, string>>(new Map());
  const [matchesMedia, setMatchesMedia] = useState(window.matchMedia("(min-width: 1200px) and (min-height: 740px)").matches)

  const [selectedMenu, setSelectedMenu] = useState<number>(0);
  const [selectedAlgo, setSelectedAlgo] = useState<number>(0);

  const [randomArray, setRandomArray] = useState<number[]>([]);
  const [runningAlgorithm, setRunningAlgorithm] = useState<boolean>(false);

  const barWidth = 12;
  const xOffset = 60;
  const yOffset = 10;

  useEffect(() => {
    randomArrayGenerator();
  }, [selectedAlgo]);

  useEffect(() => {
    window
    .matchMedia("(min-width: 1200px) and (min-height: 740px)")
    .addEventListener('change', e => setMatchesMedia( e.matches ));
  }, []);

  useEffect(() => {
    draw(executionTimes);
  }, [executionTimes, selectedMenu]);

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
    canvasRef.current.addEventListener("click", handleClick);
  
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
        canvasRef.current.removeEventListener("click", handleClick);
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
  }, [selectedMenu]);

  useEffect(() => {
    if (!algosCanvasRef.current) return;

    const handleResize = _.debounce(() => {
      resizeCanvas(algosCanvasRef.current);
    }, 250);

    resizeCanvas(algosCanvasRef.current);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedMenu]);

  useEffect(() => {
    randomArrayGenerator();
  }, [selectedMenu]);

/**
  * Gets the maximum height of a chart bar based on the canvas height.
  * @method getMaxBarHeight
  */
  const getMaxBarHeight = () => {
    if (canvasRef.current) return canvasRef.current.height - yOffset * 2;
    if(algosCanvasRef.current) return algosCanvasRef.current.height - yOffset * 2;
    return 0;
  };

/**
  * Creates a random array for the algos sorting menu.
  * @method randomArrayGenerator
  */
  const randomArrayGenerator = () => {
    const arr = [];
    for (let i = 0; i < 25; i++) {
      arr.push(Math.floor(Math.random() * 100 + 5));
    }
    setRandomArray(arr);
    drawAlgos(-1, -1, arr);
  }

/**
  * Handles click events on the canvas to display the code snippet of a specific execution time bar.
  * @method handleClick
  * @param {MouseEvent} e - The MouseEvent object representing the click event.
  */
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

/**
  * Handles the change event for the textarea, updating the code state.
  * @method handleChange
  * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event of the textarea.
  */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

/** 
  * Resizes the canvas based on the dimensions of its container.
  * @method resizeCanvas
  * @param {any} canvas - The canvas element to resize.
  */
  const resizeCanvas = async (canvas: any) => {
    const container = document.querySelector('.App-body-right') as HTMLElement;
    if (!container) return;
    
    const containerStyle = getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);
  
    canvas.width = container.offsetWidth - paddingLeft - paddingRight;
    canvas.height = container.offsetHeight - paddingTop - paddingBottom - 129;

    if(canvas === canvasRef.current) draw(executionTimes); 
    if(canvas === algosCanvasRef.current) await drawAlgos();
  }

/**
  * Draws the algorithm bars on the canvas.
  * @method drawAlgos
  * @param {number} [selectedBar=-1] - The index of the currently selected bar. Default is -1.
  * @param {number} [pivotIndex=-1] - The index of the pivot element. Default is -1.
  * @param {number[]} [arr=randomArray] - The array used to generate the bars. Default is randomArray.
  */
  async function drawAlgos(selectedBar = -1, pivotIndex = -1, arr = randomArray) {
    const canvas = algosCanvasRef.current;
    if (!canvas) return;
  
    const ctx = await canvas.getContext("2d");
    if (!ctx) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const barWidth = 12;
    const totalBars = arr.length;
    const chartWidth = canvas.width;
    const padding = (chartWidth - totalBars * barWidth) / (totalBars + 1);
  
    const minHeight = 0;
    const maxHeight = 105;
  
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      const x = i * barWidth + (i + 1) * padding;
      const barHeight = ((value - minHeight) / (maxHeight - minHeight)) * canvas.height;
  
      const y = canvas.height - barHeight;
  
      if (i === selectedBar) {
        ctx.fillStyle = "#74FA50";
      } else if (i === pivotIndex) {
        ctx.fillStyle = "#FF5733";
      } else {
        ctx.fillStyle = "#2F3133";
      }
  
      ctx.fillRect(x, y, 12, barHeight);
    }
  }

/**
  * Executes the user's custom code or the selected sorting algorithm.
  * @method handleRun
  */
  const handleRun = () => {
    if(runningAlgorithm) return;
    if (selectedMenu === 0) executeCode();
    if (selectedMenu === 1) executeAlgo();
  }

/**
  * Executes the selected sorting algorithm on a copy of the random array.
  * @method executeAlgo
  */
  const executeAlgo = async () => {
    let arrayCopy = [...randomArray];
    const algorithms = [mergeSort, quickSort, heapSort, bubbleSort];

    setRunningAlgorithm(true);
  
    if (selectedAlgo >= 0 && selectedAlgo < algorithms.length) {
      await algorithms[selectedAlgo](arrayCopy);
    }

    setRunningAlgorithm(false);
  };

/**
  * Sorts the given array using the QuickSort algorithm.
  * @param {Array} arr - The array to sort.
  * @param {number} start - The starting index (default is 0).
  * @param {number} end - The ending index (default is arr.length - 1).
  */
  async function quickSort(arr: any, start = 0, end = arr.length - 1) {
    if (start >= end) {
      return;
    }
  
    const pivotIndex = await partition(arr, start, end);
  
    await quickSort(arr, start, pivotIndex - 1);
    await quickSort(arr, pivotIndex + 1, end);

    await drawAlgos(-1, -1, arr);
  }
  
/**
  * Partitions the given array for the QuickSort algorithm.
  * @param {Array} arr - The array to partition.
  * @param {number} start - The starting index.
  * @param {number} end - The ending index.
  * @returns {Promise<number>} - The pivot index.
  */
  async function partition(arr: any, start: any, end: any) {
    const pivotIndex = Math.floor(Math.random() * (end - start + 1)) + start;
    const pivot = arr[pivotIndex];
    await swap(arr, pivotIndex, end);
  
    let i = start;
    for (let j = start; j < end; j++) {
      if (arr[j] <= pivot) {
        await swap(arr, i, j, j);
        i++;
      }
    }
    await swap(arr, i, end);
  
    return i;
  }

/**
  * Sorts the given array using the MergeSort algorithm.
  * @param {Array} arr - The array to sort.
  * @param {number} start - The starting index (default is 0).
  * @param {number} end - The ending index (default is arr.length - 1).
  */
  async function mergeSort(arr: any, start = 0, end = arr.length - 1) {
    if (start >= end) {
        return;
    }

    const mid = Math.floor((start + end) / 2);
    await mergeSort(arr, start, mid);
    await mergeSort(arr, mid + 1, end);

    await merge(arr, start, mid, end);

    await drawAlgos(-1, -1, arr);
  }

/**
  * Merges two sorted subarrays for the MergeSort algorithm.
  * @param {Array} arr - The array containing the subarrays to merge.
  * @param {number} start - The starting index.
  * @param {number} mid - The middle index.
  * @param {number} end - The ending index.
  */
  async function merge(arr: any, start: any, mid: any, end: any) {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);

    let i = start;
    let j = 0;
    let k = 0;

    while (j < left.length && k < right.length) {
        if (left[j] <= right[k]) {
            arr[i] = left[j];
            j++;
        } else {
            arr[i] = right[k];
            k++;
        }
        setRandomArray([...arr]);
        await drawAlgos(i, -1, arr);
        await sleep(50);
        i++;
    }

    while (j < left.length) {
        arr[i] = left[j];
        setRandomArray([...arr]);
        await drawAlgos(j, -1, arr);
        await sleep(50);
        i++;
        j++;
    }

    while (k < right.length) {
        arr[i] = right[k];
        setRandomArray([...arr]);
        await drawAlgos(k, -1, arr);
        await sleep(50);
        i++;
        k++;
    }
  }

/**
  * Swaps two elements in the given array.
  * @param {Array} arr - The array containing the elements to swap.
  * @param {number} i - The index of the first element.
  * @param {number} j - The index of the second element.
  * @param {number} pivotIndex - The pivot index for the QuickSort algorithm (default is -1).
  */
  async function swap(arr: any, i: any, j: any, pivotIndex = -1) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setRandomArray([...arr]);
    await drawAlgos(j, pivotIndex, arr);
    await sleep(50);
  }

/**
  * Sorts the given array using the HeapSort algorithm.
  */
  async function heapSort() {
    let size = randomArray.length;

    for (let i = Math.floor(size / 2 - 1); i >= 0; i--) {
        await heapify(size, i);
    }

    for (let i = size - 1; i >= 0; i--) {
        const temp = randomArray;
        [temp[0], temp[i]] = [temp[i], temp[0]];
        setRandomArray(temp);
        await drawAlgos(i);
        await sleep(50);

        await heapify(i, 0);
    }

    await drawAlgos();
  }

/**
  * Performs heapify operation for the HeapSort algorithm.
  * @param {number} size - The size of the array.
  * @param {number} i - The index of the element to heapify.
  */
  async function heapify(size: any, i: any) {
    return new Promise(async (resolve) => {
        let max = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size && randomArray[left] > randomArray[max]) {
            max = left;
        }

        if (right < size && randomArray[right] > randomArray[max]) {
            max = right;
        }

        if (max !== i) {
            const temp = randomArray;
            [temp[i], temp[max]] = [temp[max], temp[i]];
            setRandomArray(temp);
            await drawAlgos(max);
            await sleep(50);

            await heapify(size, max);
        }

        // @ts-ignore
        resolve();
    });
  }

/**
  * Sorts the given array using the BubbleSort algorithm.
  */
  async function bubbleSort() {
      const n = randomArray.length;

      for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - 1 - i; j++) {
              if (randomArray[j] > randomArray[j + 1]) {
                  const temp = randomArray;
                  [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
                  setRandomArray(temp);
                  await drawAlgos(j + 1);
                  await sleep(50);
              }
          }
      }

      await drawAlgos();
  }

/**
  * Sleeps for a specified duration.
  * @method sleep
  * @param {number} ms - The number of milliseconds to sleep.
  * @return {Promise} - A promise that resolves after the specified duration.
  */
  const sleep = async (ms: any) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  
/**
  * Executes the custom code and records its execution time.
  * @method executeCode
  */
  const executeCode = () => {
    if (!code) {
      alert('Please enter some code!');
      return;
    }

    const startTime = performance.now();

    try {
      // eslint-disable-next-line
      eval(code);
    } catch (error) {
      alert("There was an Error: " + error);
      return;
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

/**
  * Draws a rounded rectangle on the canvas.
  * @method roundedRect
  * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
  * @param {number} x - The x-coordinate of the rectangle's starting point.
  * @param {number} y - The y-coordinate of the rectangle's starting point.
  * @param {number} width - The width of the rectangle.
  * @param {number} height - The height of the rectangle.
  * @param {number} radius - The radius of the rectangle's rounded corners.
  */
  const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.fillRect(x, y, width, height);
  };

/**
  * Draws the execution times chart on the canvas.
  * @method draw
  * @param {number[]} executionTimes - An array of execution times to draw.
  */
  const draw = (executionTimes: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const maxBarHeight = getMaxBarHeight();
    const xAxisLength = canvas.width - xOffset * 2;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#252525';
  
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
  
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(37, 37, 37, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(xOffset, yPosition - 5);
      ctx.lineTo(canvas.width + 10, yPosition - 5);
      ctx.stroke();
    });
  
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
      <InitialTransition />

      <AnimatePresence mode='wait'>
        {
          matchesMedia? (
            <>

              <m.header variants={fadeInAndYAnimation(0, 0.2)} initial="hidden" animate="show" exit="exit" id='App-header'>

                <m.main className="App-title" variants={fadeInAndYAnimation(.2, 0.2)} initial="hidden" animate="show" exit="exit">
                  <h1 className='title'>Performance Playground <span className="underlined"></span></h1>
                </m.main>

                <m.nav variants={fadeIn(0.2, 0.2)} initial="hidden" animate="show" exit="exit" className="App-nav-buttons">
                  <div className="nav-button" onClick={() => {if (!runningAlgorithm) setSelectedMenu(0)}}>
                    <AnimatePresence mode='wait'>
                    {
                      selectedMenu === 0 && (
                        <>
                          <m.div variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit" className="left-corner">
                            <div className="inner-corner inner-corner-left"></div>
                          </m.div>

                          <m.div variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit" className="right-corner">
                            <div className="inner-corner inner-corner-right"></div>
                          </m.div>

                          <m.div variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit" className="inner-color"></m.div>
                        </>
                      )
                    }
                    </AnimatePresence>

                    <p className={selectedMenu === 0? 'nav-button-text nav-button-text-active' : 'nav-button-text'}>Code Visualizer{selectedMenu === 0 && (<span className="center-underlined"></span>)}</p>
                  </div>

                  <div className="nav-button" onClick={() => setSelectedMenu(1)}>
                    <AnimatePresence mode='wait'>
                    {
                      selectedMenu === 1 && (
                        <>
                          <m.div variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit" className="left-corner">
                            <div className="inner-corner inner-corner-left"></div>
                          </m.div>

                          <m.div variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit" className="right-corner">
                            <div className="inner-corner inner-corner-right"></div>
                          </m.div>

                          <m.div variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit" className="inner-color"></m.div>
                        </>
                      )
                    }
                    </AnimatePresence>
                    
                    <p className={selectedMenu === 1? 'nav-button-text nav-button-text-active' : 'nav-button-text'}>Sorting Visualizer{selectedMenu === 1 && (<span className="center-underlined"></span>)}</p>
                  </div>

                  <div className="nav-button">
                    <p className='nav-button-text-innactive'>Pathfinder Visualizer</p>
                  </div>

                </m.nav>

                <div className="App-off-button">
                </div>

              </m.header>

              <m.div variants={fadeInAndYAnimation(0, 0.2)} initial="hidden" animate="show" exit="exit" className="App-body">

                <m.section variants={contentAnimation(0.6)} initial="hidden" animate="show" exit="exit" className="App-body-left">
                  <m.div className="left-title" variants={fadeInAndYAnimation(1, 0.2)} initial="hidden" animate="show" exit="exit">
                    <m.div className="left-icon">
                      <img src={codeIcon} alt="Code" />
                    </m.div>

                    <AnimatePresence mode='wait'>
                      {
                        selectedMenu === 0? <m.label htmlFor='code-input' key={0} variants={fadeInAndYAnimation(0, 0.2)} initial="hidden" animate="show" exit="exit" className='left-title-text'>Code Input<span className="underlined"></span></m.label> :
                        selectedMenu === 1 && <m.p key={1}  variants={fadeInAndYAnimation(0, 0.2)} initial="hidden" animate="show" exit="exit" className='left-title-text'>Sorting Algorithm<span className="underlined"></span></m.p>
                      }
                    </AnimatePresence>
                  </m.div>
                    <AnimatePresence mode='wait'>
                    {
                      selectedMenu === 0? <m.textarea id='code-input' key={0} variants={fadeIn(0.2, 0.2)} initial="hidden" animate="show" exit="exit" className='left-code-input' value={code} onChange={handleChange} rows={10} cols={50} /> :
                      selectedMenu === 1 && (
                        <div className="left-options">
                          <m.div key={1} className="left-options-algorithms" variants={fadeIn(0.4, 0.2)} initial="hidden" animate="show" exit="exit">
                            <p className={selectedAlgo === 0? 'selected-algo' : ''} onClick={() => {if (!runningAlgorithm) setSelectedAlgo(0)}}>Merge Sort</p>
                            <p className={selectedAlgo === 1? 'selected-algo' : ''} onClick={() => {if (!runningAlgorithm) setSelectedAlgo(1)}}>Quick Sort</p>
                            <p className={selectedAlgo === 2? 'selected-algo' : ''} onClick={() => {if (!runningAlgorithm) setSelectedAlgo(2)}}>Heap Sort</p>
                            <p className={selectedAlgo === 3? 'selected-algo' : ''} onClick={() => {if (!runningAlgorithm) setSelectedAlgo(3)}}>Bubble Sort</p>

                            <div className="vertical-separator"></div>
                            <div className="horizontal-separator"></div>
                          </m.div>

                          <m.textarea key={2} variants={fadeIn(0.6, 0.2)} initial="hidden" animate="show" exit="exit" className='left-code-input algorithm-input' value={selectedAlgo === 0? ALGORITHMS.mergeSort.code : selectedAlgo === 1? ALGORITHMS.quickSort.code : selectedAlgo === 2? ALGORITHMS.heapSort.code : selectedAlgo === 3? ALGORITHMS.bubbleSort.code : ''} onChange={handleChange} rows={10} cols={50} readOnly />
                        </div>
                      )
                    }
                    </AnimatePresence>
                  
                  <m.button className='run-button' onClick={handleRun} variants={fadeInAndYAnimation(0.8, 0.2)} initial="hidden" animate="show" exit="exit"><img src={runButton} alt="Run" /></m.button>

                </m.section>
                
                <m.section className="App-body-right" variants={contentAnimation(0.8)} initial="hidden" animate="show" exit="exit">
                  <AnimatePresence mode='wait'>
                    {
                      selectedMenu === 0? (
                        <div key={0} className="right-title">
                          <m.p variants={fadeIn(0.6, 0.2)} initial="hidden" animate="show" exit="exit" className='right-title-left'>Execution Time</m.p>
                          <m.p variants={fadeIn(0.6, 0.2)} initial="hidden" animate="show" exit="exit" className='right-title-right'>Execution #</m.p>
                        </div>
                      ) :
                      selectedMenu === 1 && (
                        <div key={1} className="right-title">
                          <m.p variants={fadeIn(0.8, 0.2)} initial="hidden" animate="show" exit="exit" className='right-title-left'>Execution Visualizer</m.p>
                          <m.p variants={fadeIn(0.8, 0.2)} initial="hidden" animate="show" exit="exit" className='right-title-right refresh-button' onClick={() => {if (!runningAlgorithm) randomArrayGenerator()}}>Refresh</m.p>
                        </div>
                      )
                    }
                  </AnimatePresence>

                  {
                    selectedMenu === 0? <m.canvas key={0} variants={fadeIn(1.4, 0.2)} initial="hidden" animate="show" exit="exit" ref={canvasRef} width="600" height="400" /> :
                    selectedMenu === 1 && <m.canvas key={1} variants={fadeIn(1.6, 0.2)} initial="hidden" animate="show" exit="exit" className='algos-canvas' ref={algosCanvasRef} width="600" height="400" />
                  }
                  
                </m.section>

              </m.div>
            </>
          ) : (
            <>
              <m.header variants={fadeInAndYAnimation(0, 0.2)} initial="hidden" animate="show" exit="exit" className="App-header App-header-min">

                <m.div className="App-title" variants={fadeInAndYAnimation(0.2, 0.2)} initial="hidden" animate="show" exit="exit" >
                  <m.h1 className='title'>Performance Playground <span className="underlined"></span></m.h1>
                </m.div>

              </m.header>

              <m.main variants={fadeInAndYAnimation(0.2, 0.2)} initial="hidden" animate="show" exit="exit" className="App-body-min">
                <m.div variants={fadeInAndYAnimation(0.3, 0.2)} initial="hidden" animate="show" className="warning-min">
                  <m.div variants={fadeInAndYAnimation(0.4, 0.2)} initial="hidden" animate="show" className="handIcon">
                    <img src={hand} alt="Hand" />
                  </m.div>

                  <m.p variants={fadeInAndYAnimation(0.5, 0.2)} initial="hidden" animate="show" className='warning-min-text hi-there'>Hi, there!</m.p>

                  <m.p variants={fadeInAndYAnimation(0.6, 0.2)} initial="hidden" animate="show" className='warning-min-text'>This app is only available<br></br>for Desktop at this moment.</m.p>
                </m.div>

                <m.p variants={fadeInAndYAnimation(0.7, 0.2)} initial="hidden" animate="show" className='go-to'>Go to our <span className='link'>website</span> on your computer<br></br>to use the app.</m.p>
              </m.main>
            </>
          )
        }
      </AnimatePresence>
    </div>
  );
};

export default App;

export const ALGORITHMS = {
    // write an example algorithm for every type.
    'mergeSort': {
        'name': 'Merge Sort',
        'description': 'Merge Sort is a Divide and Conquer algorithm. It divides input array in two halves, calls itself for the two halves and then merges the two sorted halves.',
        'code': 
`function mergeSort(arr) {
    if (arr.length === 1) {
        return arr;

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return merge(mergeSort(left), mergeSort(right));

    function merge(left, right) {
        const results = [];
        while (left.length && right.length) {
            if (left[0] < right[0]) {
                results.push(left.shift());
            } else {
                results.push(right.shift());
            }
        }
        return [...results, ...left, ...right];
    }
}` 
    },
    'quickSort': {
        'code': 
`function quickSort(arr, left = 0, right = arr.length - 1) {
    if (left < right) {
        const pivotIndex = partition(arr, left, right);
        quickSort(arr, left, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, right);
    }
    return arr;
}
          
function partition(arr, left, right) {
    const pivot = arr[right];
    let i = left - 1;
    
    for (let j = left; j <= right - 1; j++) {
        if (arr[j] < pivot) {
        i++;
        swap(arr, i, j);
        }
    }
    swap(arr, i + 1, right);
    return i + 1;
}
          
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}`
    },
    'bubbleSort': {
        'code': 
`function bubbleSort(arr) {
    let swapped;
    do {
      swapped = false;
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
          swap(arr, i, i + 1);
          swapped = true;
        }
      }
    } while (swapped);
  
    return arr;
}
  
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}`
    },
    'heapSort': {
        'code': 
`function heapSort(arr) {
    let n = arr.length;
  
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(arr, n, i);
    }
  
    for (let i = n - 1; i > 0; i--) {
      swap(arr, 0, i);
      n--;
  
      // Heapify the root element
      heapify(arr, n, 0);
    }
  
    return arr;
}
  
function heapify(arr, n, i) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
  
    if (left < n && arr[left] > arr[largest]) {
      largest = left;
    }
  
    if (right < n && arr[right] > arr[largest]) {
      largest = right;
    }
  
    if (largest !== i) {
      swap(arr, i, largest);
      heapify(arr, n, largest);
    }
}
  
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}`
    },
}
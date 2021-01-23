
//#region Variables

var canvas;

var h = (window.innerHeight != null) ? window.innerHeight : 300;

var w = document.getElementById("sketch-holder").clientWidth;

var barHeightArray;

var barAmount = 20; // 20

var maxNum = 100; // 100

var colorChoice = 1; // 1

var isRunning = false; // false

var speed = 500; // 500

var speedText = "1x"; // "1x"

//#endregion


//#region Buttons

function chooseAlgo(choice) {

    if (choice == 1) {

        barAmount = 50;
        speed = 50;
        speedText = "10x";
        displayText();

        buttonPress(2);
        loadBubbleSort();

    }

    else if (choice == 2) {

        barAmount = 100;
        speed = 50;
        speedText = "10x";
        displayText();
        
        buttonPress(2);
        loadHeapSort();

    }

    else {

        barAmount = 100;
        speed = 50;
        speedText = "10x";
        displayText();

        buttonPress(2);
        loadQuickSort();

    }

}

function buttonPress(choice) {

    // Sort
    if (choice == 1) {

        if (!isRunning) {

            isRunning = true;
            
            if (document.getElementById("algoTitle").innerHTML == "Bubble Sort") {
                bubbleSortRecursion(barHeightArray, maxNum, colorChoice, 0, 0, 0);
            }

            else if (document.getElementById("algoTitle").innerHTML == "Heap Sort") {
                heapSort(barHeightArray, maxNum, colorChoice);
            }

            else {
                quickSort(barHeightArray, maxNum, colorChoice);
            }
        }
    }

    // Reset
    else if (choice == 2) {

        isRunning = false;
        createBars(barAmount, maxNum, colorChoice);

    }

    // Amount
    else if (choice == 3) {

        if (barAmount == 20) {
            barAmount = 50;
            buttonPress(2);
        }
        else if (barAmount == 50) {
            barAmount = 100;
            buttonPress(2);
        }
        else if (barAmount == 100) {
            barAmount = 200;
            buttonPress(2);
        }
        else {
            barAmount = 20;
            buttonPress(2);
        }

    }

    // Speed
    else if (choice == 4) {

        if (speed == 500) {
            speed = 250;
            speedText = "2x";
            displayText();
        }
        else if (speed == 250) {
            speed = 125;
            speedText = "4x";
            displayText();
        }
        else if (speed == 125) {
            speed = 50;
            speedText = "10x";
            displayText();
        }
        else if (speed == 50) {
            speed = 10;
            speedText = "50x";
            displayText();
        }
        else if (speed == 10) {
            speed = 1;
            speedText = "Ludicrous";
            displayText();
        }
        else {
            speed = 500;
            speedText = "1x";
            displayText();
        }

    }

    // Colour
    else {

        if (colorChoice == 1) {
            colorChoice = 2;
            buttonPress(2);
        }
        else if (colorChoice == 2) {
            colorChoice = 3;
            buttonPress(2);
        }
        else {
            colorChoice = 1;
            buttonPress(2);
        }
        
    }

}

//#endregion


//#region Canvas Display

function createBars(numBars, maxLength, color) {

    // Clear canvas
    clear();

    barHeightArray = [];

    // Generate, store, and draw bars of random lengths
    for (var i = 0; i < numBars; i++) {

        var randomNum = Math.floor((Math.random() * maxLength) + 1);

        barHeightArray.push(randomNum);

        // Draw Bar
        fill(barColor(color, randomNum, maxLength, false));
        noStroke();
        rect(
            ((w - 20) / numBars) * i + 10 + (200 / numBars),
            0,
            ((w - 20) / numBars) / 2,
            barHeightArray[i] * (h / (2.5 * maxLength))
        );

    }

    // Display speed and amount
    displayText();

}

function drawBars(barArray, maxBarLength, color, active, multiplier, remove) {

    if (remove) {

        fill("rgba(255, 255, 255, 1)");
        noStroke();
        rect(
            ((w - 20) / barArray.length) * multiplier + 8 + (200 / barArray.length),
            0,
            (((w - 20) / barArray.length) / 2) + 4,
            (h / 2) * 0.9
        );

    }

    else {

        fill(barColor(color, barArray[multiplier], maxBarLength, active));
        noStroke();
        rect(
            ((w - 20) / barArray.length) * multiplier + 10 + (200 / barArray.length),
            0,
            ((w - 20) / barArray.length) / 2,
            barArray[multiplier] * (h / (2.5 * maxBarLength))
        );

    }

}

function barColor(color, randomNum, maxLength, active) {

    var r, g, b, a;

    if (!active) {

        if (color == 1) {
            r = 100 + ((randomNum / maxLength).toFixed(2) * 100);
            g = 100 + ((randomNum / maxLength).toFixed(2) * 100);
            b = 100 + ((randomNum / maxLength).toFixed(2) * 100);
            a = 1;
        }
        else if (color == 2) {
            r = 200;
            g = 0;
            b = 0;
            a = 1 - ((randomNum / maxLength) / 2 );
        }
        else {
            r = 100 + ((randomNum / maxLength).toFixed(2) * 100);
            g = 0;
            b = 200 - ((randomNum / maxLength).toFixed(2) * 100);
            a = 1;
        }

    }

    else {

        if (color == 1) {
            r = 150
            g = 0
            b = 0
            a = 0.6;
        }
        else if (color == 2) {
            r = 180;
            g = 180;
            b = 180;
            a = 1
        }
        else {
            r = 40
            g = 0;
            b = 180
            a = 1;
        }

    }
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";

}

function displayText() {

    // Clear text
    fill("rgba(255, 255, 255, 1)");
    noStroke();
    rect(
        w / 40,
        h / 2.18,
        w / 3.5,
        h / 20
    );

    // Speed and amount text
    textSize(h / 45);
    fill("rgba(140, 140, 140, 1)");
    text('Speed: ' + speedText + '     Amount: ' + barAmount, w / 30, h / 2.05);

}

//#endregion


//#region InnerHTML Content

function loadBubbleSort() {

    document.getElementById("algoTitle").innerHTML = "Bubble Sort";

    document.getElementById("algoDescription").innerHTML = 
        "This algorithm is a very simple comparison based sorting algorithm that works by swapping adjacent elements if they are not in the correct order. This sorting method makes use of nested loops and has an average time complexity of O(n" + "2".sup() + "), making it ineffective for sorting large sets of data. The term \"Bubble Sort\" is used because with each iteration of the outer loop, the next largest element \"bubbles\" it's way up to the correct position.";

    document.getElementById("algoCode").innerHTML = 
        "<pre><code>" + "function bubbleSort(arr) {\n\n    for (var i = 0; i < arr.length - 1; i++) {\n        for (var j = i + 1; j < arr.length; j++) {\n            if (arr[i] > arr[j]) {\n                var temp = arr[j];\n                inputArray[j] = inputArray[i];\n                inputArray[i] = temp;\n            }\n        }\n    }\n    return arr;\n}" + "</code></pre>";


}

function loadHeapSort() {

    document.getElementById("algoTitle").innerHTML = "Heap Sort";

    document.getElementById("algoDescription").innerHTML = 
        "This algorithm works by selecting the largest element and moving it to the end of the array. However, instead of searching through the entire array to find the largest element, this algorithm first converts the entire array into a max heap. A max heap is a complete binary tree in which all parent nodes are greater than their children. In order to map an array as a binary tree, the index of any given element is labled \"i\", the left child of that element is \"2i + 1\", and the right child is \"2i + 2\". Heap Sort has a time complexity of O(nlg(n)) and a space complexity of O(1) making it fast and space efficient.";

    document.getElementById("algoCode").innerHTML = 
        "<pre><code>" + "function heapSort(arr) {\n\n    var length = arr.length;\n    var i = Math.floor(length / 2 - 1);\n    var k = length - 1;\n\n    while (i >= 0) {\n        heapify(arr, length, i);\n        i--;\n    }\n\n    while (k >= 0) {\n        var temp = arr[0];\n        arr[0] = arr[k];\n        arr[k] = temp;\n\n        k--\n    }\n\n    return arr;\n\n}\n\n\nfunction heapify(arr, length, i) {\n    var largest = i;\n    var left = i * 2 + 1;\n    var right = i * 2 + 2;\n\n    if (left < length && arr[left] > arr[largest]) {\n        largest = left;\n    }\n\n    if (right < length && arr[right] > arr[largest]) {\n        largest = right;\n    }\n\n    if(largest != i) {\n        var swap = arr[i];\n        arr[i] = arr[largest];\n        arr[largest] = swap;\n\n        heapify(arr, length, largest);\n    }\n\n    return arr;\n\n}" + "</code></pre>";

}

function loadQuickSort() {

    document.getElementById("algoTitle").innerHTML = "Quick Sort";

    document.getElementById("algoDescription").innerHTML = 
        "Quick Sort is a divide and conquer sorting algorithm. It works by first selecting an element as an initial \"pivot\" point. The remaining elements are then partitioned on either side of the pivot point depending on whether the element is higher or lower than the pivot point. This process is then repeated recursively or itteratively. This algorithm has an average time complexity of O(nlg(n)) and a worst case time complexity of O(n" + "2".sup() + ").";
    
    document.getElementById("algoCode").innerHTML = 
        "<pre><code>" + "function quickSort(arr, start, end) {\n\n    var index = partition(arr, start, end);\n\n    quickSort(arr, start, index - 1);\n    quickSort(arr, index + 1, end);\n\n}\n\n\nfunction partition(arr, start, end) {\n\n    var pivotValue = arr[end];\n    var pivotIndex = start;\n\n    for (var i = start; i < end; i++) {\n\n        if (arr[i] < pivotValue) {\n\n            var swap1 = arr[i];\n            arr[i] = arr[pivotIndex];\n            arr[pivotIndex] = swap1;\n\n            pivotIndex++;\n        }\n    }\n\n    var swap2 = arr[pivotIndex];\n    arr[pivotIndex] = arr[end];\n    arr[end] = swap2;\n\n    return pivotIndex;\n\n}" + "</code></pre>";

}

//#endregion


//#region Sorting Algorithms



// Bubble Sort Function
function bubbleSortRecursion(barHeightArray, maxLength, color, i, j, k) {

    displayText();

    // Kill switch
    if (isRunning) {
        
        if (i < barHeightArray.length) {

            if (j < barHeightArray.length - k) {

                if (barHeightArray[j] > barHeightArray[j + 1]) {

                    var temp = barHeightArray[j];
                    barHeightArray[j] = barHeightArray[j + 1];
                    barHeightArray[j + 1] = temp;

                }

                // Remove Bars
                drawBars(barHeightArray, maxLength, color, false, j, true);

                if (j != barHeightArray.length - 1) {
                    drawBars(barHeightArray, maxLength, color, false, j + 1, true);
                }

                // Draw Bars
                drawBars(barHeightArray, maxLength, color, false, j, false);

                if (j != barHeightArray.length - k - 1) {

                    drawBars(barHeightArray, maxLength, color, true, j + 1, false);

                }

                else {

                    drawBars(barHeightArray, maxLength, color, false, j + 1, false);

                }

                j++;

            }

            else {

                i++;

                k++;

                if (i < barHeightArray.length) {

                    j = 0;

                }

            }

            // Add time delay
            setTimeout(function() { bubbleSortRecursion(barHeightArray, maxLength, color, i, j, k); }, speed);

        }
    }
}



// Heap Sort Functions
function heapSort(barHeightArray, maxLength, color) {

    if (isRunning) {

        var arrayHolder = new Array();

        var length = barHeightArray.length;

        // Re-arrange array into heap
        for (var i = Math.floor(length / 2 - 1); i >= 0; i--) {

            heapify(barHeightArray, length, i, maxLength, color, arrayHolder);

        }

        for (var i = length - 1; i > 0; i--) {

            var temp = barHeightArray[0];
            barHeightArray[0] = barHeightArray[i];
            barHeightArray[i] = temp;

            // Make shallow copy
            var arr = [...barHeightArray];
            arrayHolder.push(arr);

            heapify(barHeightArray, i, 0, maxLength, color, arrayHolder);

        }

        drawHeapSort(arrayHolder, maxLength, color, 0);

    }

}

function heapify(barHeightArray, length, i, maxLength, color, arrayHolder) {

    var largest = i;
    var l = 2 * i + 1;
    var r = 2 * i + 2;

    if (l < length && barHeightArray[l] > barHeightArray[largest]) {

        largest = l;

    }

    if (r < length && barHeightArray[r] > barHeightArray[largest]) {

        largest = r;
        
    }

    if (largest != i) {

        var swap = barHeightArray[i];
        barHeightArray[i] = barHeightArray[largest];
        barHeightArray[largest] = swap;

        // Make shallow copy
        var arr = [...barHeightArray];
        arrayHolder.push(arr);

        if (isRunning) {
            heapify(barHeightArray, length, largest, maxLength, color, arrayHolder);
        }
    }
}

function drawHeapSort(arrayHolder, maxLength, color, pos) {

    if (isRunning) {
        clear();

        displayText();

        // Itterate through each element an array inside arrayHolder
        for (var j = 0; j < arrayHolder[pos].length; j++) {

            // Check if current array element is different to current array element in previous array in arrayHolder
            if (pos > 0 && arrayHolder[pos-1][j] != arrayHolder[pos][j]) {

                // Remove bar
                drawBars(arrayHolder[pos], maxLength, color, false, j, true);

                // Draw bar with active colour
                drawBars(arrayHolder[pos], maxLength, color, true, j, false);

            }
            else {

                // Remove bar
                drawBars(arrayHolder[pos], maxLength, color, false, j, true);

                // Draw bar without active colour
                drawBars(arrayHolder[pos], maxLength, color, false, j, false);

            }

            // Remove active bar colour when array is fully sorted
            if (pos == arrayHolder.length - 1) {

                // Remove bar
                drawBars(arrayHolder[pos], maxLength, color, false, j, true);

                // Draw bar without active colour
                drawBars(arrayHolder[pos], maxLength, color, false, j, false);

            }

        }

        pos++;

        if (pos < arrayHolder.length) {

            setTimeout(function() { drawHeapSort(arrayHolder, maxLength, color, pos); }, speed);

        }
    }
}



// Quick Sort Functions
function partition(arr, start, end, arrayHolder) {

    // Select last element as pivot
    var pivotValue = arr[end];

    // Select start element as index
    var pivotIndex = start;

    for (var i = start; i < end; i++) {

        if (arr[i] < pivotValue) {

            // Swap elements
            var swap = arr[i];
            arr[i] = arr[pivotIndex];
            arr[pivotIndex] = swap;

            // Store instance of array in arrayHolder
            if (JSON.stringify(arr) !== JSON.stringify(arrayHolder[arrayHolder.length - 1])) {

                arrayHolder.push([...arr]); 
            
            }

            // Move to next element
            pivotIndex++;

        }

    }

    // Put pivotValue in the middle
    var temp = arr[pivotIndex];
    arr[pivotIndex] = arr[end];
    arr[end] = temp;

    // Store instance of array in arrayHolder
    if (JSON.stringify(arr) !== JSON.stringify(arrayHolder[arrayHolder.length - 1])) {

        arrayHolder.push([...arr]);
    
    }

    return pivotIndex;

}

function quickSortRecursion(arr, start, end, arrayHolder) {

    if (start >= end) {

        return;

    }

    var index = partition(arr, start, end, arrayHolder);

    quickSortRecursion(arr, start, index - 1, arrayHolder);
    quickSortRecursion(arr, index + 1, end, arrayHolder);

}

function quickSort(barHeightArray, maxLength, color) {

    if (isRunning) {

        var arrayHolder = new Array();

        arrayHolder.push([...barHeightArray]);

        quickSortRecursion(barHeightArray, 0, barHeightArray.length - 1, arrayHolder);

        drawQuickSort(arrayHolder, maxLength, color, 0);

    }

}

function drawQuickSort(arrayHolder, maxLength, color, pos) {

    if (isRunning) {

        clear();

        displayText();

        // Itterate through each element an array inside arrayHolder
        for (var j = 0; j < arrayHolder[pos].length; j++) {

            // Check if current array element is different to current array element in previous array in arrayHolder
            if (pos > 0 && arrayHolder[pos-1][j] != arrayHolder[pos][j]) {

                // Remove bar
                drawBars(arrayHolder[pos], maxLength, color, false, j, true);

                // Draw bar with active colour
                drawBars(arrayHolder[pos], maxLength, color, true, j, false);

            }
            else {

                // Remove bar
                drawBars(arrayHolder[pos], maxLength, color, false, j, true);

                // Draw bar without active colour
                drawBars(arrayHolder[pos], maxLength, color, false, j, false);

            }

            // Remove active bar colour when array is fully sorted
            if (pos == arrayHolder.length - 1) {

                // Remove bar
                drawBars(arrayHolder[pos], maxLength, color, false, j, true);

                // Draw bar without active colour
                drawBars(arrayHolder[pos], maxLength, color, false, j, false);

            }

        }

        pos++;

        if (pos < arrayHolder.length) {

            setTimeout(function() { drawQuickSort(arrayHolder, maxLength, color, pos); }, speed);

        }
    }
}



//#endregion


//#region PreLoad, Setup, Update, Draw Functions

window.onresize = function(){ location.reload(); }

function setup() {

    canvas = createCanvas(w, h / 2);

    canvas.parent('sketch-holder');

    createBars(barAmount, maxNum, colorChoice);

    displayText();

    chooseAlgo(1);
    
}

//#endregion
let targetSum = 0;
let n = 0;
let k = 0;
const setColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#4D96FF', '#FF9999', '#6BCB77', '#FF9999'];

async function submitN() {
    n = parseInt(document.getElementById("nInput").value);
    if (n < 8 || n > 35) {
        alert("Please enter a number between 8 and 35.");
        return;
    }
    try {
        const response = await fetch("http://127.0.0.1:8000/get_k_options", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ n: n })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const kOptions = data.k_options;
        const kSelect = document.getElementById("kSelect");
        kSelect.innerHTML = "";
        kOptions.forEach(k => {
            const option = document.createElement("option");
            option.value = k;
            option.textContent = `${k} Sets`;
            kSelect.appendChild(option);
        });
        document.getElementById("kOptionsContainer").style.display = "block";
    } catch (error) {
        console.error("Error:", error);
    }
}

async function submitK() {
    k = parseInt(document.getElementById("kSelect").value);
    try {
        const response = await fetch("http://127.0.0.1:8000/get_partition", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ n, k })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        targetSum = data.target_sum;
        document.getElementById("targetSumDisplay").textContent = targetSum;
        setupGame(n, k, data.partition);
    } catch (error) {
        console.error("Error:", error);
    }
}

function setupGame(n, k, partition) {
    document.getElementById("gameArea").style.display = "block";
    const numbersContainer = document.getElementById("numbersContainer");
    numbersContainer.innerHTML = "";
    
    // Generate draggable numbers
    for (let i = 1; i <= n; i++) {
        const number = document.createElement("div");
        number.textContent = i;
        number.className = "number";
        number.draggable = true;
        number.id = `number-${i}`;
        number.ondragstart = drag;
        numbersContainer.appendChild(number);
    }

    // Create droppable sets with slots
    const setsContainer = document.getElementById("setsContainer");
    setsContainer.innerHTML = "";
    partition[0].forEach((setSize, index) => {
        const set = document.createElement("div");
        set.className = "set";
        set.id = `set-${index}`;
        set.style.backgroundColor = setColors[index % setColors.length];
        
        // Create slots
        for (let i = 0; i < setSize; i++) {
            const slot = document.createElement("div");
            slot.className = "slot";
            slot.ondrop = drop;
            slot.ondragover = allowDrop;
            set.appendChild(slot);
        }
        
        const setInfo = document.createElement("div");
        setInfo.className = "set-info";
        setInfo.textContent = `Sum: 0`;
        
        set.appendChild(setInfo);
        setsContainer.appendChild(set);
    });
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.target.style.opacity = "0.5";
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const numberElement = document.getElementById(data);
    
    if (numberElement) {
        let targetElement = event.target;
        
        if (targetElement.classList.contains("slot") && !targetElement.hasChildNodes()) {
            targetElement.appendChild(numberElement);
            numberElement.style.opacity = "1";
            updateSetInfo(targetElement.closest('.set'));
        } else if (targetElement.id === "numbersContainer") {
            targetElement.appendChild(numberElement);
            numberElement.style.opacity = "1";
            updateSetInfo(numberElement.closest('.set'));
        }
    }
}

function updateSetInfo(setElement) {
    if (setElement) {
        const numbers = Array.from(setElement.querySelectorAll(".number"));
        const sum = numbers.reduce((total, numElement) => total + parseInt(numElement.textContent), 0);
        const setInfo = setElement.querySelector(".set-info");
        setInfo.textContent = `Sum: ${sum}`;
        setElement.dataset.sum = sum;
    }
}

function checkSolution() {
    const sets = Array.from(document.querySelectorAll(".set"));
    const allCorrect = sets.every(set => parseInt(set.dataset.sum) === targetSum);
    const allFilled = sets.every(set => set.querySelectorAll('.number').length === set.querySelectorAll('.slot').length);
    const resultMessage = document.getElementById("resultMessage");
    
    if (allCorrect && allFilled) {
        resultMessage.textContent = "Congratulations! You've created equal sum partitions!";
        resultMessage.style.color = "#4caf50";
    } else {
        resultMessage.textContent = "Not quite right. Keep trying!";
        resultMessage.style.color = "#ff9800";
    }
}
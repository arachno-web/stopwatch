// Function to generate a soft click sound using Web Audio API
function playClickSound() {
    // Audio Context create kar rahe hain
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Oscillator (sound frequency generator)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine'; // Soft tone ke liye
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Pitch/Frequency (800Hz)

    // Fade out effect taaki harsh beep na lage
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05); // 0.05 seconds ki short sound
}

const mainTimeDisplay = document.getElementById('main-time');
const msTimeDisplay = document.getElementById('ms-time');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const themeToggle = document.getElementById('theme-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const timerBox = document.getElementById('timer-box');
const lapsList = document.getElementById('lapsList');
const restoreMsg = document.getElementById('restore-msg');
const restoreYes = document.getElementById('restore-yes');
const restoreNo = document.getElementById('restore-no');

let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let lapCounter = 1;

// Time Formatter Function
function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let milliseconds = Math.floor((ms % 1000) / 10);

    let mainStr = 
        (hours < 10 ? "0" + hours : hours) + ":" +
        (minutes < 10 ? "0" + minutes : minutes) + ":" +
        (seconds < 10 ? "0" + seconds : seconds);

    let msStr = milliseconds < 10 ? "0" + milliseconds : milliseconds;

    return { main: mainStr, ms: msStr };
}

function updateDisplay() {
    const timeObj = formatTime(elapsedTime);
    mainTimeDisplay.textContent = timeObj.main;
    msTimeDisplay.textContent = timeObj.ms;
    localStorage.setItem('savedTime', elapsedTime);
}

// Start / Stop Logic
function toggleTimer() {
    playClickSound(); // 👈 Call sound function
    //
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        
        isRunning = true;
        startStopBtn.textContent = "Stop";
        startStopBtn.classList.replace('start', 'stop');
        lapBtn.disabled = false;
    } else {
        clearInterval(timer);
        isRunning = false;
        startStopBtn.textContent = "Start";
        startStopBtn.classList.replace('stop', 'start');
        lapBtn.disabled = true;
    }
}

startStopBtn.addEventListener('click', toggleTimer);

// Lap Time Feature
lapBtn.addEventListener('click', () => {
playClickSound(); // 👈 Call sound function
    // 
    if (isRunning) {
        const timeObj = formatTime(elapsedTime);
        const li = document.createElement('li');
        li.innerHTML = `<span>Lap ${lapCounter++}</span> <strong>${timeObj.main}.${timeObj.ms}</strong>`;
        lapsList.prepend(li);
    }
});

// Reset with Confirmation
resetBtn.addEventListener('click', () => {
    if (elapsedTime === 0) return;

    const confirmReset = confirm("Kya aap pakka timer reset aur delete karna chahte hain?");
    if (confirmReset) {
        clearInterval(timer);
        isRunning = false;
        elapsedTime = 0;
        lapCounter = 1;
        updateDisplay();
        lapsList.innerHTML = '';
        localStorage.removeItem('savedTime');

        startStopBtn.textContent = "Start";
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
        lapBtn.disabled = true;
    }
});

// Single Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('light-mode')) {
        themeToggle.textContent = "Dark Mode";
    } else {
        themeToggle.textContent = "Light Mode";
    }
});

// Fullscreen Logic
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.body.classList.add('fullscreen-active');
    } else {
        document.exitFullscreen();
        document.body.classList.remove('fullscreen-active');
    }
});

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.body.classList.remove('fullscreen-active');
    }
});

// Fullscreen Screen Tap
timerBox.addEventListener('click', () => {
    if (document.body.classList.contains('fullscreen-active')) {
        toggleTimer();
    }
});

// Keyboard Spacebar Shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
    }
});

// Restore Saved Time
window.addEventListener('load', () => {
    const saved = localStorage.getItem('savedTime');
    if (saved && parseInt(saved) > 0) {
        restoreMsg.classList.remove('hidden');

        restoreYes.addEventListener('click', () => {
            elapsedTime = parseInt(saved);
            updateDisplay();
            restoreMsg.classList.add('hidden');
        });

        restoreNo.addEventListener('click', () => {
            localStorage.removeItem('savedTime');
            restoreMsg.classList.add('hidden');
        });
    }
});
// Keyboard Shortcuts Listener ⌨️
document.addEventListener('keydown', (event) => {
    // Agar Spacebar press hua
    if (event.code === 'Space') {
        event.preventDefault(); // Page scroll hone se rokta hai
        startBtn.click();
    }
    // Agar 'L' key press hui
    else if (event.key.toLowerCase() === 'l') {
        if (!lapBtn.disabled) {
            lapBtn.click();
        }
    }
    // Agar 'R' key press hui
    else if (event.key.toLowerCase() === 'r') {
        resetBtn.click();
    }
    else if (event.key.toLowerCase() === 'f') {
        fullscreenBtn.click();
    }   
    
});

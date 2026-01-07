const log = document.getElementById("log");
const input = document.getElementById("input");
const eye = document.querySelector(".hal-eye");
const bgSound = document.getElementById("ambience");

// ===============================
// AUDIO ENGINE — HAL
// ===============================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playBeep(freq = 900, duration = 0.02, volume = 0.04) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function keySound() {
    playBeep(1200, 0.015, 0.025);
}

function enterSound() {
    playBeep(500, 0.08, 0.06);
}


// ===============================
// AMBIENCE
// ===============================
function startAmbience() {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    bgSound.volume = 0.15;
    bgSound.currentTime = 0;

    bgSound.play().catch(() => {
        console.log("Aguardando interação do usuário...");
    });

    document.removeEventListener("click", startAmbience);
    document.removeEventListener("keydown", startAmbience);
}

bgSound.addEventListener("ended", () => {
    bgSound.currentTime = 0;
    bgSound.play();
});

document.addEventListener("click", startAmbience);
document.addEventListener("keydown", startAmbience);

// ===============================
// TERMINAL VISUAL
// ===============================
function addLine(text, cls) {
    const p = document.createElement("div");
    p.className = cls;
    p.innerText = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// ===============================
// IA
// ===============================
async function halReply(message) {
    try {
        const response = await fetch("https://hal-2026.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply || "Desculpe, humano. Receio não poder fazer isso.";
    } catch {
        return "Erro de conexão com meus circuitos lógicos.";
    }
}

// ===============================
// EFEITO DIGITAÇÃO HAL
// ===============================
async function typeHAL(text) {
    return new Promise(resolve => {
        const p = document.createElement("div");
        p.className = "system";
        log.appendChild(p);

        let i = 0;
        const interval = setInterval(() => {
            p.innerText = text.slice(0, i);
            i++;

            const intensity = Math.random() * 20 + 40;
            eye.style.boxShadow = `0 0 ${intensity}px ${intensity / 4}px red, inset 0 0 20px red`;
            eye.style.transform = `scale(${1 + Math.random() * 0.02})`;

            log.scrollTop = log.scrollHeight;

            if (i > text.length) {
                clearInterval(interval);
                eye.style.boxShadow = "";
                eye.style.transform = "scale(1)";
                resolve();
            }
        }, 35);
    });
}

// ===============================
// INPUT
// ===============================
input.addEventListener("keydown", async e => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    if (e.key === "Enter" && input.value.trim() !== "") {
        enterSound();

        const text = input.value.trim();
        input.value = "";

        addLine("VOCÊ: " + text, "user");

        await typeHAL("Estou analisando suas palavras, humano...");
        const reply = await halReply(text);
        await typeHAL("HAL 2026: " + reply);
    } else {
        keySound();
    }
});

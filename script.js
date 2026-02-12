// ===== State Management =====
let envelopes = [];
let isSpinning = false;
let nextId = 1;

// ===== DOM Elements =====
const addBtn = document.getElementById('addBtn');
const spinBtn = document.getElementById('spinBtn');
const envelopeWheel = document.getElementById('envelopeWheel');

// Modal elements
const addModal = document.getElementById('addModal');
const winnerModal = document.getElementById('winnerModal');
const closeAddModal = document.getElementById('closeAddModal');
const closeWinnerModal = document.getElementById('closeWinnerModal');
const confirmAdd = document.getElementById('confirmAdd');
const moneyInput = document.getElementById('moneyInput');
const winnerAmount = document.getElementById('winnerAmount');
const spinAgain = document.getElementById('spinAgain');

// ===== Utility Functions =====
function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

function updateStats() {
    // Enable spin button if there are at least 2 envelopes
    spinBtn.disabled = envelopes.length < 2;
}

function positionEnvelopes() {
    // Calculate radius dynamically based on container size
    // Use 40% of container width to leave margin for envelopes
    const containerWidth = envelopeWheel.clientWidth;
    const radius = containerWidth * 0.40;

    const angleStep = (2 * Math.PI) / envelopes.length;

    envelopes.forEach((envelope, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const envelopeEl = document.getElementById(`envelope-${envelope.id}`);
        if (envelopeEl) {
            envelopeEl.style.transform = `translate(${x}px, ${y}px)`;
        }
    });
}

// Update positions on resize
window.addEventListener('resize', positionEnvelopes);

function createEnvelopeElement(envelope) {
    const div = document.createElement('div');
    div.className = 'envelope';
    div.id = `envelope-${envelope.id}`;
    div.innerHTML = `
        <div class="envelope-icon">🧧</div>
    `;
    // Store amount as data attribute for later use
    div.dataset.amount = envelope.amount;
    return div;
}

function addEnvelope(amount) {
    const envelope = {
        id: nextId++,
        amount: amount
    };

    envelopes.push(envelope);

    // Create and add envelope element
    const envelopeEl = createEnvelopeElement(envelope);
    envelopeWheel.appendChild(envelopeEl);

    // Update positions and stats
    positionEnvelopes();
    updateStats();

    // Add entrance animation
    setTimeout(() => {
        envelopeEl.style.animation = 'fadeIn 0.3s ease';
    }, 10);
}

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    const colors = ['#FFD700', '#FFA000', '#D32F2F', '#EF5350', '#FFFFFF'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confettiContainer.appendChild(confetti);

        // Remove after animation
        setTimeout(() => confetti.remove(), 3000);
    }
}

function spinWheel() {
    if (isSpinning || envelopes.length < 2) return;

    isSpinning = true;
    spinBtn.disabled = true;
    addBtn.disabled = true;

    // Pause auto-rotation animation
    envelopeWheel.style.animation = 'none';

    // Get current rotation from computed style
    const currentTransform = window.getComputedStyle(envelopeWheel).transform;
    let currentRotation = 0;
    if (currentTransform !== 'none') {
        const values = currentTransform.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        currentRotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    }

    // Remove previous winner class
    document.querySelectorAll('.envelope.winner').forEach(el => {
        el.classList.remove('winner');
    });

    // Calculate random winner
    const winnerIndex = Math.floor(Math.random() * envelopes.length);
    const winner = envelopes[winnerIndex];

    // Calculate rotation
    const anglePerEnvelope = 360 / envelopes.length;
    const targetAngle = -(winnerIndex * anglePerEnvelope) + 90; // Align to top
    const spins = 5; // Number of full rotations
    const totalRotation = currentRotation + (spins * 360) + targetAngle;

    // Apply rotation
    envelopeWheel.style.transform = `rotate(${totalRotation}deg)`;

    // After spin completes
    setTimeout(() => {
        // Highlight winner
        const winnerEl = document.getElementById(`envelope-${winner.id}`);
        if (winnerEl) {
            winnerEl.classList.add('winner');
        }

        // Show winner modal
        setTimeout(() => {
            winnerAmount.textContent = formatMoney(winner.amount);
            winnerModal.classList.add('active');
            createConfetti();

            isSpinning = false;
            addBtn.disabled = false;
        }, 500);
    }, 3000); // Match CSS transition duration
}

function resetSpin() {
    // Reset rotation and resume auto-rotation
    envelopeWheel.style.transition = 'none';
    envelopeWheel.style.transform = 'rotate(0deg)';

    setTimeout(() => {
        envelopeWheel.style.transition = 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        envelopeWheel.style.animation = 'autoRotate 20s linear infinite';
        spinBtn.disabled = envelopes.length < 2;
    }, 50);
}

// ===== Event Listeners =====
addBtn.addEventListener('click', () => {
    addModal.classList.add('active');
    moneyInput.value = '';
    moneyInput.focus();
});

closeAddModal.addEventListener('click', () => {
    addModal.classList.remove('active');
});

closeWinnerModal.addEventListener('click', () => {
    winnerModal.classList.remove('active');
    resetSpin();
});

spinAgain.addEventListener('click', () => {
    winnerModal.classList.remove('active');
    resetSpin();
});

confirmAdd.addEventListener('click', () => {
    const amount = parseInt(moneyInput.value);

    if (!amount || amount < 1000) {
        alert('Vui lòng nhập số tiền hợp lệ (tối thiểu 1,000 đ)');
        return;
    }

    addEnvelope(amount);
    addModal.classList.remove('active');
});

spinBtn.addEventListener('click', spinWheel);

// Allow Enter key to submit
moneyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmAdd.click();
    }
});

// Close modals when clicking outside
addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
        addModal.classList.remove('active');
    }
});

winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
        winnerModal.classList.remove('active');
        resetSpin();
    }
});

// ===== Initialize =====
updateStats();

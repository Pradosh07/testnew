// GLOBAL DATA STORAGE COMPILATION PIPELINE CONFIG
const MOCKS = [

   ...QUESTIONS_DATA_FULL_MOCKS,
   ...QUESTIONS_DATA_FULL_MOCKS_1,
   ...QUESTIONS_DATA_FULL_MOCKS_2,
   ...QUESTIONS_DATA_FULL_MOCKS_3,
   ...QUESTIONS_DATA_FULL_MOCKS_4,
   ...QUESTIONS_DATA_FULL_MOCKS_5,
   ...QUESTIONS_DATA_FULL_MOCKS_6,
   ...QUESTIONS_DATA_FULL_MOCKS_7,
   ...QUESTIONS_DATA_FULL_MOCKS_8,
   ...QUESTIONS_DATA_FULL_MOCKS_9,
   

   ...QUESTIONS_DATA_TOPIC_MOCKS

];


// GLOBAL APPLICATION MATRIX STATE ENGINE
let currentUser = JSON.parse(localStorage.getItem('csir_user')) || null;
let activeFilter = 'all';
let currentAttempt = null;
let activeQuestionIndex = 0;
let countdownInterval = null;

// GATE CALCULATOR SPECIAL STATE ENGINE
let angleMode = 'deg'; // 'deg' or 'rad' mode parameters tracker
let memoryValue = 0;   // Store MR memory buffers persistently

// INIT LOOP WRAPPER EXECUTOR
function initApp() {
    renderAuthStatus();
    navigateTo('dashboard');
}

function renderAuthStatus() {
    const container = document.getElementById('auth-status');
    if (currentUser) {
        container.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-slate-600 font-medium"><i class="fa-solid fa-user-graduate text-indigo-500 mr-1.5"></i>${currentUser.name}</span>
                <button onclick="handleLogout()" class="text-xs text-rose-600 hover:underline font-medium">Sign Out</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button onclick="navigateTo('login')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Sign In</button>
        `;
    }
}

function handleLogout() {
    localStorage.removeItem('csir_user');
    currentUser = null;
    renderAuthStatus();
    navigateTo('dashboard');
}

// ROUTING LAYER ENGINE
function navigateTo(page, params = {}) {
    const viewport = document.getElementById('app-viewport');
    window.scrollTo(0, 0);
    
    if (countdownInterval && page !== 'quiz-engine') {
        clearInterval(countdownInterval);
    }

    switch(page) {
        case 'dashboard': renderDashboard(viewport); break;
        case 'login': renderLogin(viewport); break;
        case 'instructions': renderInstructions(viewport, params.mockId); break;
        case 'quiz-engine': renderQuizEngine(viewport, params.mockId); break;
        case 'result': renderResult(viewport, params.attemptId); break;
        case 'history': renderHistory(viewport); break;
    }
}

// VIEW-RENDER FUNCTIONS (DASHBOARD SYSTEM LAYER)
function renderDashboard(target) {
    const historyBtn = currentUser ? `<button onclick="navigateTo('history')" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"><i class="fa-solid fa-clock-history mr-1"></i> My Test History</button>` : '';
    
    target.innerHTML = `
        <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">Available Practice Tests</h2>
                <p class="text-slate-500 text-sm mt-0.5">Select a mock type below to evaluate your readiness for CSIR NET Physical Sciences.</p>
            </div>
            <div class="flex items-center space-x-4">
                ${historyBtn}
                <div class="bg-white border border-slate-200 rounded-lg p-1 flex space-x-1 shadow-xs">
                    <button onclick="filterDashboard('all')" id="tab-all" class="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}">All Tests</button>
                    <button onclick="filterDashboard('full')" id="tab-full" class="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === 'full' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}">Full Length</button>
                    <button onclick="filterDashboard('topic')" id="tab-topic" class="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === 'topic' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}">Topic-wise</button>
                </div>
            </div>
        </div>
        <div id="mocks-container" class="space-y-3"></div>
    `;
    renderMockList();
}

function filterDashboard(type) {
    activeFilter = type;
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-xs');
        btn.classList.add('text-slate-600', 'hover:bg-slate-50');
    });
    document.getElementById(`tab-${type}`).classList.add('bg-indigo-600', 'text-white', 'shadow-xs');
    renderMockList();
}

function renderMockList() {
    const container = document.getElementById('mocks-container');
    const filtered = MOCKS.filter(m => activeFilter === 'all' || m.section === activeFilter);
    const localAttempts = JSON.parse(localStorage.getItem('csir_attempts')) || [];
    const activeUserEmail = currentUser ? currentUser.email : 'guest';

    container.innerHTML = filtered.map(mock => {
        const badge = mock.is_new ? `<span class="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">NEW</span>` : '';
        const existingAttempt = localAttempts.find(a => a.mockId === mock.id && a.user === activeUserEmail);

        let actionButton = '';
        let statusBadge = '';

        if (existingAttempt) {
            statusBadge = `<span class="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-1 rounded border border-emerald-200"><i class="fa-solid fa-square-check mr-1"></i>Attempted (Score: ${existingAttempt.score.toFixed(2)})</span>`;
            actionButton = `<button onclick="navigateTo('result', {attemptId: '${existingAttempt.id}'})" class="bg-slate-800 text-white hover:bg-slate-900 font-semibold text-xs px-4 py-2 rounded-lg transition-all tracking-wider uppercase">View Response</button>`;
        } else {
            actionButton = `<button onclick="navigateTo('instructions', {mockId: '${mock.id}'})" class="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all tracking-wider uppercase">Take Test</button>`;
        }

        return `
            <div class="bg-white border-l-4 border-l-indigo-600 border-y border-r border-slate-200 rounded-r-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-shadow">
                <div class="space-y-1 flex-1">
                    <div class="flex items-center space-x-2">
                        <h3 class="font-bold text-slate-800 text-base leading-snug">${mock.title}</h3>
                        ${badge}
                    </div>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span><i class="fa-solid fa-tags mr-1 opacity-70"></i>${mock.topic}</span>
                        <span><i class="fa-solid fa-circle-question mr-1 opacity-70"></i>${mock.total_questions} Questions</span>
                        <span><i class="fa-solid fa-award mr-1 opacity-70"></i>Max: ${mock.total_marks} Marks</span>
                        <span><i class="fa-solid fa-clock mr-1 opacity-70"></i>${mock.duration_min} Mins</span>
                    </div>
                </div>
                <div class="flex items-center space-x-3 shrink-0 self-end md:self-center">
                    ${statusBadge}
                    ${actionButton}
                </div>
            </div>
        `;
    }).join('');
}

// INSTRUCTIONS MODULE
function renderInstructions(target, mockId) {
    const mock = MOCKS.find(m => m.id === mockId);
    const localAttempts = JSON.parse(localStorage.getItem('csir_attempts')) || [];
    const activeUserEmail = currentUser ? currentUser.email : 'guest';
    
    const hasAttempted = localAttempts.some(a => a.mockId === mockId && a.user === activeUserEmail);
    if (hasAttempted) {
        alert("Security Exception: Direct access prohibited. This configuration profile has already been completed.");
        navigateTo('dashboard');
        return;
    }

    const isFull = mock.section === 'full';

    target.innerHTML = `
        <div class="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <h2 class="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3"><i class="fa-solid fa-file-invoice mr-2 text-indigo-600"></i>Examination Guidelines & Rules</h2>
            <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-sm">
                <i class="fa-solid fa-circle-exclamation text-lg text-amber-600 shrink-0 mt-0.5"></i>
                <div>
                    <span class="font-bold">Important Information Regarding Attempt Constraints:</span>
                    <p class="text-amber-800 text-xs mt-1">This simulation accurately replicates CSIR section capping parameters. You are allowed exactly **one evaluation instance**. Section thresholds are hardcapped (**Part A: max 15, Part B: max 20, Part C: max 20**).</p>
                </div>
            </div>
            <div class="mt-6 space-y-4 text-sm text-slate-600 leading-relaxed">
                <h3 class="font-bold text-slate-800 uppercase tracking-wider text-xs">Section Evaluation Parameters Hierarchy</h3>
                ${isFull ? `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span class="block font-bold text-slate-800 text-xs uppercase">Part A (General Aptitude)</span>
                        <ul class="text-xs space-y-1 mt-1 text-slate-500"><li>• Items: 20</li><li>• Max Cap: 15</li><li>• Delta: +2.00 | -0.50</li></ul>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span class="block font-bold text-slate-800 text-xs uppercase">Part B (Core)</span>
                        <ul class="text-xs space-y-1 mt-1 text-slate-500"><li>• Items: 25</li><li>• Max Cap: 20</li><li>• Delta: +3.00 | -0.75</li></ul>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span class="block font-bold text-slate-800 text-xs uppercase">Part C (Advanced)</span>
                        <ul class="text-xs space-y-1 mt-1 text-slate-500"><li>• Items: 30</li><li>• Max Cap: 20</li><li>• Delta: +5.00 | -1.50</li></ul>
                    </div>
                </div>` : `
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span class="block font-bold text-slate-800 text-xs uppercase">Topic-wise Custom Parameters</span>
                    <p class="text-xs text-slate-500 mt-1">Evaluated across mixed Part B and Part C configurations. 25 total questions. Negative marks fixed at standard 25% rates.</p>
                </div>`}
            </div>
            <div class="mt-8 flex justify-end space-x-3 border-t border-slate-100 pt-4">
                <button onclick="navigateTo('dashboard')" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">Abort & Return</button>
                <button onclick="navigateTo('quiz-engine', {mockId: '${mock.id}'})" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-xs">Initialize Session</button>
            </div>
        </div>
    `;
}

// LOG IN CONTROL INTERACTION ENGINE
function renderLogin(target) {
    target.innerHTML = `
        <div class="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-6 mt-10">
            <div class="text-center mb-6">
                <div class="inline-block bg-indigo-50 text-indigo-600 p-3 rounded-full mb-2"><i class="fa-solid fa-shield-halved text-2xl"></i></div>
                <h2 class="text-xl font-bold text-slate-900">Portal Authentication</h2>
            </div>
            <form onsubmit="handleAuthSubmit(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Email ID</label>
                    <input id="login-email" type="email" required class="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-indigo-600" placeholder="candidate@academy.edu">
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Password</label>
                    <input id="login-pass" type="password" required class="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-indigo-600" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg text-sm transition-colors tracking-wide">Continue to Account</button>
            </form>
        </div>
    `;
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    currentUser = { email, name: email.split('@')[0].toUpperCase() };
    localStorage.setItem('csir_user', JSON.stringify(currentUser));
    initApp();
}

// LIVE ENGINE PORTAL LAYOUTS MATRIX RUNNER
function renderQuizEngine(target, mockId) {
    const mock = MOCKS.find(m => m.id === mockId);
    const localAttempts = JSON.parse(localStorage.getItem('csir_attempts')) || [];
    const activeUserEmail = currentUser ? currentUser.email : 'guest';

    const alreadyDone = localAttempts.find(a => a.mockId === mockId && a.user === activeUserEmail);
    if (alreadyDone) {
        alert("Single Attempt Limit Restraint Active. Forwarding straight to your historical response sheet.");
        navigateTo('result', { attemptId: alreadyDone.id });
        return;
    }
    
    currentAttempt = {
        mock,
        questions: mock.questions_list,
        answers: {},
        timeSpentPerQuestion: {}, 
        timeLeft: mock.duration_min * 60,
        visited: { [mock.questions_list[0].id]: true }
    };

    mock.questions_list.forEach(q => {
        currentAttempt.timeSpentPerQuestion[q.id] = 0;
    });

    activeQuestionIndex = 0;

    target.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div class="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col min-h-[500px]">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div class="flex items-center space-x-2">
                        <span id="question-part-badge" class="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Part A</span>
                        <span class="text-xs text-slate-400 font-medium">Question Sequence ID: #<span id="question-id-display">1</span></span>
                    </div>
                    <div class="flex items-center space-x-4 text-xs font-medium text-slate-500">
                        <span><i class="fa-solid fa-stopwatch text-indigo-500 mr-1"></i>On this Q: <span id="current-q-timer" class="font-mono font-bold text-slate-700">0s</span></span>
                        <span><i class="fa-solid fa-plus-circle text-emerald-500 mr-1"></i>Correct: <span id="score-plus-val">+2</span></span>
                    </div>
                </div>
                <div class="flex-1">
                    <p id="question-text-box" class="text-slate-800 font-medium leading-relaxed text-base mb-6 whitespace-pre-wrap"></p>
                    <div id="options-stack" class="space-y-3"></div>
                </div>
                <div class="border-t border-slate-100 pt-4 mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center space-x-2">
                        <button onclick="engineMarkForReview()" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors uppercase tracking-wider">Mark for Review</button>
                        <button onclick="engineClearResponse()" class="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors uppercase tracking-wider">Clear Choice</button>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="enginePrev()" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold p-2.5 rounded-lg transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                        <button onclick="engineSaveAndNext()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors uppercase tracking-wider shadow-xs">Save & Next</button>
                    </div>
                </div>
            </div>
            <div class="space-y-4">
                <div class="bg-slate-900 text-white p-4 rounded-2xl shadow-sm text-center flex items-center justify-between">
                    <div class="text-left">
                        <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400">Time Remaining</span>
                        <div id="engine-clock" class="text-2xl font-bold font-mono tracking-wide text-indigo-400">00:00:00</div>
                    </div>
                    <button onclick="engineSubmitTrigger(false)" class="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-colors shadow-xs">Submit Mock</button>
                </div>
                <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Live Limits Monitor</h4>
                    <div id="live-caps-container" class="space-y-1.5 text-xs font-medium"></div>
                </div>
                <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Question Palette</h4>
                    <div id="palette-grid" class="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1"></div>
                </div>
            </div>
        </div>
    `;

    countdownInterval = setInterval(() => {
        currentAttempt.timeLeft--;
        
        const activeQ = currentAttempt.questions[activeQuestionIndex];
        if (activeQ) {
            currentAttempt.timeSpentPerQuestion[activeQ.id]++;
            const liveQTimer = document.getElementById('current-q-timer');
            if (liveQTimer) liveQTimer.innerText = `${currentAttempt.timeSpentPerQuestion[activeQ.id]}s`;
        }

        if (currentAttempt.timeLeft <= 0) {
            clearInterval(countdownInterval);
            engineSubmitTrigger(true);
        } else {
            updateClockDisplay();
        }
    }, 1000);
    
    updateClockDisplay();
    syncQuestionState();
}

function updateClockDisplay() {
    const h = Math.floor(currentAttempt.timeLeft / 3600).toString().padStart(2, '0');
    const m = Math.floor((currentAttempt.timeLeft % 3600) / 60).toString().padStart(2, '0');
    const s = (currentAttempt.timeLeft % 60).toString().padStart(2, '0');
    const clockEl = document.getElementById('engine-clock');
    if (clockEl) clockEl.innerText = `${h}:${m}:${s}`;
}

function syncQuestionState() {
    const q = currentAttempt.questions[activeQuestionIndex];
    currentAttempt.visited[q.id] = true;

    document.getElementById('question-part-badge').innerText = `Part ${q.part}`;
    document.getElementById('question-id-display').innerText = q.q_number;
    document.getElementById('question-text-box').innerText = q.question_text;

    const liveQTimer = document.getElementById('current-q-timer');
    if (liveQTimer) liveQTimer.innerText = `${currentAttempt.timeSpentPerQuestion[q.id] || 0}s`;

    const isFull = currentAttempt.mock.section === 'full';
    const plusVal = isFull ? (q.part === 'A' ? 2 : q.part === 'B' ? 3 : 5) : 3;
    document.getElementById('score-plus-val').innerText = `+${plusVal}`;

    const container = document.getElementById('options-stack');
    const savedAns = currentAttempt.answers[q.id]?.selected_option || null;
    const opts = [{k:'A', v:q.option_a}, {k:'B', v:q.option_b}, {k:'C', v:q.option_c}, {k:'D', v:q.option_d}];

    container.innerHTML = opts.map(o => {
        const isChecked = savedAns === o.k;
        return `
            <label onclick="engineSelectOption('${o.k}')" class="flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}">
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${isChecked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-400'}">${o.k}</div>
                <span class="text-sm font-medium text-slate-700">${o.v}</span>
            </label>
        `;
    }).join('');

    renderLiveCaps();
    renderPalette();
}

function renderLiveCaps() {
    const container = document.getElementById('live-caps-container');
    const answers = currentAttempt.answers;
    const questions = currentAttempt.questions;
    const isFull = currentAttempt.mock.section === 'full';
    const countPerPart = (p) => questions.filter(q => q.part === p && (answers[q.id]?.status === 'answered' || answers[q.id]?.status === 'marked')).length;

    if (isFull) {
        container.innerHTML = `
            <div class="flex justify-between items-center"><span>Part A:</span><span class="font-bold font-mono text-indigo-600">${countPerPart('A')}/15</span></div>
            <div class="flex justify-between items-center"><span>Part B:</span><span class="font-bold font-mono text-indigo-600">${countPerPart('B')}/20</span></div>
            <div class="flex justify-between items-center"><span>Part C:</span><span class="font-bold font-mono text-indigo-600">${countPerPart('C')}/20</span></div>
        `;
    } else {
        const activeTotal = questions.filter(q => answers[q.id]?.status === 'answered' || answers[q.id]?.status === 'marked').length;
        container.innerHTML = `<div class="flex justify-between items-center"><span>Total:</span><span class="font-bold font-mono text-indigo-600">${activeTotal}/25</span></div>`;
    }
}

function renderPalette() {
    const container = document.getElementById('palette-grid');
    container.innerHTML = currentAttempt.questions.map((q, idx) => {
        const ans = currentAttempt.answers[q.id];
        let bgClass = 'bg-slate-200 text-slate-600';
        if (currentAttempt.visited[q.id]) bgClass = 'bg-rose-400 text-white';
        if (ans?.status === 'marked') bgClass = 'bg-amber-500 text-white';
        else if (ans?.status === 'answered') bgClass = 'bg-emerald-500 text-white';
        
        return `<button onclick="engineJumpToQuestion(${idx})" class="h-8 w-8 rounded text-xs font-semibold flex items-center justify-center transition-all ${bgClass} ${idx === activeQuestionIndex ? 'ring-2 ring-indigo-600 font-bold' : ''}">${q.q_number}</button>`;
    }).join('');
}

// OPTION SELECTOR INTERACTION (WITH STRICT PART CAPPING PARAMS)
function engineSelectOption(key) {
    const q = currentAttempt.questions[activeQuestionIndex];
    const isFull = currentAttempt.mock.section === 'full';
    
    // Evaluate if the target question already holds a finalized submission state
    const wasAlreadyAnswered = currentAttempt.answers[q.id] && 
          (currentAttempt.answers[q.id].status === 'answered' || currentAttempt.answers[q.id].status === 'marked');

    // Section threshold definitions
    const caps = { 'A': 15, 'B': 20, 'C': 20 };

    if (isFull && !wasAlreadyAnswered) {
        // Query database to evaluate response allocations inside current active domain
        const currentPartCount = currentAttempt.questions.filter(item => {
            const ans = currentAttempt.answers[item.id];
            return item.part === q.part && (ans?.status === 'answered' || ans?.status === 'marked');
        }).length;

        // Raise warning constraints if validation criteria fail
        if (currentPartCount >= caps[q.part]) {
            alert(`Section Limit Reached! You have already answered the maximum allowed ${caps[q.part]} questions in Part ${q.part}. To answer this question, you must first go back and clear your response from another question in Part ${q.part}.`);
            return;
        }
    }

    // Save choice mapping onto matrix parameters
    if (!currentAttempt.answers[q.id]) currentAttempt.answers[q.id] = {};
    currentAttempt.answers[q.id].selected_option = key;
    currentAttempt.answers[q.id].status = 'answered';
    
    syncQuestionState();
}

function engineClearResponse() {
    const q = currentAttempt.questions[activeQuestionIndex];
    if (currentAttempt.answers[q.id]) delete currentAttempt.answers[q.id];
    syncQuestionState();
}

function engineMarkForReview() {
    const q = currentAttempt.questions[activeQuestionIndex];
    
    // Evaluate constraints structure even when tagging layout markers
    const isFull = currentAttempt.mock.section === 'full';
    const wasAlreadyAnswered = currentAttempt.answers[q.id] && 
          (currentAttempt.answers[q.id].status === 'answered' || currentAttempt.answers[q.id].status === 'marked');
    const caps = { 'A': 15, 'B': 20, 'C': 20 };

    if (isFull && !wasAlreadyAnswered) {
        const currentPartCount = currentAttempt.questions.filter(item => {
            const ans = currentAttempt.answers[item.id];
            return item.part === q.part && (ans?.status === 'answered' || ans?.status === 'marked');
        }).length;

        if (currentPartCount >= caps[q.part]) {
            alert(`Section Limit Reached! You cannot mark this question as answered because you have hit the ceiling of ${caps[q.part]} questions in Part ${q.part}.`);
            return;
        }
    }

    if (!currentAttempt.answers[q.id]) currentAttempt.answers[q.id] = { selected_option: null };
    currentAttempt.answers[q.id].status = 'marked';
    syncQuestionState();
}

function engineJumpToQuestion(idx) { activeQuestionIndex = idx; syncQuestionState(); }
function enginePrev() { if (activeQuestionIndex > 0) { activeQuestionIndex--; syncQuestionState(); } }
function engineSaveAndNext() {
    const q = currentAttempt.questions[activeQuestionIndex];
    if (!currentAttempt.answers[q.id]) currentAttempt.answers[q.id] = { selected_option: null, status: 'skipped' };
    if (activeQuestionIndex < currentAttempt.questions.length - 1) { activeQuestionIndex++; syncQuestionState(); }
}

// COMPILATION AND EVALUATION HANDLER
function engineSubmitTrigger(isAutoSubmit) {
    if (!isAutoSubmit && !confirm("Do you want to finalize and submit your test response sheet? This cannot be undone.")) return;
    if (countdownInterval) clearInterval(countdownInterval);

    const { mock, questions, answers, timeSpentPerQuestion } = currentAttempt;
    const isFull = mock.section === 'full';
    let scoredAnswers = {};
    let partCounters = { A: 0, B: 0, C: 0, global: 0 };
    let caps = isFull ? { A: 15, B: 20, C: 20 } : { B: 25, C: 25, global: 25 };
    let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0, finalScore = 0;

    questions.forEach(q => {
        const userAns = answers[q.id];
        
        if (!userAns || userAns.selected_option === null) {
            totalUnattempted++;
            scoredAnswers[q.id] = { selected_option: null, grade_status: 'unattempted', marks_earned: 0 };
            return;
        }

        let exceeded = isFull ? (partCounters[q.part] >= caps[q.part]) : (partCounters.global >= caps.global);
        if (exceeded) {
            scoredAnswers[q.id] = { ...userAns, grade_status: 'exceeded_cap', marks_earned: 0 };
            return;
        }
        
        isFull ? partCounters[q.part]++ : partCounters.global++;
        const isCorrect = userAns.selected_option === q.correct_option;
        const plusVal = isFull ? (q.part === 'A' ? 2 : q.part === 'B' ? 3 : 5) : 3;
        const minusVal = isFull ? (q.part === 'A' ? 0.5 : q.part === 'B' ? 0.75 : 1.5) : 0.75;

        if (isCorrect) {
            totalCorrect++; finalScore += plusVal;
            scoredAnswers[q.id] = { ...userAns, grade_status: 'correct', marks_earned: plusVal };
        } else {
            totalWrong++; finalScore -= minusVal;
            scoredAnswers[q.id] = { ...userAns, grade_status: 'wrong', marks_earned: -minusVal };
        }
    });

    const localAttempts = JSON.parse(localStorage.getItem('csir_attempts')) || [];
    const attemptId = `attempt_${Date.now()}`;
    
    localAttempts.unshift({ 
        id: attemptId, 
        mockId: mock.id, 
        mockTitle: mock.title, 
        user: currentUser?.email || 'guest', 
        timestamp: new Date().toLocaleString(), 
        score: finalScore, 
        correct_count: totalCorrect, 
        wrong_count: totalWrong, 
        scoredAnswers, 
        timeSpentPerQuestion, 
        questions, 
        duration_taken_sec: (mock.duration_min * 60) - currentAttempt.timeLeft 
    });
    
    localStorage.setItem('csir_attempts', JSON.stringify(localAttempts));
    navigateTo('result', { attemptId });
}

// SCORE ANALYSIS METRICS DISPLAY & DETAILED SHEET REPORT
function renderResult(target, attemptId) {
    const localAttempts = JSON.parse(localStorage.getItem('csir_attempts')) || [];
    const record = localAttempts.find(a => a.id === attemptId);
    
    if (!record) {
        target.innerHTML = `<div class="text-center py-12"><p class="text-rose-600 font-bold">Error: Response record not found.</p></div>`;
        return;
    }

    const accuracy = record.correct_count + record.wrong_count > 0 ? ((record.correct_count / (record.correct_count + record.wrong_count)) * 100).toFixed(1) : 0;
    const timePerQMap = record.timeSpentPerQuestion || {};

    const formatDuration = (s) => {
        if(!s || s === 0) return '0s';
        const m = Math.floor(s / 60);
        const remSec = s % 60;
        return m > 0 ? `${m}m ${remSec}s` : `${remSec}s`;
    };

    target.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <button onclick="navigateTo('dashboard')" class="text-sm font-semibold text-indigo-600 hover:text-indigo-800"><i class="fa-solid fa-arrow-left mr-1"></i> Back to Dashboard</button>
                <span class="text-xs font-bold uppercase bg-slate-100 text-slate-600 px-3 py-1 rounded-full"><i class="fa-solid fa-chart-bar mr-1.5 text-indigo-500"></i>Analytical Response Sheet Audit</span>
            </div>

            <div class="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 class="text-xl font-bold">${record.mockTitle}</h2>
                    <p class="text-xs text-slate-400 font-mono mt-1">Profile Email Account: ${record.user} | Compiled: ${record.timestamp}</p>
                </div>
                <div class="bg-white/10 px-6 py-3 rounded-xl text-center shrink-0">
                    <span class="block text-[10px] uppercase tracking-wider text-indigo-200 font-semibold">Final Score Matrix</span>
                    <div class="text-3xl font-extrabold text-emerald-400 font-mono">${record.score.toFixed(2)}</div>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div class="bg-white border p-4 rounded-xl shadow-xs">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Correct Items</span>
                    <div class="text-xl font-bold text-emerald-600 font-mono">${record.correct_count}</div>
                </div>
                <div class="bg-white border p-4 rounded-xl shadow-xs">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Incorrect Items</span>
                    <div class="text-xl font-bold text-rose-600 font-mono">${record.wrong_count}</div>
                </div>
                <div class="bg-white border p-4 rounded-xl shadow-xs">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Precision Acc</span>
                    <div class="text-xl font-bold text-indigo-600 font-mono">${accuracy}%</div>
                </div>
                <div class="bg-white border p-4 rounded-xl shadow-xs">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Time Spent</span>
                    <div class="text-xl font-bold font-mono text-slate-700">${Math.floor(record.duration_taken_sec/60)}m ${record.duration_taken_sec % 60}s</div>
                </div>
            </div>

            <div class="bg-white border rounded-2xl p-5 md:p-6 shadow-xs">
                <h3 class="font-bold text-lg text-slate-900 mb-4 border-b pb-2"><i class="fa-solid fa-list-check mr-2 text-indigo-600"></i>Detailed Answers Evaluation Tracker</h3>
                <div class="space-y-5">
                    ${record.questions.map(q => {
                        const ans = record.scoredAnswers[q.id];
                        const secondsSpent = timePerQMap[q.id] || 0;
                        let badge = '<span class="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded border">Unattempted</span>';
                        let containerBorder = 'border-slate-200';

                        if (ans?.grade_status === 'correct') {
                            badge = `<span class="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-200"><i class="fa-solid fa-check mr-1"></i>Correct (+${ans.marks_earned})</span>`;
                            containerBorder = 'border-emerald-200 bg-emerald-50/10';
                        } else if (ans?.grade_status === 'wrong') {
                            badge = `<span class="bg-rose-50 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded border border-rose-200"><i class="fa-solid fa-xmark mr-1"></i>Incorrect (${ans.marks_earned})</span>`;
                            containerBorder = 'border-rose-200 bg-rose-50/10';
                        } else if (ans?.grade_status === 'exceeded_cap') {
                            badge = `<span class="bg-amber-50 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded border border-amber-200"><i class="fa-solid fa-ban mr-1"></i>Exceeded Stat Cap Limits</span>`;
                            containerBorder = 'border-amber-200 bg-amber-50/10';
                        }
                        
                        return `
                            <div class="border ${containerBorder} rounded-xl p-4 space-y-3 transition-colors">
                                <div class="flex justify-between items-center text-xs font-bold text-slate-400">
                                    <div class="space-x-2">
                                        <span>Part ${q.part} | Question Sequence: #${q.q_number}</span>
                                        <span class="text-slate-500 bg-slate-100/80 rounded px-1.5 py-0.5 text-[11px] font-mono"><i class="fa-regular fa-clock mr-1 text-indigo-500"></i>Time spent: ${formatDuration(secondsSpent)}</span>
                                    </div>
                                    ${badge}
                                </div>
                                <p class="text-sm font-semibold text-slate-800">${q.question_text}</p>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                                    <div class="p-2 rounded border ${ans?.selected_option === 'A' ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-white border-slate-100'}">A. ${q.option_a}</div>
                                    <div class="p-2 rounded border ${ans?.selected_option === 'B' ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-white border-slate-100'}">B. ${q.option_b}</div>
                                    <div class="p-2 rounded border ${ans?.selected_option === 'C' ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-white border-slate-100'}">C. ${q.option_c}</div>
                                    <div class="p-2 rounded border ${ans?.selected_option === 'D' ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-white border-slate-100'}">D. ${q.option_d}</div>
                                </div>

                                <div class="flex flex-wrap gap-4 text-xs font-bold pt-1">
                                    <span class="text-slate-500">Your Choice: <span class="font-mono ${ans?.selected_option === q.correct_option ? 'text-emerald-600' : 'text-rose-600'}">${ans?.selected_option || 'None Selected'}</span></span>
                                    <span class="text-indigo-600">Correct Configuration Key: <span class="font-mono">${q.correct_option}</span></span>
                                </div>

                                <div class="bg-slate-100/70 p-3 rounded-lg text-xs border border-slate-200 mt-2">
                                    <p class="text-slate-700 leading-relaxed"><strong>Solution Analytical Exposition:</strong> ${q.explanation}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderHistory(target) {
    const localAttempts = JSON.parse(localStorage.getItem('csir_attempts')) || [];
    const userRecords = localAttempts.filter(a => a.user === (currentUser?.email || 'guest'));

    if(userRecords.length === 0) {
        target.innerHTML = `<div class="text-center py-12 bg-white border rounded-2xl shadow-xs"><h3 class="font-bold text-slate-500">No history submissions mapped to this user profile.</h3></div>`;
        return;
    }
    target.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-xl font-bold">User Test Repository History</h2>
            <div class="bg-white border rounded-2xl overflow-hidden shadow-xs">
                <table class="w-full text-left text-xs border-collapse">
                    <tr class="bg-slate-50 border-b font-bold text-slate-600"><th class="p-3">Title</th><th class="p-3">Date</th><th class="p-3">Score</th><th class="p-3">Link</th></tr>
                    ${userRecords.map(r => `<tr><td class="p-3 font-bold text-slate-800">${r.mockTitle}</td><td class="p-3 text-slate-500">${r.timestamp}</td><td class="p-3 font-bold text-emerald-600 font-mono">${r.score.toFixed(2)}</td><td class="p-3"><button onclick="navigateTo('result', {attemptId: '${r.id}'})" class="text-indigo-600 hover:text-indigo-800 font-semibold underline">Review Sheet</button></td></tr>`).join('')}
                </table>
            </div>
        </div>
    `;
}

// =========================================================================
// OFFICIAL HIGH-FIDELITY GATE/TCS ION SCIENTIFIC CALCULATOR SYSTEM LOGIC
// =========================================================================

function toggleCalculator() { 
    document.getElementById('calc-widget').classList.toggle('hidden'); 
}

// Toggle Degrees / Radians active modes
function setAngleMode(mode) {
    angleMode = mode;
    document.getElementById('calc-mode-indicator').innerText = `ANGLE: ${mode.toUpperCase()}`;
}

// Write expression characters into input screen
function calcInput(char) {
    const screen = document.getElementById('calc-screen');
    if (screen.value === '0' && char !== '.' && !isNaN(char)) {
        screen.value = '';
    }
    screen.value += char;
}

// Standard prefix math functions (e.g. sin, cos, log)
function calcFunc(funcName) {
    const screen = document.getElementById('calc-screen');
    if (screen.value === '0') {
        screen.value = '';
    }
    screen.value += funcName;
}

// Clear single backspace character from entry display
function calcBackspace() {
    const screen = document.getElementById('calc-screen');
    screen.value = screen.value.slice(0, -1);
    if (screen.value === '') {
        screen.value = '0';
    }
}

// Reset operational screen parameters
function calcClear() {
    document.getElementById('calc-screen').value = '0';
}

// Reset both screen input as well as historical expression string
function calcAllClear() {
    document.getElementById('calc-screen').value = '0';
    document.getElementById('calc-history').innerText = '';
}

// Manage Memory Buffer MC, MR, MS, M+, M-
function calcMemory(type) {
    const screen = document.getElementById('calc-screen');
    const indicator = document.getElementById('calc-mem-indicator');
    const currentVal = parseFloat(screen.value) || 0;

    switch (type) {
        case 'MC':
            memoryValue = 0;
            indicator.classList.add('hidden');
            break;
        case 'MR':
            screen.value = memoryValue.toString();
            break;
        case 'MS':
            memoryValue = currentVal;
            if (memoryValue !== 0) indicator.classList.remove('hidden');
            else indicator.classList.add('hidden');
            break;
        case 'M+':
            memoryValue += currentVal;
            if (memoryValue !== 0) indicator.classList.remove('hidden');
            break;
        case 'M-':
            memoryValue -= currentVal;
            if (memoryValue !== 0) indicator.classList.remove('hidden');
            break;
    }
}

// Custom Expression Parsing using MathJS wrapper injecting Angle scopes dynamically
function calcEvaluate() {
    const screen = document.getElementById('calc-screen');
    const history = document.getElementById('calc-history');
    const rawExpression = screen.value;

    if (!rawExpression || rawExpression === '0') return;

    try {
        // Construct dynamic custom scope matching standard mathematical properties of GATE exam
        const conversionFactor = angleMode === 'deg' ? (Math.PI / 180) : 1;
        const invConversionFactor = angleMode === 'deg' ? (180 / Math.PI) : 1;

        // Custom math scopes override for DEG angle parsing rules
        const customScope = {
            sin: (x) => Math.sin(x * conversionFactor),
            cos: (x) => Math.cos(x * conversionFactor),
            tan: (x) => Math.tan(x * conversionFactor),
            asin: (x) => Math.asin(x) * invConversionFactor,
            acos: (x) => Math.acos(x) * invConversionFactor,
            atan: (x) => Math.atan(x) * invConversionFactor,
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            asinh: Math.asinh,
            acosh: Math.acosh,
            atanh: Math.atanh,
            log: (x) => Math.log10(x), // log maps standard to log base 10
            ln: Math.log,             // ln maps to natural log
            sqrt: Math.sqrt,
            cbrt: Math.cbrt,
            pi: Math.PI,
            e: Math.E
        };

        // Standardize factorials formatting safely
        let mathExpression = rawExpression;

        // Evaluate using math.js with customized trig degree bindings
        let result = math.evaluate(mathExpression, customScope);

        // Render visual outcomes matching TCS platform styles
        history.innerText = `${rawExpression} =`;
        screen.value = Number(result.toFixed(8)).toString(); // Max decimal accuracy limit set at 8 units
    } catch (err) {
        screen.value = 'Error';
        setTimeout(calcClear, 1200);
    }
}

// DRAGGABLE CALCULATOR WIDGET HOOK
const widget = document.getElementById('calc-widget'), header = document.getElementById('calc-header');
let drag = false, sx, sy, ix, iy;
header.addEventListener('mousedown', e => { 
    drag = true; 
    sx = e.clientX; 
    sy = e.clientY; 
    ix = widget.offsetLeft; 
    iy = widget.offsetTop; 
    document.addEventListener('mousemove', dragMove); 
    document.addEventListener('mouseup', dragEnd); 
});
function dragMove(e) { 
    if (!drag) return; 
    widget.style.left = `${ix + (e.clientX - sx)}px`; 
    widget.style.top = `${iy + (e.clientY - sy)}px`; 
    widget.style.bottom = widget.style.right = 'auto'; 
}
function dragEnd() { 
    drag = false; 
    document.removeEventListener('mousemove', dragMove); 
    document.removeEventListener('mouseup', dragEnd); 
}

window.onload = initApp;

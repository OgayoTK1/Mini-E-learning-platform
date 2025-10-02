/*
 Improved script.js:
 - Realistic courses (more titles)
 - Lessons include notes/content and can be opened in-course
 - Clearer quiz questions and scoring
 - Persistent courses + user data in localStorage
 - Single clean initialization and global functions used by index.html:
    window.loginUser, window.showHome, window.showLeaderboard
*/
const STORAGE_COURSES_KEY = 'me_courses_v1';
const STORAGE_USER_KEY = 'me_user_v1';

// Default realistic courses with lessons (notes) and quizzes
const DEFAULT_COURSES = [
    {
        id: 1,
        title: "Introduction to JavaScript",
        description: "Learn JavaScript fundamentals, the DOM, and how to build interactive pages.",
        lessons: [
            { title: "What is JavaScript?", notes: "JavaScript is a scripting language that runs in the browser. It allows you to change page content, respond to user actions, and communicate with servers." },
            { title: "Variables & Data Types", notes: "Use let/const to declare variables. Common types: string, number, boolean, null, undefined, object, array." },
            { title: "Functions & Scope", notes: "Functions encapsulate behavior. Understand local vs global scope and closures." },
            { title: "DOM Basics", notes: "Document Object Model (DOM) represents the HTML structure. Use document.querySelector and element.addEventListener to interact with the page." }
        ],
        quizzes: [
            { question: "Which keyword declares a block-scoped variable?", options: ["var", "let", "function"], correct: 1 },
            { question: "What will console.log(typeof []) print?", options: ["array", "object", "list"], correct: 1 }
        ],
        pointsAwarded: 120,
        badge: "JS Starter",
        progress: 0,
        completed: false,
        quizScore: 0
    },
    {
        id: 2,
        title: "Modern CSS Techniques",
        description: "Layouts, Flexbox, Grid, responsive units and animations for modern UI.",
        lessons: [
            { title: "Box Model & Units", notes: "Understand content, padding, border, margin. Use rem/em for scalable layouts." },
            { title: "Flexbox Essentials", notes: "Flexbox helps distribute space in one-dimensional layouts (rows/columns). key properties: display:flex, justify-content, align-items." },
            { title: "Grid Layout", notes: "CSS Grid enables two-dimensional layouts with grid-template-columns/rows and grid areas." },
            { title: "Transitions & Animations", notes: "Use transition for simple effects and @keyframes for complex animations." }
        ],
        quizzes: [
            { question: "Which property centers flex items horizontally?", options: ["align-items", "justify-content", "flex-direction"], correct: 1 },
            { question: "Which unit is relative to the root font-size?", options: ["em", "rem", "px"], correct: 1 }
        ],
        pointsAwarded: 150,
        badge: "CSS Designer",
        progress: 0,
        completed: false,
        quizScore: 0
    },
    {
        id: 3,
        title: "HTML5 Essentials",
        description: "Semantic HTML, forms, accessibility, and multimedia elements.",
        lessons: [
            { title: "Semantic Elements", notes: "Use header, nav, main, article, section, footer for meaning and accessibility." },
            { title: "Forms & Validation", notes: "Use input types, labels, and built-in validation attributes like required and pattern." },
            { title: "Media Elements", notes: "Use <video> and <audio> with controls attribute; provide captions for accessibility." }
        ],
        quizzes: [
            { question: "Which element is used for the main site content?", options: ["<main>", "<section>", "<div>"], correct: 0 },
            { question: "Which attribute makes an input required?", options: ["required", "validate", "mandatory"], correct: 0 }
        ],
        pointsAwarded: 100,
        badge: "HTML Pro",
        progress: 0,
        completed: false,
        quizScore: 0
    },
    {
        id: 4,
        title: "Python Basics",
        description: "Intro to Python syntax, data structures, and simple scripting.",
        lessons: [
            { title: "Python Syntax & Variables", notes: "Python uses indentation. Variables are dynamically typed." },
            { title: "Lists & Dictionaries", notes: "Lists are ordered collections; dictionaries are key-value stores." },
            { title: "Control Flow", notes: "if/elif/else and loops (for, while) control execution flow." }
        ],
        quizzes: [
            { question: "Which symbol starts a comment in Python?", options: ["//", "#", "/*"], correct: 1 },
            { question: "Which data structure maps keys to values?", options: ["list", "tuple", "dictionary"], correct: 2 }
        ],
        pointsAwarded: 140,
        badge: "Python Novice",
        progress: 0,
        completed: false,
        quizScore: 0
    },
    {
        id: 5,
        title: "Git & GitHub Fundamentals",
        description: "Version control with Git, branching, commits and collaborating on GitHub.",
        lessons: [
            { title: "What is Git?", notes: "Git is a distributed version control system. Track history and collaborate safely." },
            { title: "Common Commands", notes: "git init, git add, git commit, git push, git pull, git branch, git merge." },
            { title: "Working with GitHub", notes: "Create repositories, open pull requests, and use issues to track work." }
        ],
        quizzes: [
            { question: "Which command stages changes for commit?", options: ["git commit", "git add", "git push"], correct: 1 },
            { question: "Where do you open a pull request?", options: ["Local repo", "GitHub UI", "Terminal only"], correct: 1 }
        ],
        pointsAwarded: 130,
        badge: "Version Control",
        progress: 0,
        completed: false,
        quizScore: 0
    }
];

// Mock leaderboard data (kept for demonstration)
const MOCK_LEADERBOARD = [
    { username: 'Alice', totalPoints: 2500, level: 3, streak: 14 },
    { username: 'Bob', totalPoints: 1800, level: 2, streak: 7 },
    { username: 'Charlie', totalPoints: 1200, level: 2, streak: 3 }
];

// Load/save helpers
function loadCourses() {
    try {
        const raw = localStorage.getItem(STORAGE_COURSES_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(DEFAULT_COURSES));
            return JSON.parse(JSON.stringify(DEFAULT_COURSES));
        }
        const parsed = JSON.parse(raw);
        // Ensure all default structure exists for compatibility
        const merged = DEFAULT_COURSES.map(def => {
            const existing = parsed.find(c => c.id === def.id);
            return existing ? { ...def, ...existing } : def;
        });
        return merged;
    } catch (e) {
        console.error('Error loading courses:', e);
        return JSON.parse(JSON.stringify(DEFAULT_COURSES));
    }
}
function saveCourses(courses) {
    localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(courses));
}
function loadUser() {
    try {
        const raw = localStorage.getItem(STORAGE_USER_KEY);
        if (!raw) return { username: null, totalPoints: 0, level: 1, streak: 0, lastActivity: null, badges: [] };
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error loading user:', e);
        return { username: null, totalPoints: 0, level: 1, streak: 0, lastActivity: null, badges: [] };
    }
}
function saveUser(user) {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

// App state
let courses = loadCourses();
let userData = loadUser();
let currentCourse = null;

// Notification utility
function showNotification(message, type = 'info', timeout = 3500) {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.textContent = message;
    container.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transform = 'translateX(30px)';
        setTimeout(() => n.remove(), 300);
    }, timeout);
}

// Rendering functions
function renderProfile() {
    if (!userData.username) return;
    document.getElementById('profile-username').textContent = `Welcome, ${userData.username}!`;
    document.getElementById('total-points').textContent = userData.totalPoints;
    document.getElementById('user-level').textContent = userData.level;
    document.getElementById('user-streak').textContent = userData.streak;
    const badgesList = document.getElementById('badges-list');
    badgesList.innerHTML = userData.badges.map(b => `<span class="badge">${b}</span>`).join('');
    document.getElementById('header').style.display = 'block';
}

function computeLevel(points) {
    return Math.floor(points / 1000) + 1;
}

function awardPoints(points) {
    if (!points || points <= 0) return;
    const prevLevel = userData.level;
    userData.totalPoints += points;
    userData.level = computeLevel(userData.totalPoints);
    saveUser(userData);
    renderProfile();
    if (userData.level > prevLevel) {
        showNotification(`Level Up! Now Level ${userData.level} 🎉`, 'success');
    }
    showNotification(`+${points} points`, 'info');
}

function unlockBadge(name) {
    if (!name || userData.badges.includes(name)) return;
    userData.badges.push(name);
    saveUser(userData);
    renderProfile();
    showNotification(`Badge earned: ${name} 🏆`, 'success');
}

function updateStreakOnActivity() {
    const today = new Date().toISOString().split('T')[0];
    if (!userData.lastActivity) {
        userData.streak = 1;
        userData.lastActivity = today;
    } else if (userData.lastActivity !== today) {
        const lastDate = new Date(userData.lastActivity);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) userData.streak++;
        else userData.streak = 1;
        userData.lastActivity = today;
    }
    saveUser(userData);
}

// Home rendering: course cards
function renderHome() {
    const courseList = document.getElementById('course-list');
    courseList.innerHTML = '';
    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = `course-card ${course.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <h3>${escapeHtml(course.title)}</h3>
            <p>${escapeHtml(course.description)}</p>
            <div class="progress"><div class="progress-bar" style="width:${course.progress}%"></div></div>
            <small>Progress: ${course.progress}%</small>
        `;
        card.addEventListener('click', () => showCourseDetail(course.id));
        courseList.appendChild(card);
    });
    renderProfile();
}

// Escape helper
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Show course detail with lessons and quiz
function showCourseDetail(courseId) {
    const course = courses.find(c => c.id === Number(courseId));
    if (!course) return;
    currentCourse = course;

    document.getElementById('home-page').style.display = 'none';
    document.getElementById('leaderboard-page').style.display = 'none';
    document.getElementById('course-detail').style.display = 'block';

    const content = document.getElementById('course-detail-content');
    content.innerHTML = `
        <div class="course-description">
            <h2>${escapeHtml(course.title)}</h2>
            <p>${escapeHtml(course.description)}</p>
        </div>
        <div class="progress-section ${course.completed ? 'completed' : ''}">
            <h3>Progress</h3>
            <div class="progress"><div class="progress-bar" style="width:${course.progress}%"></div></div>
            <small>${course.progress}% Complete ${course.completed ? '(Completed ✓)' : ''}</small>
            ${course.quizScore ? `<p class="score-display">Quiz Score: ${course.quizScore}/${course.quizzes.length}</p>` : ''}
        </div>
        <div class="lessons-list">
            <h3>Lessons</h3>
            <div id="lessons-container">
                ${course.lessons.map((l, i) => `<div class="lesson-item" data-lesson="${i}">${escapeHtml(l.title)}</div>`).join('')}
            </div>
            <div id="lesson-notes" style="margin-top:12px; display:none;" class="course-description"></div>
        </div>
        <div class="quiz-section">
            <h3>Quiz</h3>
            <form id="quiz-form">
                ${course.quizzes.map((q, idx) => `
                    <div class="quiz-question">
                        <h4>Q${idx + 1}: ${escapeHtml(q.question)}</h4>
                        ${q.options.map((opt, oidx) => `
                            <label class="quiz-option">
                                <input type="radio" name="q${idx}" value="${oidx}">
                                ${escapeHtml(opt)}
                            </label>
                        `).join('')}
                        <div id="result-${idx}" class="quiz-results" style="display:none"></div>
                    </div>
                `).join('')}
                <button type="button" class="submit-quiz-btn" id="submit-quiz">${course.quizScore ? 'Retake Quiz' : 'Submit Quiz'}</button>
            </form>
        </div>
        <button class="complete-btn ${course.completed ? 'completed' : ''}" id="manual-complete" ${course.progress < 70 ? 'disabled' : ''}>
            ${course.completed ? 'Completed ✓' : 'Mark as Completed'}
        </button>
    `;

    // Lesson click handler
    const lessonsContainer = content.querySelector('#lessons-container');
    const lessonNotes = content.querySelector('#lesson-notes');
    lessonsContainer.querySelectorAll('.lesson-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = Number(el.getAttribute('data-lesson'));
            const lesson = course.lessons[idx];
            lessonNotes.style.display = 'block';
            lessonNotes.innerHTML = `<h4>${escapeHtml(lesson.title)}</h4><p>${escapeHtml(lesson.notes)}</p>`;
            // mark small progress for viewing lessons (e.g., +5% per lesson viewed, capped)
            const increment = Math.round(100 / (course.lessons.length * 5)); // small increment
            course.progress = Math.min(100, course.progress + 5);
            saveCourses(courses);
            // update progress bar visually without re-rendering whole page
            const bar = content.querySelector('.progress-bar');
            if (bar) bar.style.width = course.progress + '%';
            // update home cards if present
            const homeBar = document.querySelector(`.course-card h3`) ? null : null;
        });
    });

    // Quiz submit handler
    const submitBtn = content.querySelector('#submit-quiz');
    submitBtn.addEventListener('click', () => {
        const form = content.querySelector('#quiz-form');
        const answers = course.quizzes.map((q, idx) => {
            const val = form[`q${idx}`]?.value;
            return val === undefined || val === '' ? null : Number(val);
        });

        // Validate all answered
        if (answers.some(a => a === null)) {
            showNotification('Please answer all questions before submitting.', 'error');
            return;
        }

        updateStreakOnActivity();

        // Evaluate
        let score = 0;
        course.quizzes.forEach((q, idx) => {
            const resDiv = content.querySelector(`#result-${idx}`);
            if (answers[idx] === q.correct) {
                score++;
                resDiv.textContent = 'Correct ✓';
                resDiv.className = 'quiz-results correct';
            } else {
                resDiv.textContent = `Incorrect — correct: ${q.options[q.correct]}`;
                resDiv.className = 'quiz-results incorrect';
            }
            resDiv.style.display = 'block';
        });

        // Points: 15 per correct + streak bonus (3 per day, capped 30)
        const streakBonus = Math.min(userData.streak * 3, 30);
        const points = (score * 15) + streakBonus;

        awardPoints(points);
        course.quizScore = score;
        // Update progress: percent of correct answers
        course.progress = Math.round((score / course.quizzes.length) * 100);
        course.completed = course.progress >= 70;
        if (course.completed) unlockBadge(course.badge);
        saveCourses(courses);
        // Refresh detail view to show updated values
        showCourseDetail(course.id);
        // Refresh home list
        renderHome();
    });

    // Manual completion
    const manualBtn = content.querySelector('#manual-complete');
    manualBtn.addEventListener('click', () => {
        if (course.progress >= 70 && !course.completed) {
            course.completed = true;
            saveCourses(courses);
            awardPoints(Math.round(course.pointsAwarded * (course.progress / 100)));
            unlockBadge(course.badge);
            showCourseDetail(course.id);
            renderHome();
        }
    });
}

// Leaderboard rendering
function showLeaderboard() {
    updateStreakOnActivity();
    const content = document.getElementById('leaderboard-content');
    const full = [...MOCK_LEADERBOARD];
    if (userData.username) {
        full.push({
            username: userData.username,
            totalPoints: userData.totalPoints,
            level: userData.level,
            streak: userData.streak
        });
    }
    full.sort((a, b) => b.totalPoints - a.totalPoints);

    const rows = full.map((u, idx) => `
        <tr ${u.username === userData.username ? 'class="your-rank"' : ''}>
            <td class="rank">#${idx + 1}</td>
            <td>${escapeHtml(u.username)}</td>
            <td>${u.totalPoints}</td>
            <td>${u.level}</td>
            <td>${u.streak} days</td>
        </tr>
    `).join('');

    content.innerHTML = `
        <h2>Global Leaderboard</h2>
        <table class="leaderboard-table">
            <thead>
                <tr><th>Rank</th><th>Username</th><th>Points</th><th>Level</th><th>Streak</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    document.getElementById('home-page').style.display = 'none';
    document.getElementById('leaderboard-page').style.display = 'block';
    document.getElementById('course-detail').style.display = 'none';
}

// Login handler (exposed globally)
window.loginUser = function () {
    const input = document.getElementById('username-input');
    const name = (input?.value || '').trim();
    const errorEl = document.getElementById('login-error');
    if (!name || name.length < 3) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }
    if (errorEl) errorEl.style.display = 'none';

    userData.username = name;
    saveUser(userData);
    showNotification(`Welcome, ${name}!`, 'success');
    // Show header and home
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('header').style.display = 'block';
    renderHome();
    saveCourses(courses);
    renderProfile();
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('leaderboard-page').style.display = 'none';
    document.getElementById('course-detail').style.display = 'none';
};

// Show home (exposed)
window.showHome = function () {
    if (!userData.username) {
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('header').style.display = 'none';
        return;
    }
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('leaderboard-page').style.display = 'none';
    document.getElementById('course-detail').style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    renderHome();
};

// Expose leaderboard globally (used by index.html button)
window.showLeaderboard = showLeaderboard;

// Initialization on load
document.addEventListener('DOMContentLoaded', () => {
    // If user already logged in, go to home
    if (userData.username) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('header').style.display = 'block';
        renderHome();
    } else {
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('header').style.display = 'none';
    }
});
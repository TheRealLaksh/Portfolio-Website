/*
    assets/js/script.js
    ---------------------
    Purpose: DOM behaviors and page interactions for Portfolio-Website.
*/

document.addEventListener('DOMContentLoaded', () => {

    // =================================================
    // 1. PRELOADER LOGIC (LAKSH Auto-Scan + Progress)
    // =================================================
    const preloader = document.getElementById('preloader');
    const percentText = document.getElementById('loader-percent');
    const bar = document.getElementById('loader-bar');
    const loaderSpotlight = document.getElementById('loaderSpotlight'); // Spotlight for the loader

    if (preloader && percentText && bar) {
        let progress = 0;
        let scanPos = 0;
        let direction = 1;

        // Function for animating the LAKSH SVG spotlight
        const animateSpotlight = () => {
            if (loaderSpotlight) {
                scanPos += 1.5 * direction; // Speed of scan
                if (scanPos >= 100 || scanPos <= 0) direction *= -1;
                loaderSpotlight.setAttribute('cx', `${scanPos}%`);
                // Use requestAnimationFrame to loop the spotlight animation
                requestAnimationFrame(animateSpotlight);
            }
        };

        // Start the LAKSH spotlight animation immediately
        if (loaderSpotlight) {
            animateSpotlight();
        }

        // Timer for Progress Bar (Controls the 2-second delay)
        // FIX: The loader now runs on a strict timer to guarantee the 2-second minimum duration.
        const progressTimer = setInterval(() => {
            progress += Math.random() * 4; // Increments progress
            if (progress > 100) progress = 100;

            // Update UI
            percentText.textContent = `${Math.floor(progress)}%`;
            bar.style.width = `${progress}%`;

            if (progress === 100) {
                clearInterval(progressTimer);

                // Start fade-out process
                setTimeout(() => {
                    preloader.style.opacity = '0'; // Start CSS fade out
                    preloader.classList.add('pointer-events-none');

                    // Final removal after CSS transition completes
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 700);
                }, 500); // 0.5s delay to show 100%
            }
        }, 50); // Updates every 50ms, resulting in approx 2.5s total visible time.
    }

    // ---------------------------
    // 3. AOS INIT
    // ---------------------------
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 30, easing: 'ease-out-cubic' });
    }

    // ---------------------------
    // 4. HERO TYPING (Existing Logic)
    // ---------------------------
    const typedTextElement = document.getElementById('typed-text');
    if (typedTextElement && typeof Typed !== 'undefined') {
        new Typed('#typed-text', {
            strings: ['a Web Developer', 'an Aspiring AI/ML Engineer', 'a Passionate Learner'],
            typeSpeed: 40,
            backSpeed: 30,
            backDelay: 2000,
            loop: true
        });
    }
    // ---------------------------
    // 5. EXPANDABLE TABS SCROLL SPY (FIXED)
    // ---------------------------
    const sections = document.querySelectorAll("section");
    const navTabs = document.querySelectorAll(".expandable-tab");

    const updateActiveTab = () => {
        let current = "";
        const scrollPosition = window.pageYOffset;

        // Adjusted offset to 100px (approx header height/visual space) instead of 350px
        const offset = 100;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            // Logic: If scroll is within this section's top and bottom boundaries
            if (scrollPosition >= (sectionTop - offset) && scrollPosition < (sectionTop + sectionHeight - offset)) {
                current = section.getAttribute("id");
            }
        });

        // Fallback: If user is at the very bottom of page, activate the last tab (Contact)
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            current = "contact";
        }

        navTabs.forEach((tab) => {
            tab.classList.remove("active");
            // Check if the tab matches the current section
            if (tab.getAttribute("href") === `#${current}`) {
                tab.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", updateActiveTab);
    updateActiveTab(); // Initial call

    // ---------------------------
    // 6. FETCH PROJECTS
    // ---------------------------
    loadProjectsFromGitHub();


    // =================================================
    // 7. TIMELINE ANIMATION (Existing Logic)
    // =================================================
    const observerOptions = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                if (entry.target.classList.contains('timeline-container')) {
                    const fillLine = document.getElementById('timeline-line-fill');
                    if (fillLine) fillLine.style.transform = 'scaleY(1)';
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.timeline-item, .timeline-container').forEach(el => observer.observe(el));


    // =================================================
    // 8. AJAX CONTACT FORM (Existing Logic)
    // =================================================
    const form = document.querySelector('form[action*="formspree"]');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = 'Sending...';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    form.reset();
                    btn.innerHTML = `
                        <div class="flex items-center gap-2 text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span>Message Sent!</span>
                        </div>
                    `;
                    setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 5000);
                } else {
                    throw new Error('Failed');
                }
            } catch (err) {
                btn.innerHTML = 'Error. Try again.';
                btn.disabled = false;
                setTimeout(() => { btn.innerHTML = originalText; }, 3000);
            }
        });
    }


    // =================================================
    // 9. SPOTIFY WIDGET (Via Last.fm API) - The Easy Way
    // =================================================
    async function checkSpotify() {
        const widget = document.getElementById('spotify-widget');
        const songEl = document.getElementById('spotify-song');
        const artistEl = document.getElementById('spotify-artist');
        const coverEl = document.getElementById('spotify-cover');

        // 👉 REPLACE THESE TWO VALUES:
        const username = 'lakshp';
        const apiKey = '0b1d51f7f741582cd0895125d1da45c3';

        if (!widget) return;

        const API_URL = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            const track = data.recenttracks.track[0];

            // Check if music is currently playing (Last.fm adds '@attr': { nowplaying: "true" } if playing)
            const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';

            if (isPlaying) {
                // Reveal widget
                widget.classList.remove('hidden');
                widget.classList.add('flex');

                // Update text
                songEl.textContent = track.name;
                artistEl.textContent = track.artist['#text'];

                // Update image (Last.fm provides multiple sizes, 'extralarge' is usually good quality)
                const image = track.image.find(img => img.size === 'extralarge')['#text'];
                if (image) {
                    coverEl.src = image;
                    coverEl.classList.add('animate-[spin_6s_linear_infinite]');
                }

                // Link to song
                widget.onclick = () => window.open(track.url, '_blank');
                widget.style.cursor = 'pointer';

            } else {
                // Hide widget if not playing
                widget.classList.add('hidden');
                widget.classList.remove('flex');
            }
        } catch (e) {
            console.error("Spotify/Last.fm Widget Error:", e);
            widget.classList.add('hidden');
        }
    }

    // Run immediately, then check every 10 seconds
    checkSpotify();
    setInterval(checkSpotify, 10000);

    // =================================================
    // 10. SERVICE WORKER (PWA)
    // =================================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker failed', err));
    }

});

// ===============================================================
//  ⭐ GITHUB REPO DATA FUNCTIONS (Outside DOMContentLoaded) ⭐
// ===============================================================

const REPOS = [
    "TheRealLaksh/Portfolio-Website",
    "TheRealLaksh/Artist-Portfolio",
    "TheRealLaksh/Callender-Events",
    "TheRealLaksh/Music-Player",
    "TheRealLaksh/Shopping-demo",
    "TheRealLaksh/code-and-canvas-blog"
];

const GITHUB_TOKEN = null; // optional

async function fetchRepoData(ownerRepo) {
    const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};
    const [owner, repo] = ownerRepo.split("/");
    const base = `https://api.github.com/repos/${owner}/${repo}`;

    try {
        const r1 = await fetch(base, { headers });
        if (!r1.ok) throw new Error("GitHub error loading " + ownerRepo);
        const info = await r1.json();

        let languages = [];
        try {
            const r2 = await fetch(`${base}/languages`, { headers });
            languages = Object.keys(await r2.json());
        } catch (_) {
            languages = info.language ? [info.language] : [];
        }

        return {
            name: info.name,
            genre: guessGenre(repo),
            description: info.description || "No description provided.",
            languages: languages.length ? languages : [info.language || "Unknown"],
            html_url: info.html_url,
            homepage: info.homepage || "",
            stars: info.stargazers_count || 0,
            status: info.homepage ? "Live" : "Repo"
        };
    } catch (error) {
        console.warn(`Skipping ${ownerRepo}: ${error.message}`);
        return null;
    }
}

function guessGenre(name) {
    name = name.toLowerCase();
    if (name.includes("music")) return "music";
    if (name.includes("artist")) return "art";
    if (name.includes("calendar") || name.includes("callender")) return "calendar";
    if (name.includes("shop")) return "shop";
    if (name.includes("blog") || name.includes("canvas")) return "blog";
    return "code";
}

async function loadProjectsFromGitHub() {
    const grid = document.getElementById("github-projects-grid");

    // --- STEP 1: Fetch all data concurrently and filter out failures ---
    try {
        const results = await Promise.all(REPOS.map(r => fetchRepoData(r)));
        window.myProjects = results.filter(r => r !== null);
    } catch (e) {
        console.error("Critical GitHub fetch failed:", e);
        if (grid) grid.innerHTML = `<p class="text-red-400 col-span-full text-center py-10">⚠️ Failed to connect to GitHub API. Projects cannot be loaded right now.</p>`;
        window.myProjects = [];
        return;
    }

    // --- STEP 2: Render results ---
    if (!window.myProjects || window.myProjects.length === 0) {
        if (grid) grid.innerHTML = `<p class="text-red-400 col-span-full text-center py-10">
            No projects loaded. All requested GitHub repositories might be private or the API limit has been reached.
         </p>`;
        return;
    }

    if (grid) grid.innerHTML = "";
    loadPremiumProjects();
}

function loadPremiumProjects() {
    const projectsGrid = document.getElementById('github-projects-grid');
    if (!projectsGrid || !window.myProjects) return;

    const icons = {
        code: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />`,
        art: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
        calendar: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`,
        music: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />`,
        shop: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />`,
        blog: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />`
    };

    // Map for specific language colors
    const langColors = {
        JavaScript: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
        HTML: "text-orange-300 bg-orange-500/10 border-orange-500/20",
        CSS: "text-blue-300 bg-blue-500/10 border-blue-500/20",
        Python: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
        TypeScript: "text-blue-400 bg-blue-600/10 border-blue-600/20",
        Vue: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
        React: "text-sky-300 bg-sky-500/10 border-sky-500/20",
        Java: "text-red-300 bg-red-500/10 border-red-500/20",
        // Default fallback
        default: "text-zinc-300 bg-zinc-800/80 border-zinc-700/50"
    };

    projectsGrid.innerHTML = "";

    window.myProjects.forEach(repo => {

        const languagesHtml = repo.languages
            .slice(0, 3)
            .map(lang => {
                // Determine color class based on map, fallback to default if not found
                const colorClass = langColors[lang] || langColors.default;
                return `<span class="text-[10px] font-medium px-2 py-1 rounded border ${colorClass}">${lang}</span>`;
            })
            .join("");

        // New Live Demo Button Style (Emerald Theme)
        const liveIcon = repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer"
                class="group relative flex items-center justify-start w-10 hover:w-28 h-10 bg-slate-800/50 border border-slate-700 rounded-full overflow-hidden transition-all duration-500 ease-out hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-900/20">
                <div class="absolute inset-0 w-full h-full bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="w-10 h-10 flex items-center justify-center shrink-0 z-10 group-hover:text-emerald-400 text-slate-400 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </div>
                <span class="opacity-0 group-hover:opacity-100 text-emerald-400 font-medium text-xs whitespace-nowrap transition-all duration-500 delay-100 absolute left-10">
                    Live Demo
                </span>
            </a>
        ` : "";

        // New GitHub Button Style (Green Theme)
        const githubIcon = `
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer"
                class="group relative flex items-center justify-start w-10 hover:w-24 h-10 bg-slate-800/50 border border-slate-700 rounded-full overflow-hidden transition-all duration-500 ease-out hover:border-green-500/50 shadow-lg hover:shadow-green-900/20">
                <div class="absolute inset-0 w-full h-full bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="w-10 h-10 flex items-center justify-center shrink-0 z-10 group-hover:text-green-400 text-slate-400 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.7.4-1.1.7-1.4-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.1-3.3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3.4 1.2a11.5 11.5 0 0 1 6.2 0c2.5-1.5 3.4-1.2 3.4-1.2.6 1.6.2 2.8.1 3.1.7.9 1.1 2 1.1 3.3 0 4.6-2.8 5.6-5.5 5.9.4.3.8 1 .8 2v3c0 .4.2.7.8.6 4.6-1.5 7.9-5.9 7.9-10.9C23.5 5.65 18.35.5 12 .5z" />
                    </svg>
                </div>
                <span class="opacity-0 group-hover:opacity-100 text-green-400 font-medium text-xs whitespace-nowrap transition-all duration-500 delay-100 absolute left-10">
                    Code
                </span>
            </a>
        `;

        const cardHTML = `
            <div class="group relative flex flex-col h-full bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-500 hover:border-zinc-600 hover:shadow-2xl hover:-translate-y-1" data-aos="fade-up">

                <div class="p-6 flex flex-col flex-grow">

                    <div class="flex justify-between items-start mb-5">
                        <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-600 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                ${icons[repo.genre]}
                            </svg>
                        </div>

                        <div class="flex gap-3 items-center h-10">
                            ${liveIcon}
                            ${githubIcon}
                        </div>
                    </div>

                    <h3 class="text-lg font-bold text-white mb-3 tracking-tight group-hover:text-sky-100 transition-colors">
                        ${repo.name}
                    </h3>

                    <p class="text-sm text-zinc-300 leading-relaxed font-light opacity-90 flex-grow">
                        ${repo.description}
                    </p>

                    <div class="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                        <div class="flex gap-2 flex-wrap">${languagesHtml}</div>
                    </div>

                </div>
            </div>
        `;

        projectsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function showTyping() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'flex items-center gap-3';
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">🤖</div>
        <div class="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
    `;
    document.getElementById('chat-messages').appendChild(div);
    scrollToBottom();
}

function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

// Usage in your form listener:
addMessage(text, true); // User message
showTyping(); // Show dots
setTimeout(() => {
    removeTyping(); // Remove dots
    addMessage(reply, false); // Show actual reply
}, 1500);
/* =========================================
   🤖 ULTIMATE AI CHATBOT (Features: NLP, Context, Actions, Easter Eggs)
   ========================================= */
const chatData = {
    "greetings": ["Hey there! 👋 I'm Laksh's AI. How can I help?", "Hi! 🤖 Ready to explore?", "Hello! Ask me about projects, skills, or contact info."],
    "about": "Laksh is an 18-year-old **Full-Stack Developer** & **AI/ML Aspirant** from Varanasi. He studies at Sunbeam School Lahartara.",
    "contact": "Let's connect! 🤝<br>📧 <a href='mailto:laksh.pradhwani@gmail.com' class='text-sky-400'>Email Me</a><br>🔗 <a href='https://linkedin.com/in/laksh-pradhwani' target='_blank' class='text-sky-400'>LinkedIn</a>",
    "skills": "<b>🚀 Web:</b> React, Tailwind, JS, Firebase<br><b>🐍 Backend:</b> Python, Django, REST APIs<br><b>🤖 AI:</b> Neural Networks, ML",
    "experience": "<b>Unified Mentor:</b> Full Stack (React/Redux)<br><b>MoreYeahs:</b> Django/Python Dev<br><b>Hotel Kavana:</b> IT Intern",
    "default": "I'm not sure about that. Try asking about **projects**, **skills**, or **contact**."
};

// Chat State for Context
let chatState = {
    userName: localStorage.getItem('chatUserName') || null,
    step: 'normal'
};

// Helper: Levenshtein Distance for Fuzzy Matching
function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    var longerLength = longer.length;
    if (longerLength == 0) { return 1.0; }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
function editDistance(s1, s2) {
    s1 = s1.toLowerCase(); s2 = s2.toLowerCase();
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

// Helper: Format Bot Reply (Markdown)
function formatMessage(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-sky-400 underline">$1</a>');
}

// Helper: Sound Effect
const playPopSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"); // Placeholder short beep
    audio.volume = 0.2;
    audio.play().catch(() => { }); // Ignore auto-play errors
};

// --- CHAT UI LOGIC ---
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const messagesArea = document.getElementById('chat-messages');

// Inject CSS for Typing & Chips
const style = document.createElement('style');
style.textContent = `
    .typing-dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    .quick-chip { font-size: 0.75rem; padding: 4px 10px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 99px; cursor: pointer; transition: all 0.2s; }
    .quick-chip:hover { background: rgba(56, 189, 248, 0.2); transform: translateY(-1px); }
`;
document.head.appendChild(style);

// Add Quick Chips to UI
const chipContainer = document.createElement('div');
chipContainer.className = "flex gap-2 p-3 overflow-x-auto border-t border-white/5";
chipContainer.innerHTML = `
    <span class="quick-chip" onclick="sendChip('Projects')">Projects</span>
    <span class="quick-chip" onclick="sendChip('Skills')">Skills</span>
    <span class="quick-chip" onclick="sendChip('Contact')">Contact</span>
`;
chatForm.parentElement.insertBefore(chipContainer, chatForm);

window.sendChip = (text) => {
    userInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
};

// Toggle Window
function toggleChat() {
    if (!chatWindow) return;
    const isHidden = chatWindow.classList.contains('opacity-0');
    if (isHidden) {
        chatWindow.classList.remove('opacity-0', 'scale-90', 'pointer-events-none', 'translate-y-4');
        chatWindow.classList.add('opacity-100', 'scale-100', 'pointer-events-auto', 'translate-y-0');
        if (!chatState.userName && messagesArea.children.length <= 1) {
            setTimeout(() => botResponse("Hi! What's your name?"), 1000);
        }
    } else {
        chatWindow.classList.add('opacity-0', 'scale-90', 'pointer-events-none', 'translate-y-4');
        chatWindow.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto', 'translate-y-0');
    }
}
if (chatToggle) chatToggle.addEventListener('click', toggleChat);
if (closeChat) closeChat.addEventListener('click', toggleChat);

// Typing Indicator
function showTyping() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'flex items-center gap-3';
    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">🤖</div>
        <div class="bg-slate-800/50 border border-white/5 rounded-2xl p-3 flex gap-1">
            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>`;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}
function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function botResponse(text) {
    showTyping();
    setTimeout(() => {
        removeTyping();
        addMessage(formatMessage(text), false);
        playPopSound();
    }, 1000);
}

function addMessage(html, isUser) {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3 ' + (isUser ? 'justify-end' : '');
    div.innerHTML = isUser ?
        `<div class="bg-sky-600 text-white rounded-2xl rounded-tr-none p-3 text-sm shadow-md max-w-[85%]"><p>${html}</p></div>` :
        `<div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
         </div>
         <div class="bg-slate-800/50 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-slate-300 shadow-sm max-w-[85%]"><p>${html}</p></div>`;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Core Brain Logic
function getBotReply(text) {
    const lower = text.toLowerCase();

    // 0. Easter Eggs
    if (lower === 'konami code' || lower === 'dance') {
        document.getElementById('chatbot-toggle').classList.add('animate-spin');
        return "🕺 Disco mode activated! (Check the button)";
    }
    if (lower.includes('light mode')) {
        return "😎 My eyes! I only exist in the shadows (Dark Mode).";
    }

    // 1. Context / Memory
    if (chatState.step === 'awaiting_name') {
        chatState.userName = text;
        localStorage.setItem('chatUserName', text);
        chatState.step = 'normal';
        return `Nice to meet you, ${text}! How can I help?`;
    }
    if (lower.includes('my name') || lower.includes('who am i')) {
        return chatState.userName ? `You're ${chatState.userName}!` : "I don't know yet. What is your name?";
    }

    // 2. Integrations
    if (lower.includes('music') || lower.includes('listening') || lower.includes('spotify')) {
        const songEl = document.getElementById('spotify-song');
        if (songEl && songEl.innerText) return `🎶 Laksh is vibing to **${songEl.innerText}** right now.`;
        return "🎵 Laksh isn't listening to anything on Spotify currently.";
    }
    if (lower.includes('time') || lower.includes('awake')) {
        const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: 'numeric', minute: 'numeric', hour12: true });
        return `🕒 It's **${time}** in Varanasi.`;
    }
    if (lower.includes('latest project')) {
        if (window.myProjects && window.myProjects.length > 0) {
            const p = window.myProjects[0];
            return `🔥 Latest drop: **${p.name}** - ${p.description}. [Check it out](${p.html_url})`;
        }
    }

    // 3. Keyword Matching (Fuzzy)
    const topics = [
        { keys: ['hello', 'hi', 'hey'], reply: chatData.greetings[Math.floor(Math.random() * chatData.greetings.length)] },
        { keys: ['project', 'work', 'portfolio'], reply: chatData.projects },
        { keys: ['skill', 'stack', 'tech'], reply: chatData.skills },
        { keys: ['experience', 'job', 'intern'], reply: chatData.experience },
        { keys: ['contact', 'email', 'hire', 'social'], reply: chatData.contact },
        { keys: ['about', 'who', 'bio'], reply: chatData.about }
    ];

    for (const topic of topics) {
        if (topic.keys.some(k => lower.includes(k) || similarity(lower, k) > 0.7)) {
            return topic.reply;
        }
    }

    return chatData.default;
}

// Handle Submit
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        addMessage(text, true);
        userInput.value = '';
        botResponse(getBotReply(text));
    });

    // Keydown for Konami (↑ ↑ ↓ ↓ ← → ← → b a)
    let konami = [];
    const code = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
    document.addEventListener('keydown', (e) => {
        konami.push(e.key);
        if (konami.join('').includes(code)) {
            alert("🥚 EASTER EGG FOUND!");
            konami = [];
        }
    });
}
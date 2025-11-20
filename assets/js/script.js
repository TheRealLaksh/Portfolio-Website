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

/* =========================================
   🤖 AI CHATBOT LOGIC (THE BRAIN)
   ========================================= */
const chatData = {
    // --- 1. Personality & Chit-Chat ---
    "greetings": [
        "Hey there! 👋 I'm Laksh's digital twin. Ask me about his **projects**, **skills**, or **experience**!",
        "Hi! 🤖 Ready to explore Laksh's world? I know everything from his **GitHub** stats to his **Badminton** skills.",
        "Hello! I'm online and ready. Want to see Laksh's **resume** or hear about his **hackathon** wins?",
        "Beep Boop! 🤖 Just kidding. Hi! Ask me anything regarding Laksh's work."
    ],
    "how_are_you": [
        "I'm just a bunch of code, but I'm feeling bug-free today! 🐛 How can I help you?",
        "Running on 100% efficiency! Thanks for asking. What do you want to know about Laksh?",
        "I'm great! Just waiting for someone to ask about my **neural networks** knowledge. 😉"
    ],
    "joke": [
        "Why do programmers prefer dark mode? Because light attracts bugs. 🕶️",
        "I would tell you a UDP joke, but you might not get it. 📦",
        "Laksh told me this one: A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'"
    ],
    "cool": [
        "Right? Laksh works hard to make things look awesome! 😎",
        "Glad you like it! The 3D background is pretty sick, isn't it?",
        "Thanks! Takes a lot of coffee to code this cool. ☕"
    ],
    "bye": [
        "Goodbye! Feel free to come back if you need more info. Have a great day! 👋",
        "See ya! Don't forget to check out the projects before you go! 🚀",
        "Logging off... Just kidding, I'm always here. Bye! 💻"
    ],
    "who_made_you": "I was built by Laksh Pradhwani using vanilla JavaScript and Tailwind CSS. No heavy frameworks, just pure performance! ⚡",

    // --- 2. Core Bio ---
    "about": "Laksh Pradhwani is an 18-year-old **Full-Stack Developer** & **Aspiring AI/ML Engineer** from Varanasi, India. 🇮🇳<br><br>He's a Class 12 student at <b>Sunbeam School Lahartara</b> (PCM + CS). He moved from 'Hello World' to building scalable apps like <b>GigX</b> and <b>CaliBridge</b>. He loves hackathons, robotics, and clean UI.",

    // --- 3. Education ---
    "education": "🎓 <b>Sunbeam School Lahartara</b> (2024–2026)<br>Class 12 — PCM + Computer Science<br><i>Activities:</i> Coding, Robotics, Shooting, Badminton<br><br>🏫 <b>Chinmaya International Residential School</b> (2019–2024)<br>Class 10 — House Captain, Leadership Programs, Sports",

    // --- 4. Experience (Detailed) ---
    "experience": "<b>💼 Full-Stack Developer @ Unified Mentor</b> (Oct–Dec 2025)<br>Remote | React, Redux, Firebase. Built dynamic UIs and managed state.<br><br><b>💼 Web Developer @ MoreYeahs</b> (Aug–Sep 2025)<br>Remote | Built <b>GigX platform</b> core features, Auth pages, and CRUD dashboards using Django & REST APIs.<br><br><b>💼 IT Intern @ Hotel Kavana</b> (Jun 2025)<br>On-site | Managed hotel software, automation workflows, and IT security.",

    // --- 5. Projects (Overview) ---
    "projects": "Here is Laksh's project lineup:<br><br>1. <b>Portfolio Website</b>: 3D & Animated (You are here!)<br>2. <b>Artist Portfolio</b>: Minimalist site for actors.<br>3. <b>CaliBridge</b>: JS Event Calendar with LocalStorage.<br>4. <b>Helios</b>: Aesthetic Web Music Player.<br>5. <b>MVP Webstore</b>: Frontend E-commerce demo.<br>6. <b>Code & Canvas</b>: Modern blog with comments.<br><br>Check the code on <a href='https://github.com/TheRealLaksh' target='_blank' class='text-sky-400 underline'>GitHub</a>!",

    // Specific Project Details
    "calibridge": "<b>CaliBridge</b> is a JavaScript-based event calendar. It supports event creation, month switching, and LocalStorage sync. Smooth animations and a responsive UI make it a great productivity tool.",
    "helios": "<b>Helios Music Player</b> is a lightweight web player. It features dynamic track switching, a beautiful UI, and responsive controls for an aesthetic listening experience.",
    "codecanvas": "<b>Code & Canvas</b> is a modern blog platform featuring dark mode, real-time comments (Firebase), search functionality, and social sharing. Built with Tailwind & Vanilla JS.",
    "mvp": "<b>MVP Webstore</b> is a front-end e-commerce MVP. It features product listings, a functional cart system, and a clean UI, built entirely with HTML, CSS, and JS.",
    "artist": "<b>Artist Portfolio</b> is designed for actors and creatives. It features a balanced gallery, smooth transitions, and a minimal design to showcase artwork professionally.",
    "portfolio": "<b>Portfolio Website</b> is this very site! It features 3D elements (Three.js), GSAP-like animations (AOS), and a fully responsive glassmorphism design.",

    // --- 6. Skills ---
    "skills": "<b>🚀 Web Development:</b><br>HTML, CSS, JavaScript, MERN Stack (Basics), Firebase, Tailwind CSS, Git/GitHub.<br><br><b>🐍 Backend:</b><br>Python, Django, REST APIs, CRUD operations.<br><br><b>🤖 AI & ML:</b><br>Neural Networks, Feature Engineering, Clustering, Prompt Engineering.<br><br><b>🔐 Cybersecurity:</b><br>Kali Linux, Digital Forensics, Pentesting Basics.",

    // --- 7. Certifications ---
    "certifications": "📜 <b>Data Science & AI</b> — IIT Madras<br>📜 <b>Generative AI Mastermind</b> — Outskill<br>📜 <b>Cyber Investigator</b> — DeepCytes Cyber Labs (UK)<br>📜 <b>Google Play Academy</b> — Store Listing Certificate<br>📜 <b>Advanced Drone Technology</b> — Bharat Space Education",

    // --- 8. Workshops ---
    "workshops": "Laksh is always learning! Workshops attended:<br>• <b>IIT Madras:</b> Neural Networks, AI Ethics, Datasets<br>• <b>Plaksha University:</b> Turing Test, DNN Basics, Feature Extraction<br>• <b>Outskill:</b> Custom GPTs, AI Automation<br>• <b>Bharat Space Education:</b> Drone Tech & Air Mobility",

    // --- 9. Achievements ---
    "achievements": "<b>🏆 Technology:</b><br>• 2nd Place: Robowars (Impetus ’25)<br>• National Finalist: Manual HTML/CSS Dev<br>• VVM Science Exam: School & District Topper<br>• Multiple Hackathon recognitions (WebWiz, Tech Ramble)<br><br><b>🎖 Leadership:</b><br>• House Captain (CIRS)<br>• NCC 'A' Certificate",

    // --- 10. Sports ---
    "sports": "Laksh is an athlete too! 🏃‍♂️<br>🔫 <b>Shooting:</b> State-Level Air Pistol Shooter<br>🏸 <b>Badminton:</b> District-Level Player<br>🏐 <b>Volleyball:</b> 1st Place (School)<br>🏊 <b>Swimming:</b> 2nd Place (Relay)<br>🧘 <b>Yoga:</b> Completed 108 Surya Namaskars",

    // --- 11. Contact ---
    "contact": "Let's connect! 🤝<br>📧 Email: <a href='mailto:laksh.pradhwani@gmail.com' class='text-sky-400'>laksh.pradhwani@gmail.com</a><br>🔗 <a href='https://linkedin.com/in/laksh-pradhwani' target='_blank' class='text-sky-400'>LinkedIn</a><br>📸 <a href='https://www.instagram.com/_.lakshp/' target='_blank' class='text-sky-400'>Instagram</a>",

    // --- Fallback ---
    "default": "I'm not sure about that specific detail. 😅<br>But I can tell you about Laksh's <b>projects</b>, <b>skills</b>, <b>sports</b>, <b>achievements</b>, or <b>certifications</b>. What's on your mind?"
};

// Helper: Check if text contains any of the keywords
function hasKeyword(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
}

// Helper: Get Random Array Item
function getRandomResponse(arr) {
    return Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
}

// Main Logic: Analyze Text and Get Reply
function getBotReply(text) {
    const lowerText = text.toLowerCase();

    // --- 1. Personality & Chit-Chat ---
    if (hasKeyword(lowerText, ['hi', 'hello', 'hey', 'hola', 'yo', 'sup', 'morning', 'afternoon', 'evening'])) 
        return getRandomResponse(chatData.greetings);
    
    if (hasKeyword(lowerText, ['how are you', 'how are u', 'how r u', 'doing today', 'whats up'])) 
        return getRandomResponse(chatData.how_are_you);
    
    if (hasKeyword(lowerText, ['joke', 'funny', 'laugh', 'entertain'])) 
        return getRandomResponse(chatData.joke);
    
    if (hasKeyword(lowerText, ['cool', 'awesome', 'wow', 'amazing', 'sick', 'great', 'nice'])) 
        return getRandomResponse(chatData.cool);
    
    if (hasKeyword(lowerText, ['bye', 'goodbye', 'see ya', 'cya', 'later'])) 
        return getRandomResponse(chatData.bye);
    
    if (hasKeyword(lowerText, ['who made', 'who built', 'creator', 'developer', 'author'])) 
        return chatData.who_made_you;

    // --- 2. Specific Personal Info ---
    if (hasKeyword(lowerText, ['location', 'where are you', 'live', 'city', 'from', 'based']))
        return chatData.location;
    
    if (hasKeyword(lowerText, ['age', 'how old', 'birth']))
        return chatData.age;

    // --- 3. Contact & Socials ---
    if (hasKeyword(lowerText, ['contact', 'email', 'mail', 'gmail', 'reach', 'connect', 'hire', 'message', 'ping'])) 
        return chatData.contact;
    
    if (hasKeyword(lowerText, ['insta', 'instagram', 'ig', 'handle', 'id', 'social'])) 
        return chatData.contact; // Reusing contact as it has the links

    if (hasKeyword(lowerText, ['link', 'linkedin', 'github', 'git'])) 
        return chatData.contact;

    // --- 4. Bio & Professional ---
    if (hasKeyword(lowerText, ['about', 'who are you', 'bio', 'intro', 'background', 'profile', 'name', 'student', 'laksh', 'yourself'])) 
        return chatData.about;

    if (hasKeyword(lowerText, ['experience', 'job', 'intern', 'work', 'company', 'unified', 'moreyeahs', 'hotel', 'kavana', 'profession', 'employment'])) 
        return chatData.experience;
    
    if (hasKeyword(lowerText, ['resume', 'cv', 'curriculum'])) 
        return "You can view or download my Resume from the **Resume** section below! 📄";

    if (hasKeyword(lowerText, ['educat', 'school', 'college', 'university', 'study', 'class', 'grade', 'degree', 'sunbeam', 'cirs', '12th', '10th', 'board'])) 
        return chatData.education;

    // --- 5. Skills & Tech ---
    if (hasKeyword(lowerText, ['skill', 'tech', 'stack', 'code', 'programming', 'language', 'react', 'python', 'django', 'js', 'html', 'css', 'tailwind', 'firebase', 'ai', 'ml', 'cyber', 'linux'])) 
        return chatData.skills;
    
    if (hasKeyword(lowerText, ['certif', 'course', 'license', 'iit', 'google', 'deepcytes'])) 
        return chatData.certifications;
    
    if (hasKeyword(lowerText, ['workshop', 'seminar', 'bootcamp', 'training'])) 
        return chatData.workshops;

    // --- 6. Achievements & Interests ---
    if (hasKeyword(lowerText, ['achieve', 'award', 'prize', 'win', 'won', 'medal', 'hackathon', 'rank', 'topper', 'robowar', 'robot'])) 
        return chatData.achievements;
    
    if (hasKeyword(lowerText, ['sport', 'game', 'hobby', 'shoot', 'badminton', 'volley', 'swim', 'yoga', 'football', 'surya', 'namaskar'])) 
        return chatData.sports;

    // --- 7. Specific Projects ---
    if (hasKeyword(lowerText, ['calibridge', 'calendar', 'event'])) return chatData.calibridge;
    if (hasKeyword(lowerText, ['helios', 'music', 'player', 'song'])) return chatData.helios;
    if (hasKeyword(lowerText, ['canvas', 'blog', 'article', 'write'])) return chatData.codecanvas;
    if (hasKeyword(lowerText, ['shop', 'store', 'ecommerce', 'cart', 'mvp', 'buy'])) return chatData.mvp;
    if (hasKeyword(lowerText, ['artist', 'actor', 'gallery', 'portfolio'])) return chatData.artist; // Matches "portfolio" here too
    
    // --- 8. General Projects ---
    if (hasKeyword(lowerText, ['project', 'build', 'app', 'application', 'demo', 'repo', 'site', 'web', 'website'])) 
        return chatData.projects;

    return chatData.default;
}

// --- CHAT UI INTERACTION ---
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const messagesArea = document.getElementById('chat-messages');

// Toggle Window
function toggleChat() {
    if (!chatWindow) return;
    const isHidden = chatWindow.classList.contains('opacity-0');
    if (isHidden) {
        chatWindow.classList.remove('opacity-0', 'scale-90', 'pointer-events-none', 'translate-y-4');
        chatWindow.classList.add('opacity-100', 'scale-100', 'pointer-events-auto', 'translate-y-0');
    } else {
        chatWindow.classList.add('opacity-0', 'scale-90', 'pointer-events-none', 'translate-y-4');
        chatWindow.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto', 'translate-y-0');
    }
}

if (chatToggle) chatToggle.addEventListener('click', toggleChat);
if (closeChat) closeChat.addEventListener('click', toggleChat);

// Add Message to UI
function addMessage(content, isUser = false) {
    if (!messagesArea) return;
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3 ' + (isUser ? 'justify-end' : '');
    
    // User vs Bot Message Styling
    div.innerHTML = isUser ? 
        `<div class="bg-sky-600 text-white rounded-2xl rounded-tr-none p-3 text-sm shadow-md max-w-[80%]"><p>${content}</p></div>` :
        `<div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10"></path><path d="M2 12a10 10 0 0 1 10-10v10Z"></path></svg>
         </div>
         <div class="bg-slate-800/50 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-slate-300 shadow-sm max-w-[80%]"><p>${content}</p></div>`;
    
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Handle Form Submit
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';

        setTimeout(() => {
            const reply = getBotReply(text);
            addMessage(reply, false);
        }, 600);
    });
}
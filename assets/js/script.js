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

    if (location.hostname === "localhost") {
        console.log("Service Worker disabled on Localhost");
    } else {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js");
        }
    }


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
   🤖 ULTIMATE AI CHATBOT LOGIC & DATABASE
   ========================================= */

/* -------------------------
   1. THE BRAIN (Knowledge)
   ------------------------- */
const chatData = {
    "greetings": [
        "Hey there! 👋 I'm Laksh's digital twin. Ask me about his **projects**, **skills**, or **experience**!",
        "Hi! 🤖 Ready to explore Laksh's world? I know everything from his **GitHub** stats to his **Badminton** skills.",
        "Hello! I'm online and ready. Want to see Laksh's **resume** or hear about his **hackathon** wins?",
        "Beep Boop! 🤖 Just kidding. Hi! Ask me anything about Laksh."
    ],
    "how_are_you": [
        "I'm just a bunch of code, but I'm feeling bug-free today! 🐛 How can I help you?",
        "Running on 100% efficiency! Thanks for asking. What do you want to know about Laksh?",
        "I'm great! Just waiting for someone to ask about my **neural networks** knowledge. 😉"
    ],
    "joke": [
        "Why do programmers prefer dark mode? Because light attracts bugs. 🕶️",
        "I would tell you a UDP joke, but you might not get it. 📦",
        "Laksh told me this one: A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
        "There are 10 types of people in the world: those who understand binary, and those who don't."
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
    "who_made_you": "I was built by **Laksh Pradhwani** using vanilla JavaScript, Tailwind CSS, and some AI magic. No heavy frameworks, just pure performance! ⚡",
    "about": "Laksh Pradhwani is an 18-year-old **Full-Stack Developer** & **Aspiring AI/ML Engineer** from **Varanasi, India** 🇮🇳.<br><br>He's a Class 12 student at <b>Sunbeam School Lahartara</b> (PCM + CS). He moved from 'Hello World' to building scalable apps like <b>GigX</b> and <b>CaliBridge</b>. He loves hackathons, robotics, and clean UI.",
    "location": "Laksh is based in the spiritual capital of India, **Varanasi, Uttar Pradesh**. 🕉️",
    "age": "Laksh is **18 years old**. Young, but coding like a pro! 🚀",
    "education": "🎓 <b>Sunbeam School Lahartara</b> (2024–2026)<br>Class 12 — PCM + Computer Science<br><i>Activities:</i> Coding, Robotics, Shooting, Badminton<br><br>🏫 <b>Chinmaya International Residential School</b> (2019–2024)<br>Class 10 — House Captain, Leadership Programs, Sports",
    "experience": "<b>💼 Full-Stack Developer @ Unified Mentor</b> (Oct–Dec 2025)<br>Remote | React, Redux, Firebase. Built dynamic UIs and managed state.<br><br><b>💼 Web Developer @ MoreYeahs</b> (Aug–Sep 2025)<br>Remote | Built <b>GigX platform</b> core features, Auth pages, and CRUD dashboards using Django & REST APIs.<br><br><b>💼 IT Intern @ Hotel Kavana</b> (Jun 2025)<br>On-site | Managed hotel software, automation workflows, and IT security.",
    "projects": "Here is Laksh's project lineup:<br><br>1. <b>Portfolio Website</b>: 3D & Animated (You are here!)<br>2. <b>Artist Portfolio</b>: Minimalist site for actors.<br>3. <b>CaliBridge</b>: JS Event Calendar with LocalStorage.<br>4. <b>Helios</b>: Aesthetic Web Music Player.<br>5. <b>MVP Webstore</b>: Frontend E-commerce demo.<br>6. <b>Code & Canvas</b>: Modern blog with comments.<br><br>Check the code on <a href='https://github.com/TheRealLaksh' target='_blank' class='text-sky-400 underline'>GitHub</a>!",
    "calibridge": "<b>CaliBridge</b> is a JavaScript-based event calendar. It supports event creation, month switching, and LocalStorage sync. Smooth animations and a responsive UI make it a great productivity tool.",
    "helios": "<b>Helios Music Player</b> is a lightweight web player. It features dynamic track switching, a beautiful UI, and responsive controls for an aesthetic listening experience.",
    "codecanvas": "<b>Code & Canvas</b> is a modern blog platform featuring dark mode, real-time comments (Firebase), search functionality, and social sharing. Built with Tailwind & Vanilla JS.",
    "mvp": "<b>MVP Webstore</b> is a front-end e-commerce MVP. It features product listings, a functional cart system, and a clean UI, built entirely with HTML, CSS, and JS.",
    "artist": "<b>Artist Portfolio</b> is designed for actors and creatives. It features a balanced gallery, smooth transitions, and a minimal design to showcase artwork professionally.",
    "portfolio": "<b>Portfolio Website</b> is this very site! It features 3D elements (Three.js), GSAP-like animations (AOS), and a fully responsive glassmorphism design.",
    "skills": "<b>🚀 Web Development:</b><br>HTML, CSS, JavaScript, MERN Stack (Basics), Firebase, Tailwind CSS, Git/GitHub.<br><br><b>🐍 Backend:</b><br>Python, Django, REST APIs, CRUD operations.<br><br><b>🤖 AI & ML:</b><br>Neural Networks, Feature Engineering, Clustering, Prompt Engineering.<br><br><b>🔐 Cybersecurity:</b><br>Kali Linux, Digital Forensics, Pentesting Basics.",
    "certifications": "📜 <b>Data Science & AI</b> — IIT Madras<br>📜 <b>Generative AI Mastermind</b> — Outskill<br>📜 <b>Cyber Investigator</b> — DeepCytes Cyber Labs (UK)<br>📜 <b>Google Play Academy</b> — Store Listing Certificate<br>📜 <b>Advanced Drone Technology</b> — Bharat Space Education",
    "workshops": "Laksh is always learning! Workshops attended:<br>• <b>IIT Madras:</b> Neural Networks, AI Ethics, Datasets<br>• <b>Plaksha University:</b> Turing Test, DNN Basics, Feature Extraction<br>• <b>Outskill:</b> Custom GPTs, AI Automation<br>• <b>Bharat Space Education:</b> Drone Tech & Air Mobility",
    "achievements": "<b>🏆 Technology:</b><br>• 2nd Place: Robowars (Impetus ’25)<br>• National Finalist: Manual HTML/CSS Dev<br>• VVM Science Exam: School & District Topper<br>• Multiple Hackathon recognitions (WebWiz, Tech Ramble)<br><br><b>🎖 Leadership:</b><br>• House Captain (CIRS)<br>• NCC 'A' Certificate",
    "sports": "Laksh is an athlete too! 🏃‍♂️<br>🔫 <b>Shooting:</b> State-Level Air Pistol Shooter<br>🏸 <b>Badminton:</b> District-Level Player<br>🏐 <b>Volleyball:</b> 1st Place (School)<br>🏊 <b>Swimming:</b> 2nd Place (Relay)<br>🧘 <b>Yoga:</b> Completed 108 Surya Namaskars",
    "contact": "Let's build something together! 🤝<br>📧 Email: <a href='mailto:laksh.pradhwani@gmail.com' class='text-sky-400'>laksh.pradhwani@gmail.com</a><br>🔗 <a href='https://linkedin.com/in/laksh-pradhwani' target='_blank' class='text-sky-400'>LinkedIn</a><br>📸 <a href='https://www.instagram.com/_.lakshp/' target='_blank' class='text-sky-400'>Instagram</a>",
    "default": "I'm not sure about that specific detail. 😅<br>But I can tell you about Laksh's <b>projects</b>, <b>skills</b>, <b>sports</b>, <b>achievements</b>, or <b>certifications</b>. What's on your mind?"
};

/* -------------------------
   2. CHAT STATE & HELPERS
   ------------------------- */
let chatState = {
    userName: localStorage.getItem('chatUserName') || null,
    step: 'normal'
};

// Levenshtein (kept intact)
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

// Format Bot Reply (Markdown -> HTML)
function formatMessage(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-sky-400 underline">$1</a>');
}

// Sound effect (kept)
const playPopSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"); // Short beep placeholder
    audio.volume = 0.2;
    audio.play().catch(() => { });
};

/* -------------------------------------------------------
   3. MASSIVE KEYWORD SUPPORT (does NOT allocate millions)
   -------------------------------------------------------
*/
const baseBank = {
    greetings: ["hello", "hi", "hey", "greetings", "yo", "hiya"],
    about: ["laksh", "about", "bio", "who", "introduction", "profile"],
    skills: ["skills", "skillset", "tech", "stack", "technologies", "abilities", "expertise"],
    projects: ["projects", "project", "portfolio", "work", "apps", "application", "repo", "github"],
    experience: ["experience", "internship", "intern", "work", "job", "roles"],
    education: ["education", "school", "college", "study", "qualification"],
    achievements: ["achievements", "awards", "wins", "hackathon", "prize", "recognition"],
    sports: ["sports", "badminton", "shooting", "volleyball", "swimming", "yoga", "athlete"],
    contact: ["contact", "email", "mail", "linkedin", "instagram", "social"],
    jokes: ["joke", "funny", "meme", "laugh"],
    bye: ["bye", "goodbye", "see ya", "later", "farewell"]
};

// small templates to multiply variants
const prefixes = ["", "tell me ", "show me ", "what about ", "info on ", "details about ", "do you have "];
const suffixes = ["", " please", " now", " today", " details", " info", " overview", " summary", " full details", " quick info"];


function keywordMatch(text, category) {
    if (!text || !category || !baseBank[category]) return false;
    const lower = text.toLowerCase().trim();

    // direct substring shortcuts
    for (const base of baseBank[category]) {
        if (lower.includes(base)) return true;
    }

    // try generated variants (stop early if matched)
    const SIM_THRESHOLD = 0.78; // fuzzy threshold
    for (let i = 0; i < prefixes.length; i++) {
        for (let j = 0; j < baseBank[category].length; j++) {
            for (let k = 0; k < suffixes.length; k++) {
                // construct variant (small, computed on the fly)
                const variant = (prefixes[i] + baseBank[category][j] + suffixes[k]).trim();
                if (variant.length === 0) continue;
                if (lower.includes(variant)) return true;
                if (similarity(lower, variant) > SIM_THRESHOLD) return true;
                // also check compacted variant (no spaces) and upper/lower transformations
                const compact = variant.replace(/\s+/g, '');
                if (lower.includes(compact)) return true;
                if (similarity(lower, compact) > SIM_THRESHOLD) return true;
            }
        }
    }

    // morphological attempts (singular/plural)
    for (const base of baseBank[category]) {
        const plural = base.endsWith('s') ? base : base + 's';
        if (lower.includes(plural)) return true;
        if (similarity(lower, plural) > SIM_THRESHOLD) return true;
    }

    return false;
}

// generic helper using keywordMatch across categories
function hasKeywordDynamic(text, categories) {
    for (const cat of categories) {
        if (keywordMatch(text, cat)) return true;
    }
    return false;
}

/* -------------------------
   4. UI LOGIC (Typing, Chips)
   ------------------------- */
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const messagesArea = document.getElementById('chat-messages');

// Inject CSS for Typing & Chips (kept)
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

// Add Quick Chips (kept)
if (chatForm) {
    const chipContainer = document.createElement('div');
    chipContainer.className = "flex gap-2 p-3 overflow-x-auto border-t border-white/5";
    chipContainer.innerHTML = `
        <span class="quick-chip" onclick="sendChip('Projects')">Projects</span>
        <span class="quick-chip" onclick="sendChip('Skills')">Skills</span>
        <span class="quick-chip" onclick="sendChip('Contact')">Contact</span>
    `;
    chatForm.parentElement.insertBefore(chipContainer, chatForm);
}
window.sendChip = (text) => {
    if (userInput) {
        userInput.value = text;
        chatForm.dispatchEvent(new Event('submit'));
    }
};

// Toggle Window (FIXED: set awaiting_name when appropriate)
function toggleChat() {
    if (!chatWindow) return;
    const isHidden = chatWindow.classList.contains('opacity-0');
    if (isHidden) {
        chatWindow.classList.remove('opacity-0', 'scale-90', 'pointer-events-none', 'translate-y-4');
        chatWindow.classList.add('opacity-100', 'scale-100', 'pointer-events-auto', 'translate-y-0');
        // If we don't know the user name, prompt and set state so next message is stored as name
        if (!chatState.userName && messagesArea.children.length <= 1) {
            chatState.step = 'awaiting_name';
            setTimeout(() => botResponse("Hi! What's your name?"), 400);
        }
    } else {
        chatWindow.classList.add('opacity-0', 'scale-90', 'pointer-events-none', 'translate-y-4');
        chatWindow.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto', 'translate-y-0');
    }
}

// Typing Indicators (kept)
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
        addMessage(formatMessage(addPersonality(text)), false);
        playPopSound();
    }, 700);
}
function addMessage(html, isUser) {
    if (!messagesArea) return;
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

/* -------------------------------------------
   5. MAIN INTELLIGENCE (Keyword + Fuzzy + Nav)
   ------------------------------------------- */
function getBotReply(text) {
    const lower = (text || "").toLowerCase();
    if (lower.includes("love you"))
        return "Aww, virtual hugs only! 🤖❤️ But thanks, that made my algorithm blush!";

    if (lower.includes("funny") || lower.includes("make me laugh"))
        return getRandomResponse(chatData.joke);

    if (lower.includes("who are you"))
        return "I'm AI Laksh — coded by the real Laksh Pradhwani. I'm like him but with better typing speed. 😉";

    if (lower.includes("wtf") || lower.includes("lol") || lower.includes("lmao"))
        return "😂 That reaction was priceless. Hit me with another one.";

    if (lower.includes("bored"))
        return "Bored? Want a joke? Or I can flex Laksh’s achievements again 😎.";

    // Navigator (kept)
    const navMatch = lower.match(/(?:go to|navigate|show|take me to|view|open|scroll to) (home|about|experience|skills|projects|contact|resume)/i);
    if (navMatch) {
        const sectionId = navMatch[1].toLowerCase();
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            return `🚀 Initiating warp drive... Taking you to **${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}**!`;
        }
    }

    // Sentiment quick checks (kept)
    if (hasKeywordDynamic(lower, ['greetings']) && lower.length < 20) return getRandomResponse(chatData.greetings);
    if (hasKeywordDynamic(lower, ['about']) && lower.indexOf('who') !== -1) return chatData.about;
    if (hasKeywordDynamic(lower, ['skills'])) return chatData.skills;
    if (hasKeywordDynamic(lower, ['projects'])) return chatData.projects;
    if (hasKeywordDynamic(lower, ['experience'])) return chatData.experience;
    if (hasKeywordDynamic(lower, ['education'])) return chatData.education;
    if (hasKeywordDynamic(lower, ['certifications'])) return chatData.certifications || chatData.default;
    if (hasKeywordDynamic(lower, ['achievements'])) return chatData.achievements;
    if (hasKeywordDynamic(lower, ['sports'])) return chatData.sports;
    if (hasKeywordDynamic(lower, ['contact'])) return chatData.contact;
    if (hasKeywordDynamic(lower, ['jokes'])) return getRandomResponse(chatData.joke);
    if (hasKeywordDynamic(lower, ['bye'])) return getRandomResponse(chatData.bye);

    // small sentiment phrases
    if (hasKeywordDynamic(lower, ['cool']) || lower.includes('awesome') || lower.includes('amazing')) {
        return "🤖 You just made my circuits blush! 😊 Thank you for the kind words!";
    }
    if (lower.includes('bad') || lower.includes('suck') || lower.includes('hate')) {
        return "🥺 Ouch! That hurts my virtual feelings. I'm still learning, so I'll try to do better next time!";
    }

    // Easter eggs (kept)
    if (lower === 'konami code' || lower === 'dance') {
        if (chatToggle) chatToggle.classList.add('animate-spin');
        return "🕺 Disco mode activated! (Check the button)";
    }
    if (lower.includes('light mode')) {
        return "😎 My eyes! I only exist in the shadows (Dark Mode).";
    }

    // Name handling (FIXED)
    if (chatState.step === 'awaiting_name') {
        const name = text.trim();
        if (name.length > 0) {
            chatState.userName = name;
            localStorage.setItem('chatUserName', name);
            chatState.step = 'normal';
            return `Nice to meet you, ${name}! How can I help?`;
        } else {
            return "I didn't catch that name. What should I call you?";
        }
    }

    // If user hasn't provided name previously, ask for it (ensures we don't overwrite)
    if (!chatState.userName) {
        chatState.step = 'awaiting_name';
        return "Hi! What's your name?";
    }

    // Integrations & utilities (kept)
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
    // --- PROJECT LINK RESPONSES ---
    const projectLinks = [
        {
            keys: ["portfolio", "main site", "website", "portfolio website"],
            name: "Portfolio Website",
            github: "https://github.com/TheRealLaksh/Portfolio-Website",
            live: "https://lakshp.live"
        },
        {
            keys: ["artist", "art", "artistry"],
            name: "Artist Portfolio",
            github: "https://github.com/TheRealLaksh/Artist-Portfolio",
            live: "https://artist-portfolio.lakshp.live/"
        },
        {
            keys: ["calibridge", "calendar", "event", "event app", "event calendar", "callender", "events"],
            name: "CaliBridge — Event Calendar App",
            github: "https://github.com/TheRealLaksh/Callender-Events",
            live: "https://events.lakshp.live/"
        },
        {
            keys: ["helios", "music", "music player", "audio", "player"],
            name: "Helios Music Player",
            github: "https://github.com/TheRealLaksh/Music-Player",
            live: "https://music.lakshp.live/"
        },
        {
            keys: ["mvp", "shop", "store", "ecommerce", "shopping"],
            name: "MVP Webstore",
            github: "https://github.com/TheRealLaksh/Shopping-demo",
            live: "https://mvp-webstore.lakshp.live/"
        },
        {
            keys: ["code", "canvas", "blog", "code & canvas"],
            name: "Code & Canvas — Modern Blog",
            github: "https://github.com/TheRealLaksh/code-and-canvas-blog",
            live: "https://blog.lakshp.live/"
        }
    ];

    // If user asks for a project link, detect automatically
    if (
        lower.includes("link") ||
        lower.includes("url") ||
        lower.includes("github") ||
        lower.includes("repo") ||
        lower.includes("live")
    ) {
        for (const project of projectLinks) {
            for (const key of project.keys) {
                if (lower.includes(key) || similarity(lower, key) > 0.72) {
                    return `
<b>${project.name}</b><br>
🌐 Live: <a href="${project.live}" target="_blank" class="text-sky-400 underline">${project.live}</a><br>
💻 GitHub: <a href="${project.github}" target="_blank" class="text-sky-400 underline">${project.github}</a>
                `;
                }
            }
        }

        // If asked for a link but no project detected
        return "Tell me the project name (Portfolio, Artist, CaliBridge, Helios, MVP Store, Code & Canvas).";
    }

    // Fuzzy topic array (kept) - still used as fallback
    const topics = [
        { keys: ['hello', 'hi', 'hey', 'hola', 'yo', 'sup', 'morning', 'afternoon', 'evening'], reply: chatData.greetings },
        { keys: ['how are you', 'how r u', 'doing'], reply: chatData.how_are_you },
        { keys: ['joke', 'funny', 'laugh'], reply: chatData.joke },
        { keys: ['bye', 'goodbye', 'see ya'], reply: chatData.bye },
        { keys: ['who made', 'creator', 'built'], reply: chatData.who_made_you },
        { keys: ['contact', 'email', 'mail', 'hire', 'linkedin', 'insta', 'instagram'], reply: chatData.contact },
        { keys: ['about', 'who', 'bio', 'intro'], reply: chatData.about },
        { keys: ['experience', 'job', 'intern', 'work'], reply: chatData.experience },
        { keys: ['educat', 'school', 'college', 'study'], reply: chatData.education },
        { keys: ['skill', 'tech', 'stack', 'code', 'react', 'python'], reply: chatData.skills },
        { keys: ['certif', 'course', 'license'], reply: chatData.certifications },
        { keys: ['workshop', 'seminar'], reply: chatData.workshops },
        { keys: ['achieve', 'award', 'prize', 'win', 'hackathon'], reply: chatData.achievements },
        { keys: ['sport', 'game', 'hobby', 'badminton', 'shoot'], reply: chatData.sports },
        { keys: ['calibridge', 'calendar'], reply: chatData.calibridge },
        { keys: ['helios', 'music', 'player'], reply: chatData.helios },
        { keys: ['code', 'canvas', 'blog'], reply: chatData.codecanvas },
        { keys: ['shop', 'store', 'mvp'], reply: chatData.mvp },
        { keys: ['artist', 'actor'], reply: chatData.artist },
        { keys: ['portfolio', 'site', 'website'], reply: chatData.portfolio },
        { keys: ['project', 'build', 'app'], reply: chatData.projects }
    ];

    for (const topic of topics) {
        if (topic.keys.some(k => lower.includes(k) || similarity(lower, k) > 0.75)) {
            return getRandomResponse(topic.reply);
        }
    }

    return chatData.default;
}

async function askCloudAI(msg) {
    try {
        const r = await fetch("/.netlify/functions/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });

        const j = await r.json();
        return j.reply;
    } catch (err) {
        console.warn("Cloud AI failed:", err);
        return null;
    }
}


/* -------------------------
   6. EVENT LISTENERS
   ------------------------- */
if (chatToggle) chatToggle.addEventListener('click', toggleChat);
if (closeChat) closeChat.addEventListener('click', toggleChat);

if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = userInput.value.trim();
        if (!text) return;

        addMessage(formatMessage(escapeHtml(text)), true);
        userInput.value = "";

        const cloud = await askCloudAI(text);

        if (cloud) botResponse(cloud);
        else botResponse(getBotReply(text));
    });


    // Konami Code (kept)
    let konami = [];
    const code = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
    document.addEventListener('keydown', (e) => {
        konami.push(e.key);
        if (konami.join('').includes(code)) {
            alert("🥚 EASTER EGG FOUND! KONAMI CODE ACTIVATED!");
            konami = [];
        }
    });
}

/* -------------------------
   Helpers: Random + Escape
   ------------------------- */
function getRandomResponse(arr) {
    return Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
}
function addPersonality(text) {
    const vibes = [
        "😎",
        "😉",
        "😂",
        "🤖✨",
        "🚀",
        "🔥",
        "😄",
        "🧠",
    ];

    const starters = [
        "Alright, here's the deal — ",
        "Let me break it down for you — ",
        "Great question! ",
        "Okay, so check this out: ",
        "Fun fact incoming — ",
        "",
        "",
    ];

    const enders = [
        " Pretty cool, right?",
        " Wild, isn’t it?",
        " Let me know if you want more!",
        "",
        "",
        "",
    ];

    const vibe = vibes[Math.floor(Math.random() * vibes.length)];
    const start = starters[Math.floor(Math.random() * starters.length)];
    const end = enders[Math.floor(Math.random() * enders.length)];

    return `${vibe} ${start}${text}${end}`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



const chatWindowResize = document.getElementById("chat-window");
const resizeHandle = document.getElementById("resize-handle");

let resizing = false;

resizeHandle.addEventListener("mousedown", () => {
    resizing = true;
});

window.addEventListener("mousemove", (e) => {
    if (!resizing) return;

    chatWindowResize.style.width =
        e.clientX - chatWindowResize.getBoundingClientRect().left + "px";

    chatWindowResize.style.height =
        e.clientY - chatWindowResize.getBoundingClientRect().top + "px";
});

window.addEventListener("mouseup", () => {
    resizing = false;
});

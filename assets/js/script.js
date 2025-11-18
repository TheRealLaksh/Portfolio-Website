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
    // 5. EXPANDABLE TABS SCROLL SPY (Existing Logic)
    // ---------------------------
    const sections = document.querySelectorAll("section");
    const navTabs = document.querySelectorAll(".expandable-tab");

    const updateActiveTab = () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 350) {
                current = section.getAttribute("id");
            }
        });

        navTabs.forEach((tab) => {
            tab.classList.remove("active");
            if (tab.getAttribute("href").includes(current)) {
                tab.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", updateActiveTab);
    updateActiveTab();
    navTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            navTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
        });
    });


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
            if(image) {
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
        // This catch handles critical initial errors (e.g., network down)
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

    projectsGrid.innerHTML = "";

    window.myProjects.forEach(repo => {

        const languagesHtml = repo.languages
            .slice(0, 3) // Limit to top 3 languages
            .map(lang => `<span class="text-[10px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700/50">${lang}</span>`)
            .join("");

        const liveIcon = repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" title="Live Demo"
                class="p-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5"
                    viewBox="0 0 24 24">
                    <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h5V3H5c-1.1 0-2 .9-2 2v5h2V5Zm0 9H3v5c0 1.1.9 2 2 2h5v-2H5v-5Zm14-2h2v5c0 1.1-.9 2-2 2h-5v-2h5v-5Z"/>
                </svg>
            </a>
        ` : "";

        const githubIcon = `
            <a href="${repo.html_url}" target="_blank" title="GitHub Code"
                class="p-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-sky-500/50 hover:text-sky-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                    class="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56v-2c-3.2.69-3.87-1.39-3.87-1.39-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.11-.75.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.72 0-1.27.45-2.31 1.2-3.13-.12-.3-.52-1.52.11-3.17 0 0 .97-.31 3.18 1.2a10.9 10.9 0 0 1 5.79 0c2.21-1.51 3.18-1.2 3.18-1.2.63 1.65.23 2.87.11 3.17a4.57 4.57 0 0 1 1.2 3.13c0 4.45-2.69 5.43-5.25 5.71.42.36.8 1.07.8 2.16v3.2c0 .31.21.68.8.56A10.99 10.99 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z"/>
                </svg>
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

                        <div class="flex gap-3">${liveIcon}${githubIcon}</div>
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
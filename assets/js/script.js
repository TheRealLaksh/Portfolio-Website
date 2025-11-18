document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------
    // 1. AOS INIT
    // ---------------------------
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 30,
            easing: 'ease-out-cubic'
        });
    }

    // ---------------------------
    // 2. HERO TYPING
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
    // 3. NAVIGATION SCROLL SPY (Mobile & Desktop)
    // ---------------------------
    const sections = document.querySelectorAll("section");
    const mobileLinks = document.querySelectorAll(".nav-link-mobile");
    const desktopLinks = document.querySelectorAll(".nav-link"); // Select desktop links

    window.addEventListener("scroll", () => {
        let current = "";

        // 1. Determine which section is currently in view
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            // 300px offset helps trigger the active state a bit earlier for better UX
            if (pageYOffset >= sectionTop - 300) {
                current = section.getAttribute("id");
            }
        });

        // 2. Update Mobile Bottom Nav
        mobileLinks.forEach((link) => {
            link.classList.remove("active-mobile-link");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active-mobile-link");
            }
        });

        // 3. Update Desktop Top Nav (The Fix)
        desktopLinks.forEach((link) => {
            link.classList.remove("active-link");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active-link");
            }
        });
    });
    // ---------------------------
    // 4. FETCH PROJECTS
    // ---------------------------
    loadProjectsFromGitHub();

    // ---------------------------
    // 5. FOOTER HOVER EFFECT (LAKSH)
    // ---------------------------
    const footerContainer = document.getElementById('footer-hover-container');
    const revealMask = document.getElementById('revealMask');

    if (footerContainer && revealMask) {
        footerContainer.addEventListener('mousemove', (e) => {
            const rect = footerContainer.getBoundingClientRect();
            // Calculate mouse position relative to the SVG container
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert to percentage for the gradient coordinates
            const cxPercentage = (x / rect.width) * 100;
            const cyPercentage = (y / rect.height) * 100;

            // Update the SVG mask position
            revealMask.setAttribute('cx', `${cxPercentage}%`);
            revealMask.setAttribute('cy', `${cyPercentage}%`);
        });

        // Optional: Reset to center on leave
        footerContainer.addEventListener('mouseleave', () => {
            revealMask.setAttribute('cx', '50%');
            revealMask.setAttribute('cy', '50%');
        });
    }
});



// ===============================================================
//  ⭐ AUTO FETCH GITHUB REPO DATA ⭐
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
    try {
        const results = await Promise.all(REPOS.map(r => fetchRepoData(r)));
        window.myProjects = results;

        const grid = document.getElementById("github-projects-grid");
        if (grid) grid.innerHTML = "";

        loadPremiumProjects();
    } catch (e) {
        console.error("GitHub fetch failed:", e);
    }
}



// ===============================================================
//  ⭐ PREMIUM PROJECT RENDERER (UPDATED WITH ICONS) ⭐
// ===============================================================

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
            .map(lang => `<span class="text-[10px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700/50">${lang}</span>`)
            .join("");

        const liveIcon = repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" title="Live Demo"
                class="p-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5"
                    viewBox="0 0 24 24">
                    <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h5V3H5c-1.1 0-2 .9-2 2v5h2V5Zm0 9H3v5c0 1.1.9 2 2 2h5v-2H5v-5Zm14-2h2v5c0 1.1-.9 2-2 2h-5v-2h5v-5Z"/>
                </svg>
            </a>
        ` : "";

        const githubIcon = `
            <a href="${repo.html_url}" target="_blank" title="GitHub Code"
                class="p-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all">
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
                        <div class="flex gap-2">${languagesHtml}</div>
                    </div>

                </div>
            </div>
        `;

        projectsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

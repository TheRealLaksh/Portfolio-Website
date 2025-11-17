// Wait for the DOM to be fully loaded before running any scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- INITIALIZE LIBRARIES ---
    AOS.init({
        duration: 800,
        once: true,
    });

    // --- HERO SECTION TYPING ANIMATION ---
    const typedTextElement = document.getElementById('typed-text');
    if (typedTextElement) {
        new Typed('#typed-text', {
            strings: ['a Web Developer', 'an Aspiring AI/ML Engineer', 'a Passionate Learner'],
            typeSpeed: 20,
            backSpeed: 20,
            backDelay: 3000,
            loop: true
        });
    }

    // --- MOBILE MENU TOGGLE ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('#mobile-menu .nav-link');
    if (mobileMenuButton && mobileMenu) {
        const toggleMenu = () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            const hamburgerIcon = mobileMenuButton.querySelector('.hamburger-icon');
            const closeIcon = mobileMenuButton.querySelector('.close-icon');
            hamburgerIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        };

        mobileMenuButton.addEventListener('click', toggleMenu);
        navLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // --- SMOOTH SCROLLING FOR NAV LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- SCROLL PROGRESS INDICATOR ---
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollProgress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrollProgress + '%';
        });
    }

    // --- "COPIED TO CLIPBOARD" NOTIFICATION ---
    const copyButtons = document.querySelectorAll('[data-copy]');
    const copyNotification = document.getElementById('copy-notification');
    if (copyButtons.length > 0 && copyNotification) {
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const textToCopy = button.getAttribute('data-copy');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Show notification pop-up
                    copyNotification.textContent = `${button.getAttribute('data-type')} copied to clipboard!`;
                    copyNotification.classList.add('show');

                    // Hide notification after 2.5 seconds
                    setTimeout(() => {
                        copyNotification.classList.remove('show');
                    }, 2500);
                });
            });
        });
    }

    // --- STICKY HEADER & SCROLL-TO-TOP BUTTON & ACTIVE NAV LINK ON SCROLL ---
    const header = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const sections = document.querySelectorAll('section[id]');
    const desktopNavLinks = document.querySelectorAll('#main-header .nav-link');

    const handleScroll = () => {
        // Sticky Header & Scroll-to-Top
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.remove('hidden');
        } else {
            header.classList.remove('header-scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.add('hidden');
        }

        // Active Nav Link on Scroll
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 150) {
                currentSection = section.getAttribute('id');
            }
        });

        desktopNavLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active-link');
            }
        });
    };
    window.addEventListener('scroll', handleScroll);
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- CURSOR SPOTLIGHT EFFECT ---
    const spotlight = document.querySelector('.spotlight');
    if (spotlight) {
        window.addEventListener('mousemove', e => {
            requestAnimationFrame(() => {
                spotlight.style.setProperty('--x', e.clientX + 'px');
                spotlight.style.setProperty('--y', e.clientY + 'px');
            });
        });
    }

    // --- GITHUB PROJECTS FETCH ---
    const projectsGrid = document.getElementById('github-projects-grid');
    if (projectsGrid) {
        fetchGitHubProjects('TheRealLaksh');
    }
});

/**
 * Fetches repositories and their languages for a given GitHub user and displays them.
 * @param {string} username - The GitHub username.
 */
async function fetchGitHubProjects(username) {
    const projectsGrid = document.getElementById('github-projects-grid');
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
        const repos = await response.json();

        projectsGrid.innerHTML = ''; // Clear loading message

        if (repos.length === 0) {
            projectsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">No public projects found.</p>';
            return;
        }

        // Loop through each repository to create its card using the new "Terminal Style"
        for (const repo of repos) {
            const projectCardHTML = `
                <div class="spotlight-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col h-full relative group transition-all duration-300 hover:-translate-y-1" data-aos="fade-up">
                    <div class="flex items-center gap-2 mb-4 opacity-50">
                        <div class="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>

                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <h3 class="text-xl font-bold text-white group-hover:text-sky-400 transition-colors truncate pr-4">
                            ${repo.name}
                        </h3>
                        <div class="text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        </div>
                    </div>
                    
                    <p class="text-slate-400 text-sm flex-grow mb-6 font-mono bg-black/20 p-3 rounded border border-white/5">
                        > ${repo.description || "No description available."}
                    </p>

                    <div class="flex items-center justify-between mt-auto relative z-10">
                        <span class="text-xs font-medium px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            ${repo.language || "Code"}
                        </span>
                        <a href="${repo.html_url}" target="_blank" class="text-sm font-medium text-white hover:text-sky-400 transition-colors flex items-center gap-1">
                            View Source <span class="text-xs">↗</span>
                        </a>
                    </div>
                </div>
            `;
            
            projectsGrid.insertAdjacentHTML('beforeend', projectCardHTML);
        }

    } catch (error) {
        console.error('Failed to fetch GitHub projects:', error);
        projectsGrid.innerHTML = `<p class="text-slate-400 col-span-full text-center">
            Could not load projects from GitHub. This might be due to API rate limiting. 
            <br>
            Please check the console for errors or view my projects directly on 
            <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="font-bold text-sky-400 hover:underline">my GitHub profile</a>.
        </p>`;
    }
}
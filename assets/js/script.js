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
            strings: ['Laksh Pradhwani', 'a Web Developer', 'Laksh Pradhwani','an aspiring AI/ML Engineer'],
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

    // Map of languages to their corresponding colors for styling
    const languageColors = { 'JavaScript': '#f1e05a', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Python': '#3572A5', 'TypeScript': '#3178c6', 'Java': '#b07219', 'C++': '#f34b7d', 'Go': '#00ADD8' };
    const defaultColor = '#94a3b8';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
        const repos = await response.json();

        projectsGrid.innerHTML = ''; // Clear loading message

        if (repos.length === 0) {
            projectsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">No public projects found.</p>';
            return;
        }

        // Loop through each repository to create its card
        for (const repo of repos) {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-aos', 'fade-up');

            // Fetch all languages for the current repository
            const langResponse = await fetch(repo.languages_url);
            const languages = await langResponse.json();
            const languageKeys = Object.keys(languages);

            let languagesHtml = '';
            if (languageKeys.length > 0) {
                languageKeys.forEach(lang => {
                    const langColor = languageColors[lang] || defaultColor;
                    languagesHtml += `<div class="language-item"><span class="language-dot" style="background-color: ${langColor}"></span><span>${lang}</span></div>`;
                });
            } else {
                languagesHtml = `<div class="language-item"><span class="language-dot" style="background-color: ${defaultColor}"></span><span>N/A</span></div>`;
            }

            // Check for a live site link in the repo's homepage field
            let liveSiteLink = '';
            if (repo.homepage && repo.homepage !== "") {
                liveSiteLink = `<div class="project-live-link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg><a href="${repo.homepage}" target="_blank" rel="noopener noreferrer">View Live Site</a></div>`;
            }

            // Construct the final project card HTML
            projectCard.innerHTML = `
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">${repo.description || 'No description provided.'}</p>
                ${liveSiteLink}
                <div class="project-footer">
                    <div class="project-languages-container">${languagesHtml}</div>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub →</a>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
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
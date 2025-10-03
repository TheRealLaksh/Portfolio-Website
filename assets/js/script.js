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
            strings: ['Laksh Pradhwani', 'a Web Developer', 'an aspiring AI/ML Engineer'],
            typeSpeed: 40,
            backSpeed: 20,
            backDelay: 3000,
            loop: true
        });
    }

    // --- MOBILE MENU TOGGLE ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            const hamburgerIcon = mobileMenuButton.querySelector('.hamburger-icon');
            const closeIcon = mobileMenuButton.querySelector('.close-icon');
            hamburgerIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }

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
                
                // Use a temporary textarea to perform the copy action
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // Show notification pop-up
                copyNotification.textContent = `${button.getAttribute('data-type')} copied to clipboard!`;
                copyNotification.classList.add('show');

                // Hide notification after 2.5 seconds
                setTimeout(() => {
                    copyNotification.classList.remove('show');
                }, 2500);
            });
        });
    }

    // --- STICKY HEADER & SCROLL-TO-TOP BUTTON ---
    const header = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.remove('hidden');
        } else {
            header.classList.remove('header-scrolled');
            if (scrollToTopBtn) scrollToTopBtn.classList.add('hidden');
        }
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

    // --- DYNAMIC CONSTELLATION BACKGROUND ---
    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();

        // Particle class for creating individual points
        class Particle {
            constructor(x, y, dX, dY, size, color) {
                this.x = x; this.y = y; this.directionX = dX; this.directionY = dY; this.size = size; this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        // Initialize particles
        function init() {
            particlesArray = [];
            const numParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numParticles; i++) {
                const size = Math.random() * 2 + 1;
                const x = Math.random() * (window.innerWidth - size * 2) + size;
                const y = Math.random() * (window.innerHeight - size * 2) + size;
                const dX = (Math.random() * 0.4) - 0.2;
                const dY = (Math.random() * 0.4) - 0.2;
                const color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
                particlesArray.push(new Particle(x, y, dX, dY, size, color));
            }
        }

        // Draw lines between nearby particles
        function connect() {
            let opacity = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = Math.sqrt((particlesArray[a].x - particlesArray[b].x) ** 2 + (particlesArray[a].y - particlesArray[b].y) ** 2);
                    if (distance < 150) {
                        opacity = 1 - (distance / 150);
                        ctx.strokeStyle = `rgba(100, 116, 139, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particlesArray.forEach(p => p.update());
            connect();
        }
        
        // Re-initialize canvas on window resize
        window.addEventListener('resize', () => {
            setCanvasSize();
            init();
        });

        init();
        animate();
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
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub &rarr;</a>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        }
    } catch (error) {
        console.error('Failed to fetch GitHub projects:', error);
        projectsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">Could not load projects.</p>';
    }
}
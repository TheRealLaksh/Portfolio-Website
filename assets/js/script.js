// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Animate On Scroll (AOS) Library
    AOS.init({
        duration: 800,
        once: true,
    });

    // --- Mobile Menu Toggle Script ---
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

    // --- Sticky Header and Scroll-to-Top Button Script ---
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

    // --- Cursor Spotlight Effect Script ---
    const spotlight = document.querySelector('.spotlight');
    if (spotlight) {
        window.addEventListener('mousemove', e => {
            requestAnimationFrame(() => {
                spotlight.style.setProperty('--x', e.clientX + 'px');
                spotlight.style.setProperty('--y', e.clientY + 'px');
            });
        });
    }

    // --- Fetch GitHub Projects Script ---
    const projectsGrid = document.getElementById('github-projects-grid');
    if (projectsGrid) {
        fetchGitHubProjects('TheRealLaksh'); // Your GitHub username is here
    }

    // --- Constellation Background Script ---
    const canvas = document.getElementById('constellation-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
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

        function init() {
            particlesArray = [];
            const numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 1;
                const x = Math.random() * (window.innerWidth - size * 2) + size;
                const y = Math.random() * (window.innerHeight - size * 2) + size;
                const directionX = (Math.random() * 0.4) - 0.2;
                const directionY = (Math.random() * 0.4) - 0.2;
                const color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = Math.sqrt(
                        (particlesArray[a].x - particlesArray[b].x) ** 2 +
                        (particlesArray[a].y - particlesArray[b].y) ** 2
                    );
                    const connectionRadius = 150;
                    if (distance < connectionRadius) {
                        opacityValue = 1 - (distance / connectionRadius);
                        ctx.strokeStyle = `rgba(100, 116, 139, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particlesArray.forEach(particle => particle.update());
            connect();
        }

        window.addEventListener('resize', () => {
            setCanvasSize();
            init();
        });

        init();
        animate();
    }
});

async function fetchGitHubProjects(username) {
    const projectsGrid = document.getElementById('github-projects-grid');
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`GitHub API returned a ${response.status} error.`);
        }
        const repos = await response.json();

        projectsGrid.innerHTML = ''; // Clear the loading message

        if (repos.length === 0) {
            projectsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">No public projects found.</p>';
            return;
        }

        repos.forEach(repo => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-aos', 'fade-up');

            projectCard.innerHTML = `
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">${repo.description || 'No description available.'}</p>
                <div class="project-footer">
                    <div class="project-language">
                        <span class="language-dot"></span>
                        <span>${repo.language || 'N/A'}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                        View on GitHub &rarr;
                    </a>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
        });

    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        projectsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">Could not load projects. Please try again later.</p>';
    }
}
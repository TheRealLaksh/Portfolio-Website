// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Animate On Scroll (AOS) Library
    // This library handles the animations that trigger on scroll
    AOS.init({
        duration: 800, // Duration of the animation in milliseconds
        once: true,    // Whether animation should happen only once - while scrolling down
    });

    // --- Cursor Spotlight Effect Script ---
    const spotlight = document.querySelector('.spotlight');

    // Only run this script if the spotlight element exists
    if (spotlight) {
        window.addEventListener('mousemove', e => {
            // Use requestAnimationFrame for performance optimization
            // It ensures the DOM is updated at the best time for the browser
            requestAnimationFrame(() => {
                spotlight.style.setProperty('--x', e.clientX + 'px');
                spotlight.style.setProperty('--y', e.clientY + 'px');
            });
        });
    }

    // --- Constellation Background Script ---
    const canvas = document.getElementById('constellation-canvas');
    
    // Only run this script if the canvas element exists
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;

        // Function to set the canvas to the full window size
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        setCanvasSize();

        // Definition for a single particle
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            // Method to draw the particle on the canvas
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            // Method to update the particle's position and redraw it
            update() {
                // Bounce off the edges of the canvas
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }
                // Move the particle
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        // Function to create and initialize the particles
        function init() {
            particlesArray = [];
            // Calculate the number of particles based on canvas area for density
            const numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 1;
                const x = Math.random() * (window.innerWidth - size * 2) + size;
                const y = Math.random() * (window.innerHeight - size * 2) + size;
                const directionX = (Math.random() * 0.4) - 0.2;
                const directionY = (Math.random() * 0.4) - 0.2;
                // Get the color from the CSS variable for easy theme changes
                const color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Function to draw lines between nearby particles
        function connect() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    // Correctly calculate the distance between two particles
                    let distance = Math.sqrt(
                        (particlesArray[a].x - particlesArray[b].x) ** 2 +
                        (particlesArray[a].y - particlesArray[b].y) ** 2
                    );

                    // A more reliable connection radius, e.g., 150 pixels
                    const connectionRadius = 150; 
                    
                    // If particles are close enough, draw a line between them
                    if (distance < connectionRadius) {
                        opacityValue = 1 - (distance / connectionRadius);
                        ctx.strokeStyle = `rgba(100, 116, 139, ${opacityValue})`; // slate-500 with opacity
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // The main animation loop that runs continuously
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // Clear canvas each frame
            particlesArray.forEach(particle => {
                particle.update();
            });
            connect();
        }

        // Event listener to handle window resizing
        window.addEventListener('resize', () => {
            setCanvasSize();
            init(); // Re-initialize particles for the new size
        });

        // Start the animation
        init();
        animate();
    }
});

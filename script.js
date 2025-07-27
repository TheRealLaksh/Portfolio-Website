

// Typewriter Effect
const typeText = ["AI Enthusiast", "Tech Sassy", "Lifelong Learner"];
let i = 0, j = 0, currentText = "", isDeleting = false;

function type() {
  if (i < typeText.length) {
    if (!isDeleting && j <= typeText[i].length) {
      currentText = typeText[i].substring(0, j++);
    } else if (isDeleting && j >= 0) {
      currentText = typeText[i].substring(0, j--);
    }

    document.getElementById("typewriter").textContent = currentText;

    if (!isDeleting && j === typeText[i].length) {
      isDeleting = true;
      setTimeout(type, 1000);
    } else if (isDeleting && j === 0) {
      isDeleting = false;
      i = (i + 1) % typeText.length;
      setTimeout(type, 500);
    } else {
      setTimeout(type, isDeleting ? 50 : 100);
    }
  }
}
type();
// Tech-themed animated background
const canvas = document.getElementById("tech-bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nodes = [];
for (let i = 0; i < 90; i++) {
  nodes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: 2 + Math.random() * 1.5
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  nodes.forEach((n, i) => {
    n.x += n.vx;
    n.y += n.vy;

    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff";
    ctx.fill();
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(0,255,255,${1 - dist / 120})`;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

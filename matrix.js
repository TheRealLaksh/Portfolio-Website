document.addEventListener('DOMContentLoaded', () => {
    const matrixContainer = document.createElement('div');
    matrixContainer.style.position = 'fixed';
    matrixContainer.style.top = '0';
    matrixContainer.style.left = '0';
    matrixContainer.style.width = '100%';
    matrixContainer.style.height = '100%';
    matrixContainer.style.zIndex = '-1';
    matrixContainer.style.overflow = 'hidden';
    document.body.appendChild(matrixContainer);

    const canvas = document.createElement('canvas');
    matrixContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let columns = Math.floor(width / 20);
    const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = characters.split('');
    let drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * 20, drops[i] * 20);

            if (drops[i] * 20 > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / 20);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
    });
});

/* assets/js/chatbot.js */

const chatData = {
    "greetings": {
        keywords: ["hi", "hello", "hey", "howdy", "hola", "start"],
        response: "Hello! I'm Laksh's AI assistant. I can tell you about his <b>Skills</b>, <b>Experience</b>, <b>Projects</b>, or <b>Education</b>. What would you like to know?"
    },
    "bio": {
        keywords: ["who", "about", "bio", "yourself", "background", "introduction"],
        response: "I am Laksh Pradhwani, an 18-year-old aspiring <b>AI/ML Engineer</b> from Varanasi. I specialize in full-stack development (MERN, Django) and building AI-powered applications."
    },
    "contact": {
        keywords: ["contact", "email", "reach", "hire", "phone", "linkedin"],
        response: "You can reach Laksh via email at <a href='mailto:laksh.pradhwani@gmail.com' style='color:#38bdf8; text-decoration:underline;'>laksh.pradhwani@gmail.com</a> or on <a href='https://linkedin.com/in/laksh-pradhwani' target='_blank' style='color:#38bdf8; text-decoration:underline;'>LinkedIn</a>."
    },
    "skills": {
        keywords: ["skills", "stack", "tech", "coding", "language", "python", "js"],
        response: "<b>My Tech Stack:</b><br>🌐 <b>Web:</b> MERN Stack, React, Firebase, Tailwind<br>⚙️ <b>Backend:</b> Python, Django, REST APIs<br>🤖 <b>AI/ML:</b> Neural Networks, TensorFlow basics<br>🔒 <b>Cyber:</b> Kali Linux, Pentesting"
    },
    "education": {
        keywords: ["education", "school", "college", "study", "grade", "class"],
        response: "I am currently in Class 12 (PCM + CS) at <b>Sunbeam School Lahartara</b> (2014–2026). Before this, I was a House Captain at Chinmaya International Residential School."
    },
    "experience": {
        keywords: ["experience", "work", "internship", "job", "company"],
        response: "<b>My Experience:</b><br>1. <b>Unified Mentor</b> (Full Stack Dev)<br>2. <b>MoreYeahs</b> (Web Dev - GigX Platform)<br>3. <b>Hotel Kavana</b> (IT Intern)"
    },
    "projects": {
        keywords: ["project", "build", "github", "portfolio", "gigx"],
        response: "<b>Top Projects:</b><br>🚀 <b>GigX Platform:</b> Gig marketplace with Django.<br>🎨 <b>Portfolio:</b> You are looking at it! (Three.js + Tailwind).<br>🌍 <b>Travel Site:</b> National finalist raw HTML/CSS project."
    },
    "resume": {
        keywords: ["resume", "cv", "download", "pdf"],
        response: "You can view or download my CV here: <a href='assets/resume/laksh.pradhwani.resume.pdf' target='_blank' style='color:#38bdf8; text-decoration:underline;'>Download Resume</a>"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    if (!toggleBtn || !chatWindow) {
        console.error("Chatbot elements not found. Check HTML structure.");
        return;
    }

    // Toggle Chat Visibility
    toggleBtn.addEventListener('click', () => {
        const isHidden = chatWindow.classList.contains('hidden');
        if (isHidden) {
            chatWindow.classList.remove('hidden');
            chatWindow.style.display = 'flex'; // Force display
            setTimeout(() => {
                chatWindow.style.opacity = '1';
                chatWindow.style.transform = 'scale(1) translateY(0)';
            }, 10);
            chatInput.focus();
            // Remove notification badge
            const badge = toggleBtn.querySelector('span');
            if (badge) badge.remove();
        } else {
            closeChat();
        }
    });

    // Close Chat Function
    function closeChat() {
        chatWindow.style.opacity = '0';
        chatWindow.style.transform = 'scale(0.9) translateY(20px)';
        setTimeout(() => {
            chatWindow.classList.add('hidden');
            chatWindow.style.display = 'none';
        }, 300);
    }

    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // Handle User Input
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            chatInput.value = '';

            // Simulate thinking
            showTyping();
            setTimeout(() => {
                const response = getBotResponse(message);
                removeTyping();
                addMessage(response, 'bot');
            }, 600 + Math.random() * 500);
        });
    }

    // Helper: Add Message to UI
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg-row ${sender}`;

        const avatarType = sender === 'bot' ? 'ai' : 'user';
        const avatarLabel = sender === 'bot' ? 'AI' : 'ME';

        div.innerHTML = `
            <div class="msg-avatar ${avatarType}">${avatarLabel}</div>
            <div class="msg-bubble ${avatarType}">${text}</div>
        `;

        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    // Helper: Typing Indicator
    let typingDiv;
    function showTyping() {
        typingDiv = document.createElement('div');
        typingDiv.className = 'msg-row bot';
        typingDiv.innerHTML = `
            <div class="msg-avatar ai">AI</div>
            <div class="msg-bubble ai" style="font-style:italic; opacity:0.7;">Typing...</div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTyping() {
        if (typingDiv) typingDiv.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // AI Logic
    function getBotResponse(input) {
        input = input.toLowerCase();
        for (const topic in chatData) {
            if (chatData[topic].keywords.some(k => input.includes(k))) {
                return chatData[topic].response;
            }
        }
        return "I'm not sure about that, but you can ask about my <b>Skills</b>, <b>Projects</b>, or <b>Experience</b>.";
    }

    // Make sendPreset global so HTML onclick works
    window.sendPreset = function (msg) {
        addMessage(msg, 'user');
        showTyping();
        setTimeout(() => {
            const response = getBotResponse(msg);
            removeTyping();
            addMessage(response, 'bot');
        }, 600);
    };
});
/* assets/js/chatbot.js
   Smart Portfolio Chatbot Logic
*/

const chatData = {
    "greetings": {
        keywords: ["hi", "hello", "hey", "morning", "evening", "start"],
        response: "Hello! I'm Laksh's portfolio AI. I can tell you about his *skills, internships, projects,* or *education*. What's on your mind?"
    },
    "bio": {
        keywords: ["who are you", "about", "bio", "yourself", "background", "laksh", "introduction"],
        response: "I am Laksh Pradhwani, an 18-year-old aspiring **AI/ML Engineer** and high school student from Varanasi. I specialize in full-stack development (MERN), Python/Django backends, and AI automation. I love turning creative ideas into functional code!"
    },
    "contact": {
        keywords: ["contact", "email", "reach", "hire", "phone", "connect", "linkedin"],
        response: "You can reach Laksh via email at <a href='mailto:laksh.pradhwani@gmail.com' class='text-sky-400 underline'>laksh.pradhwani@gmail.com</a> or connect on <a href='https://linkedin.com/in/laksh-pradhwani' target='_blank' class='text-sky-400 underline'>LinkedIn</a>."
    },
    "skills": {
        keywords: ["skills", "stack", "technologies", "language", "programming", "coding", "tech"],
        response: "Here is my technical arsenal:<br>• **Web:** HTML5, CSS3, JS, MERN Stack, React, Firebase<br>• **Backend:** Python, Django, REST APIs<br>• **AI/ML:** Neural Networks, Feature Engineering, Clustering<br>• **Cybersecurity:** Kali Linux, Pentesting basics"
    },
    "education": {
        keywords: ["education", "school", "college", "study", "studying", "class", "grade"],
        response: "I am currently in Class 12 (PCM + CS) at **Sunbeam School Lahartara** (2014–2026). Previously, I was a House Captain at **Chinmaya International Residential School** (2019–2024)."
    },
    "experience": {
        keywords: ["experience", "work", "internship", "job", "company", "unified", "moreyeahs", "hotel"],
        response: "I have completed 3 key internships:<br>1. **Unified Mentor** (Full Stack Dev) - Built React/Firebase apps.<br>2. **MoreYeahs** (Web Dev) - Built the GigX platform using Django.<br>3. **Hotel Kavana** (IT Intern) - Managed hotel IT infrastructure."
    },
    "projects": {
        keywords: ["project", "build", "portfolio", "gigx", "app", "website", "github"],
        response: "My flagship projects include:<br>• **GigX Platform:** A Django-based gig marketplace with auth & dashboards.<br>• **Portfolio (This site):** Fully animated Three.js & Tailwind site.<br>• **Manual Travel Site:** A national finalist project built with raw HTML/CSS."
    },
    "achievements": {
        keywords: ["achievement", "award", "win", "won", "hackathon", "competition", "rank"],
        response: "Some highlights:<br>🏆 **School/District Topper** in VVM (Vidyarthi Vigyan Manthan).<br>🤖 **2nd Place** in Robowars (Impetus ’25).<br>🎖️ **NCC 'A' Certificate** holder.<br>🏅 Multiple Hackathon wins (WebWiz, Tech Ramble)."
    },
    "certifications": {
        keywords: ["certif", "course", "learning", "iit", "google"],
        response: "I hold certifications in:<br>• **Data Science & AI** (IIT Madras School Connect)<br>• **Generative AI Mastermind** (Outskill)<br>• **Cyber Investigator** (DeepCytes UK)<br>• **Google Play Academy**"
    },
    "resume": {
        keywords: ["resume", "cv", "download", "pdf"],
        response: "You can view or download my full Resume/CV <a href='assets/resume/laksh.pradhwani.resume.pdf' target='_blank' class='text-sky-400 underline'>here</a>."
    }
};

// DOM Elements
const toggleBtn = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeBtn = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('chat-messages');

// Toggle Chat
toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    // Remove notification dot once opened
    const notif = toggleBtn.querySelector('span');
    if(notif) notif.remove();
    if (!chatWindow.classList.contains('hidden')) chatInput.focus();
});

closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

// Handle User Input
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatInput.value = '';
    
    // Simulate AI thinking time
    showTyping();
    setTimeout(() => {
        const response = getBotResponse(message);
        removeTyping();
        addMessage(response, 'bot');
    }, 600 + Math.random() * 500);
});

function sendPreset(msg) {
    addMessage(msg, 'user');
    showTyping();
    setTimeout(() => {
        const response = getBotResponse(msg);
        removeTyping();
        addMessage(response, 'bot');
    }, 600);
}

// UI Helper: Add Message
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `flex items-start gap-3 ${sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`;
    
    const avatar = sender === 'bot' 
        ? `<div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-sky-400 text-xs font-bold">AI</div>`
        : `<div class="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">ME</div>`;

    const bubbleStyle = sender === 'bot'
        ? 'bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-tl-none'
        : 'bg-sky-600 text-white rounded-tr-none shadow-lg shadow-sky-900/20';

    div.innerHTML = `
        ${avatar}
        <div class="${bubbleStyle} p-3 rounded-2xl text-sm max-w-[80%] leading-relaxed">
            ${text}
        </div>
    `;
    
    messagesContainer.appendChild(div);
    scrollToBottom();
}

// Typing Indicator
let typingDiv;
function showTyping() {
    typingDiv = document.createElement('div');
    typingDiv.className = 'flex items-center gap-2 ml-11 mb-4';
    typingDiv.innerHTML = `
        <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
        <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
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

// The "AI" Brain
function getBotResponse(input) {
    input = input.toLowerCase();
    
    // 1. Iterate through knowledge base
    for (const topic in chatData) {
        const data = chatData[topic];
        if (data.keywords.some(keyword => input.includes(keyword))) {
            return data.response;
        }
    }

    // 2. Fallback logic
    return "I'm not sure about that, but I can tell you about my **projects**, **experience**, or **skills**. You can also email me at laksh.pradhwani@gmail.com.";
}
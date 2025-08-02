// Main JavaScript for All Fixed Appliance Repair Website

document.addEventListener('DOMContentLoaded', function() {
    // Disable chat until ready
    document.querySelectorAll('.chat-launch-button').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            alert('Pardon our dust — live chat is still under construction.');
        });
    });

    // Initialize navigation dropdown functionality
    initNavigation();
    
    // Display business hours and open/closed status
    displayBusinessHours();
    
    // Initialize animations
    initAnimations();
});

// Navigation Functionality
function initNavigation() {
    // Mobile navigation toggle (if needed)
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
            const nav = document.querySelector('.main-navigation');
            nav.classList.toggle('mobile-nav-open');
        });
    }
    
    // Add hover effect for desktop navigation dropdowns
    const navItems = document.querySelectorAll('.unifiednav__item-wrap');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const subNav = this.querySelector('.unifiednav__container_sub-nav');
            if (subNav) {
                subNav.style.opacity = '1';
                subNav.style.visibility = 'visible';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const subNav = this.querySelector('.unifiednav__container_sub-nav');
            if (subNav) {
                subNav.style.opacity = '0';
                subNav.style.visibility = 'hidden';
            }
        });
    });
}

// Business Hours Display
function displayBusinessHours() {
    const hoursElement = document.querySelector('.openHours .status');
    if (!hoursElement) return;
    
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes; // 830 = 8:30 AM, 1730 = 5:30 PM
    
    // Business hours: Monday-Friday 8:00 AM - 5:00 PM
    let isOpen = false;
    let statusText = '';
    
    // Check if it's a weekday (Monday-Friday)
    if (day >= 1 && day <= 5) {
        // Check if current time is between 8:00 AM and 5:00 PM
        if (currentTime >= 800 && currentTime < 1700) {
            isOpen = true;
        }
    }
    
    if (isOpen) {
        statusText = 'OPEN NOW';
        hoursElement.style.color = '#4CAF50'; // Green for open
    } else {
        statusText = 'CLOSED NOW';
        hoursElement.style.color = '#F44336'; // Red for closed
    }
    
    hoursElement.textContent = statusText;
    
    // Display full hours below status if needed
    const fullHoursElement = document.querySelector('.full-hours');
    if (fullHoursElement) {
        fullHoursElement.innerHTML = `
            <p>Monday: 8:00 AM - 5:00 PM</p>
            <p>Tuesday: 8:00 AM - 5:00 PM</p>
            <p>Wednesday: 8:00 AM - 5:00 PM</p>
            <p>Thursday: 8:00 AM - 5:00 PM</p>
            <p>Friday: 8:00 AM - 5:00 PM</p>
            <p>Saturday: Closed</p>
            <p>Sunday: Closed</p>
        `;
    }
}

// Animation Functionality
function initAnimations() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('[data-anim-desktop="fadeIn"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class or trigger animation
                    entry.target.style.opacity = '1';
                    entry.target.style.animation = 'fadeIn 1s ease forwards';
                    
                    // Stop observing the element after it's animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when at least 10% of the element is visible
        });
        
        // Observe each animated element
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const animatedElements = document.querySelectorAll('[data-anim-desktop="fadeIn"]');
        animatedElements.forEach(element => {
            element.style.opacity = '1';
        });
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Helper function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
} 

// =========================
//  Simple Chatbot Widget
// =========================
(function() {
    function initChatbot() {
        // Identify a launcher: prefer the sidebar live-chat button if it exists
        let chatLauncher = document.querySelector('.chat-launch-button');
        const hasCustomLauncher = !!chatLauncher;

        // Prevent multiple initialisations
        if (document.querySelector('.chatbot-window')) {
            if (hasCustomLauncher) {
                chatLauncher.addEventListener('click', openChat);
            }
            return;
        }

        // If no launcher in the DOM, build the floating bubble
        if (!chatLauncher) {
            chatLauncher = document.createElement('div');
            chatLauncher.className = 'chatbot-button';
            chatLauncher.textContent = '💬';
            chatLauncher.setAttribute('aria-label', 'Open live chat');
            document.body.appendChild(chatLauncher);
        }

        // Build chat window
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chatbot-window';
        chatWindow.innerHTML = `
            <div class="chatbot-header">Chat with us <span class="chatbot-close" aria-label="Close chat">✖</span></div>
            <div class="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" placeholder="Type your message…" aria-label="Chat message" />
                <button type="button" aria-label="Send message">Send</button>
            </div>`;
        document.body.appendChild(chatWindow);

        const closeBtn = chatWindow.querySelector('.chatbot-close');
        const messages = chatWindow.querySelector('.chatbot-messages');
        const input = chatWindow.querySelector('input');
        const sendBtn = chatWindow.querySelector('button');
        const BOT_GREET = 'Hello! 👋 How can we assist you today?';

        function addMessage(text, isUser = false) {
            const bubble = document.createElement('div');
            bubble.className = 'chatbot-bubble' + (isUser ? ' user' : '');
            bubble.textContent = text;
            messages.appendChild(bubble);
            messages.scrollTop = messages.scrollHeight;
        }

        function botReply(userText) {
            const txt = userText.toLowerCase();
            let reply = 'Thank you for reaching out! For urgent issues, please call us at (540) 208-2627.';
            if (txt.includes('hello') || txt.includes('hi') || txt.includes('hey')) {
                reply = BOT_GREET;
            } else if (txt.includes('hours') || txt.includes('open')) {
                reply = 'We are open Monday–Friday, 8:00 AM–5:00 PM. How can we help?';
            } else if (txt.includes('price') || txt.includes('cost')) {
                reply = 'Diagnostics are $90 (waived if we complete the repair). We provide a quote before any work.';
            }
            setTimeout(() => addMessage(reply), 600);
        }

        function handleSend() {
            const text = input.value.trim();
            if (!text) return;
            addMessage(text, true);
            input.value = '';
            botReply(text);
        }

        function openChat(e) {
            if (e) e.preventDefault();
            chatWindow.style.display = 'flex';
            if (!hasCustomLauncher) chatLauncher.style.display = 'none';
            messages.innerHTML = '';
            addMessage(BOT_GREET);
            input.focus();
        }

        function closeChat() {
            chatWindow.style.display = 'none';
            if (!hasCustomLauncher) chatLauncher.style.display = 'flex';
        }

        // Bind events
        chatLauncher.addEventListener('click', openChat);
        closeBtn.addEventListener('click', closeChat);
        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();

// =====================================
// Make entire service-icon cards clickable
// =====================================
(function() {
    function bindServiceIconLinks() {
        document.querySelectorAll('.service-icon[data-link]').forEach(card => {
            const url = card.getAttribute('data-link');
            if (!url) return;
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                window.location.href = url;
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = url;
                }
            });
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindServiceIconLinks);
    } else {
        bindServiceIconLinks();
    }
})(); 

// =====================================
// Sidebar help widget collapse/restore
// =====================================
(function(){
    function initHelpWidgetToggle(){
        const widget = document.querySelector('.sidebar-contact-widget');
        const restoreBtn = document.querySelector('.sidebar-contact-restore');
        const collapseBtn = widget ? widget.querySelector('.widget-collapse') : null;
        if(!widget || !restoreBtn || !collapseBtn) return;

        function collapse(){
            widget.style.display='none';
            restoreBtn.style.display='flex';
        }
        function restore(){
            widget.style.display='block';
            restoreBtn.style.display='none';
        }
        collapseBtn.addEventListener('click', collapse);
        restoreBtn.addEventListener('click', restore);
        restoreBtn.addEventListener('keypress', (e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();restore();}});
    }
    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded', initHelpWidgetToggle);
    }else{initHelpWidgetToggle();}
})(); 

// =====================================
// Reviews carousel
// =====================================
(function(){
    const CAROUSEL_SELECTOR = '#reviews-carousel';
    const VISIBLE_COUNT = 3;
    const AUTO_INTERVAL = 15000; // 15 seconds

    async function fetchReviews(){
        try{
            const res = await fetch('assets/data/reviews.json');
            if(!res.ok) throw new Error('Network');
            const data = await res.json();
            return data.reviews || [];
        }catch(e){
            console.warn('Could not load reviews, falling back to static sample');
            return [
                {author:'Sarah M.',city:'Fredericksburg',rating:5, text:'Excellent service! Fixed my refrigerator quickly and professionally. The technician was knowledgeable and explained everything clearly.', date:'2024-01-15'},
                {author:'John D.',city:'Stafford',rating:5, text:'Very reliable and fair pricing. They came the same day I called and had my washer working perfectly. Highly recommend!', date:'2024-01-10'},
                {author:'Maria L.',city:'Spotsylvania',rating:5, text:'Professional, courteous, and efficient. They diagnosed and fixed my dishwasher issue in under an hour. Great warranty too!', date:'2024-01-05'}
            ];
        }
    }

    function createReviewHTML(r){
        const stars = '⭐'.repeat(r.rating);
        return `<div class="review-item">
            <div class="review-stars" aria-label="${r.rating} star review">${stars}</div>
            <blockquote>"${r.text}"</blockquote>
            <cite class="reviewer">- ${r.author}, ${r.city}</cite>
        </div>`;
    }

    function initCarousel(reviews){
        const container=document.querySelector(CAROUSEL_SELECTOR);
        if(!container) return;
        const prevBtn=document.querySelector('.carousel-prev');
        const nextBtn=document.querySelector('.carousel-next');
        let index=0;
        function render(){
            const slice=[];
            for(let i=0;i<VISIBLE_COUNT;i++){
                slice.push(reviews[(index+i)%reviews.length]);
            }
            container.innerHTML=slice.map(createReviewHTML).join('');
        }
        function step(dir){
            index=(index+dir+reviews.length)%reviews.length;
            render();
        }
        render();
        let timer;
        function start(){ if(reviews.length>VISIBLE_COUNT){ timer=setInterval(()=>step(VISIBLE_COUNT),AUTO_INTERVAL);} }
        function stop(){clearInterval(timer);}
        start();
        container.addEventListener('mouseenter',stop);
        container.addEventListener('mouseleave',start);
        if(prevBtn&&nextBtn){
            prevBtn.addEventListener('click',()=>{stop();step(-VISIBLE_COUNT);start();});
            nextBtn.addEventListener('click',()=>{stop();step(VISIBLE_COUNT);start();});
        }
    }

    async function init(){
        const reviews=await fetchReviews();
        const filtered=reviews.filter(r=>r.rating>=4).slice(0,30);
        if(filtered.length){initCarousel(filtered);}    }

    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',init);
    }else{init();}
})();
// ===================================== 
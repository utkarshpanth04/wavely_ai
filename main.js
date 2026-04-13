document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Reveal Animation Logic
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's a stats counter, trigger the counter logic
                if (entry.target.classList.contains('stat-item')) {
                    const numElement = entry.target.querySelector('.stat-num');
                    if(numElement && !numElement.dataset.counted) {
                        animateCounter(numElement);
                        numElement.dataset.counted = 'true';
                    }
                }
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // 2. Statistics Counter Logic
    function animateCounter(element) {
        const targetStr = element.innerText;
        // Parse numbers, preserving non-numeric chars (like %, +, K)
        const isPercentage = targetStr.includes('%');
        const isPlus = targetStr.includes('+');
        const isBillion = targetStr.includes('Bn');
        const isK = targetStr.includes('K');
        
        let targetNum = parseFloat(targetStr.replace(/[^0-9.]/g, ''));
        let startNum = 0;
        let duration = 2000; // 2 seconds
        let startTime = null;

        function updateDisplay(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentNum = startNum + (targetNum - startNum) * easeProgress;
            
            // Format back the string
            let displayStr = currentNum;
            // Handle decimal vs whole numbers based on original
            if(Number.isInteger(targetNum) && !targetStr.includes('.')) {
                displayStr = Math.floor(currentNum);
            } else {
                displayStr = currentNum.toFixed(2);
            }

            // Append suffixes
            if(isBillion) displayStr += 'Bn';
            if(isK) displayStr += 'K';
            if(isPercentage) displayStr += '%';
            if(isPlus) displayStr += '+';

            element.innerText = displayStr;

            if (progress < 1) {
                window.requestAnimationFrame(updateDisplay);
            } else {
                element.innerText = targetStr; // ensure final exact string
            }
        }

        window.requestAnimationFrame(updateDisplay);
    }


    // 3. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if(otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });


    // 4. Hero Typing Effect Simulation
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const originalText = subtitle.innerHTML;
        subtitle.innerHTML = '';
        subtitle.style.opacity = '1';
        
        let i = 0;
        // Typewriter effect only on the text parts if needed, 
        // to simplify we'll just implement a smooth opacity fade-in by letters 
        // but since HTML tags might be inside, a simple fade is safer if there are tags.
        // Let's do a basic character by character typing for pure text
        // If there's html, we will just use the CSS animation (which we did via .reveal)
        subtitle.innerHTML = originalText;
    }


    // 5. Mobile Hamburger Menu
    const mobileBtn    = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerClose  = document.getElementById('mobile-drawer-close');
    const drawerOverlay = document.getElementById('mobile-drawer-overlay');

    if (mobileBtn && mobileDrawer) {
        function openDrawer() {
            mobileDrawer.classList.add('open');
            mobileBtn.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            mobileDrawer.classList.remove('open');
            mobileBtn.classList.remove('open');
            document.body.style.overflow = '';
        }

        mobileBtn.addEventListener('click', () => {
            mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
        });

        if (drawerClose)   drawerClose.addEventListener('click', closeDrawer);
        if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

        // Close drawer on ESC
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeDrawer();
        });

        // Close drawer when a nav link is tapped
        mobileDrawer.querySelectorAll('.mobile-nav-link, .mobile-drawer-cta .btn').forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }

});


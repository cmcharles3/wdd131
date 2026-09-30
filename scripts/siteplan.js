/* =========================================================
   CEDAR3 TECHNOLOGY MAIN JAVASCRIPT
   Handles interactivity, navigation, and form validation
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 2. Quote Request Form Handling & Basic Validation
    const quoteForm = document.querySelector('.quote-form');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const serviceType = document.getElementById('service-type').value;

            // Simple validation check
            if (!fullName || !email || !serviceType) {
                alert('Please fill in all required fields before submitting.');
                return;
            }

            // Display confirmation feedback to user
            alert(`Thank you, ${fullName}! Your quote request for "${serviceType}" service has been received. A technician from Cedar3 Technology will contact you shortly.`);

            // Reset form fields
            quoteForm.reset();
        });
    }

    // 3. Highlight Active Navigation Section on Scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

});
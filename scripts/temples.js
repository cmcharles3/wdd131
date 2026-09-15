// Dynamic Copyright Year.
const currentYearSpan = document.querySelector("#currentyear");
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

// Dynamic Last Modified Date
const lastModifiedParagraph = document.querySelector("#lastModified");
if (lastModifiedParagraph) {
    lastModifiedParagraph.textContent = `Last Modification: ${document.lastModified}`;
}

// Hamburger Menu Toggle
const mainNav = document.querySelector(".navigation");
const hambutton = document.querySelector("#menu");

if (hambutton && mainNav) {
    hambutton.addEventListener("click", () => {
        mainNav.classList.toggle("open");
        hambutton.classList.toggle("open");
    });
}

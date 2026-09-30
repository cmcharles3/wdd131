document.addEventListener("DOMContentLoaded", () => {
  // 1. Get current count from localStorage (convert string to number)
  let reviewCount = Number(localStorage.getItem("numReviews-ls")) || 0;

  // 2. Increment the count by 1 for this page load
  reviewCount++;

  // 3. Store the updated count back to localStorage
  localStorage.setItem("numReviews-ls", reviewCount);

  // 4. Display the updated count in the HTML element
  const countDisplay = document.getElementById("review-count");
  if (countDisplay) {
    countDisplay.textContent = reviewCount;
  }

  // Footer Info
  const currentYearSpan = document.getElementById("currentyear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  const lastModifiedP = document.getElementById("lastModified");
  if (lastModifiedP) {
    lastModifiedP.textContent = `Last Modification: ${document.lastModified}`;
  }
});
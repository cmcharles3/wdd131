document.addEventListener("DOMContentLoaded", () => {
  // Retrieve or initialize the review count from localStorage
  let reviewCount = Number(window.localStorage.getItem("reviewCounter-ls")) || 0;

  // Increment the counter upon successful submission arrival
  reviewCount += 1;

  // Save the updated counter back to localStorage
  window.localStorage.setItem("reviewCounter-ls", reviewCount);

  // Display the count on screen
  const counterDisplay = document.querySelector("#reviewCounter");
  if (counterDisplay) {
    counterDisplay.textContent = reviewCount;
  }

  // Footer Year Setup
  const yearSpan = document.querySelector("#currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});


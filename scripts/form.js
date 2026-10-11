/* Provided Products Array */
const products = [
  { id: "fc-1888", name: "Flux capacitor", averagerating: 4.5 },
  { id: "fc-2050", name: "Power laces", averagerating: 4.7 },
  { id: "fs-1987", name: "Time circuits", averagerating: 3.5 },
  { id: "ac-2000", name: "Low voltage reactor", averagerating: 3.9 },
  { id: "jj-1969", name: "Warp equalizer", averagerating: 5.0 }
];

document.addEventListener("DOMContentLoaded", () => {
  // Dynamic Product Dropdown Population
  const productSelect = document.querySelector("#productName");

  if (productSelect) {
    products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id; 
      option.textContent = product.name; 
      productSelect.appendChild(option);
    });
  }

  // Footer Year Setup
  const yearSpan = document.querySelector("#currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
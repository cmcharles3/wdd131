/* Provided Products Array */
const products = [
  { id: "fc-1888", name: "flux capacitor", averagerating: 4.5 },
  { id: "fc-2050", name: "power laces", averagerating: 4.7 },
  { id: "fs-1987", name: "time circuits", averagerating: 3.5 },
  { id: "ac-2000", name: "low voltage reactor", averagerating: 3.9 },
  { id: "jj-1969", name: "warp equalizer", averagerating: 5.0 }
];

document.addEventListener("DOMContentLoaded", () => {
  /* Populate Product Select Field dynamically */
  const selectElement = document.getElementById("product-select");

  if (selectElement) {
    products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id; // Using product.id for the value attribute
      option.textContent = product.name; // Using product.name for display text
      selectElement.appendChild(option);
    });
  }

  /* Populate Footer Details */
  const currentYearSpan = document.getElementById("currentyear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  const lastModifiedP = document.getElementById("lastModified");
  if (lastModifiedP) {
    lastModifiedP.textContent = `Last Modification: ${document.lastModified}`;
  }
});

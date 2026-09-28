const temples = [
  {
    templeName: "Aba Nigeria",
    location: "Aba, Nigeria",
    dedicated: "2005, August, 7",
    area: 11500,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    templeName: "Manti Utah",
    location: "Manti, Utah, United States",
    dedicated: "1888, May, 21",
    area: 74792,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
  },
  {
    templeName: "Payson Utah",
    location: "Payson, Utah, United States",
    dedicated: "2015, June, 7",
    area: 96630,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    templeName: "Yigo Guam",
    location: "Yigo, Guam",
    dedicated: "2020, May, 2",
    area: 6861,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    templeName: "Washington D.C.",
    location: "Kensington, Maryland, United States",
    dedicated: "1974, November, 19",
    area: 156558,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    templeName: "Lima Perú",
    location: "Lima, Perú",
    dedicated: "1986, January, 10",
    area: 9600,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    templeName: "Mexico City Mexico",
    location: "Mexico City, Mexico",
    dedicated: "1983, December, 2",
    area: 116642,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  {
    templeName: "Salt Lake",
    location: "Salt Lake City, Utah, United States",
    dedicated: "1893, April, 6",
    area: 253015,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/salt-lake-city-utah/400x250/salt-lake-temple-37762.jpg"
  },
  {
    templeName: "Mesa Arizona",
    location: "Mesa, Arizona, United States",
    dedicated: "1927, October, 23",
    area: 10700,
    imageUrl: "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mesa-arizona/400x250/mesa-arizona-temple-1416672-wallpaper.jpg"
  }
];

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  displayTemples(temples);
  updateFooterInfo();
  setupNavigation();
});

// Render cards
function displayTemples(templeList) {
  const container = document.getElementById("temple-container");
  container.innerHTML = "";

  templeList.forEach(temple => {
    const card = document.createElement("section");
    card.classList.add("temple-card");

    card.innerHTML = `
      <h3>${temple.templeName}</h3>
      <p><span class="label">LOCATION:</span> ${temple.location}</p>
      <p><span class="label">DEDICATED:</span> ${temple.dedicated}</p>
      <p><span class="label">SIZE:</span> ${temple.area} sq ft</p>
      <img src="${temple.imageUrl}" alt="${temple.templeName} Temple" loading="lazy">
    `;

    container.appendChild(card);
  });
}

// Filter and set page heading
function setupNavigation() {
  const navLinks = document.querySelectorAll("nav a");
  const categoryTitle = document.getElementById("category-title");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      navLinks.forEach(nav => nav.classList.remove("active"));
      link.classList.add("active");

      const filterId = link.getAttribute("id");
      let filteredTemples = temples;

      switch (filterId) {
        case "old":
          categoryTitle.textContent = "Old";
          filteredTemples = temples.filter(t => parseInt(t.dedicated.split(",")[0]) < 1900);
          break;
        case "new":
          categoryTitle.textContent = "New";
          filteredTemples = temples.filter(t => parseInt(t.dedicated.split(",")[0]) > 2000);
          break;
        case "large":
          categoryTitle.textContent = "Large";
          filteredTemples = temples.filter(t => t.area > 90000);
          break;
        case "small":
          categoryTitle.textContent = "Small";
          filteredTemples = temples.filter(t => t.area < 10000);
          break;
        case "home":
        default:
          categoryTitle.textContent = "Home";
          filteredTemples = temples;
          break;
      }

      displayTemples(filteredTemples);
    });
  });
}

// Footer metadata
function updateFooterInfo() {
  const currentYearSpan = document.getElementById("currentyear");
  const lastModifiedSpan = document.getElementById("lastModified");

  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  if (lastModifiedSpan) {
    lastModifiedSpan.textContent = document.lastModified;
  }
}
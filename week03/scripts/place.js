// Footer Dynamic Dates
document.getElementById("lastModified").textContent = document.lastModified;

// Wind Chill Calculation Function (Metric: Celsius and km/h) in one line
const calculateWindChill = (temp, windSpeed) => 
    (13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16)).toFixed(1);

// Static weather input values matching HTML content
const temperature = 8; // in °C
const windSpeed = 12;  // in km/h

const windChillElement = document.getElementById("windchill");

// Check metric conditions before calculating wind chill:
// Temperature <= 10 °C AND Wind speed > 4.8 km/h
if (temperature <= 10 && windSpeed > 4.8) {
    windChillElement.textContent = calculateWindChill(temperature, windSpeed) + " °C";
} else {
    windChillElement.textContent = "N/A";
}
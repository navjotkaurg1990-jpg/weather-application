# Atmosphere - Weather Application

A breathtaking, modern web application that allows users to instantly view current weather conditions anywhere in the world. Built with a focus on rich aesthetics, it features a glassmorphism UI, animated gradients, and seamless API integrations.

## ✨ Features

- **Global Location Search**: Dynamically fetches and populates over 200+ countries and their respective cities using live REST APIs.
- **Real-Time Weather Data**: Provides the exact current temperature (in °C), sky conditions (e.g., clear sky, thunderstorm), and real-time wind speed.
- **Premium Aesthetics**: 
  - Dynamic, fluid gradient background that shifts continuously.
  - Frosty, translucent glassmorphism component layers.
  - Smooth micro-animations and intuitive hover states.
- **Zero Configuration Setup**: Completely built with Vanilla HTML, CSS, and JS. No massive Node modules, no build steps, and no API keys required immediately.

## 🛠️ Technologies Used

- **HTML5 & CSS3**: For the structural markup and the extensive modern styling (Animations, Backdrop Filters, Flexbox).
- **Vanilla JavaScript (ES6+)**: Handles all the asynchronous API calls and DOM manipulation.
- **APIs**:
  - `CountriesNow API` ([countriesnow.space](https://countriesnow.space/)): Used to dynamically populate the country and city dropdown select fields.
  - `Open-Meteo Geocoding API`: Connects the city text strings to actual geographical coordinates (Latitude & Longitude).
  - `Open-Meteo Weather API`: Pulls the active, live weather parameters for the requested coordinates.

## 🚀 Getting Started

This application operates completely locally and demands zero complex environment configurations.

### Prerequisites
- Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- An active internet connection (to retrieve live API data).

### Running the App
1. Clone or download this repository to your local machine.
2. Navigate to the project directory `/weather application/`.
3. Simply double-click the `index.html` file to open it directly in your browser.
4. **Alternatively (Recommended)**: If you are using an editor like VS Code, install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. Right-click the `index.html` file and select "Open with Live Server" for the best experience.

## 📸 Usage

1. **Select a Country**: Upon loading, wait a moment for the application to pull the global country list. Click the first dropdown to select your desired country.
2. **Select a City**: The second dropdown will automatically unlock and populate with the cities located inside the chosen country. Select a city.
3. **View Weather**: As soon as a city is selected, the application will fetch the weather and dynamically display a frosty weather card with all metrics.

---
*Created as a demonstration of modern web design, API consumption, and clean unopinionated JavaScript development.*

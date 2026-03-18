const countrySelect = document.getElementById('country-select');
const citySelect = document.getElementById('city-select');
const cityWrapper = document.getElementById('city-wrapper');
const loader = document.getElementById('loader');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

const locName = document.getElementById('location-name');
const weatherDesc = document.getElementById('weather-desc');
const tempEl = document.getElementById('temperature');
const windEl = document.getElementById('wind-speed');

let countriesData = [];

// Weather codes from Open-Meteo
const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
};

async function init() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        const json = await response.json();
        if(!json.error) {
            countriesData = json.data.sort((a,b) => a.country.localeCompare(b.country));
            populateCountries();
        } else {
            throw new Error("Failed to load countries");
        }
    } catch(e) {
        showError("Failed to load country list. Please refresh the page.");
        countrySelect.innerHTML = '<option value="">Error loading countries</option>';
    }
}

function populateCountries() {
    countrySelect.innerHTML = '<option value="" disabled selected>Select Country</option>';
    countriesData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.country;
        option.textContent = item.country;
        countrySelect.appendChild(option);
    });
}

function populateCities(countryName) {
    const country = countriesData.find(c => c.country === countryName);
    citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
    if(country && country.cities.length > 0) {
        const uniqueCities = [...new Set(country.cities)].sort();
        uniqueCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
        cityWrapper.style.opacity = '1';
    } else {
        citySelect.disabled = true;
        cityWrapper.style.opacity = '0.5';
        showError("No cities found for this country.");
    }
}

async function fetchWeather(city, country) {
    hideError();
    weatherCard.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // Geocoding
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if(!geoData.results || geoData.results.length === 0) {
            throw new Error("Location not found.");
        }

        const location = geoData.results[0];
        
        // Weather
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();
        
        const current = weatherData.current_weather;
        
        locName.textContent = `${city}, ${country}`;
        weatherDesc.textContent = weatherCodes[current.weathercode] || 'Unknown';
        tempEl.textContent = Math.round(current.temperature);
        windEl.textContent = `${current.windspeed} km/h`;
        
        loader.classList.add('hidden');
        weatherCard.classList.remove('hidden');

    } catch(e) {
        loader.classList.add('hidden');
        showError("Could not retrieve weather data for this location.");
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

countrySelect.addEventListener('change', (e) => {
    hideError();
    weatherCard.classList.add('hidden');
    populateCities(e.target.value);
});

citySelect.addEventListener('change', (e) => {
    fetchWeather(e.target.value, countrySelect.value);
});

// Start
init();

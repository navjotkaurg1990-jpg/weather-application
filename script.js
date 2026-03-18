const countrySelect = document.getElementById('country-select');
const citySelect = document.getElementById('city-select');
const cityWrapper = document.getElementById('city-wrapper');
const loader = document.getElementById('loader');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');
const locateBtn = document.getElementById('locate-btn');

const locName = document.getElementById('location-name');
const weatherDesc = document.getElementById('weather-desc');
const tempEl = document.getElementById('temperature');
const windEl = document.getElementById('wind-speed');
const humidityEl = document.getElementById('humidity');
const feelsLikeEl = document.getElementById('feels-like');
const forecastSection = document.getElementById('forecast-section');

let countriesData = [];

// Weather codes and Emoji mapping
const weatherMapper = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌧️' },
    53: { desc: 'Moderate drizzle', icon: '🌧️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    56: { desc: 'Light freezing drizzle', icon: '🌨️' },
    57: { desc: 'Dense freezing drizzle', icon: '🌨️' },
    61: { desc: 'Slight rain', icon: '🌦️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    66: { desc: 'Light freezing rain', icon: '🌨️' },
    67: { desc: 'Heavy freezing rain', icon: '🌨️' },
    71: { desc: 'Slight snow fall', icon: '🌨️' },
    73: { desc: 'Moderate snow fall', icon: '❄️' },
    75: { desc: 'Heavy snow fall', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    85: { desc: 'Slight snow showers', icon: '🌨️' },
    86: { desc: 'Heavy snow showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
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
        showError("Failed to load country list.");
        countrySelect.innerHTML = '<option value="">Error</option>';
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

async function handleCitySelection(city, country) {
    hideError();
    weatherCard.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if(!geoData.results || geoData.results.length === 0) {
            throw new Error("Location not found.");
        }

        const location = geoData.results[0];
        await fetchAndRenderWeather(location.latitude, location.longitude, `${city}, ${country}`);
    } catch(e) {
        loader.classList.add('hidden');
        showError("Could not retrieve weather data for this location.");
    }
}

function handleAutoLocate() {
    hideError();
    weatherCard.classList.add('hidden');
    
    if(!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }
    
    loader.classList.remove('hidden');
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Try Reverse Geocoding with nominatim to get a nice name
            let locString = "Your Location";
            try {
                const revGeo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const revData = await revGeo.json();
                const town = revData.address.city || revData.address.town || revData.address.village || "";
                const ctry = revData.address.country || "";
                if(town && ctry) locString = `${town}, ${ctry}`;
            } catch(e) { /* ignore and use "Your Location" */ }
            
            await fetchAndRenderWeather(lat, lon, locString);
            
            // reset dropdowns
            countrySelect.value = "";
            citySelect.value = "";
            citySelect.disabled = true;
            cityWrapper.style.opacity = '0.5';

        } catch(e) {
            loader.classList.add('hidden');
            showError("Could not fetch weather for your location.");
        }
    }, () => {
        loader.classList.add('hidden');
        showError("Location access was denied. Please select a city manually.");
    });
}

async function fetchAndRenderWeather(lat, lon, locationString) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const current = data.current;
    const wInfo = weatherMapper[current.weather_code] || { desc: 'Unknown', icon: '❓' };
    
    locName.textContent = locationString;
    weatherDesc.textContent = `${wInfo.desc} ${wInfo.icon}`;
    tempEl.textContent = Math.round(current.temperature_2m);
    windEl.textContent = `${current.wind_speed_10m} km/h`;
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
    
    // Render Forecast (Next 3 Days)
    renderForecast(data.daily);
    
    loader.classList.add('hidden');
    weatherCard.classList.remove('hidden');
}

function renderForecast(daily) {
    forecastSection.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // index 1, 2, 3 stands for tomorrow, day after tomorrow, and 3rd day
    for(let i=1; i<=3; i++) {
        const dateStr = daily.time[i];
        const dateObj = new Date(dateStr);
        const dayName = days[dateObj.getDay()];
        const code = daily.weather_code[i];
        const maxT = Math.round(daily.temperature_2m_max[i]);
        const minT = Math.round(daily.temperature_2m_min[i]);
        const wInfo = weatherMapper[code] || { icon: '❓' };
        
        const markup = `
            <div class="forecast-item">
                <span class="day">${dayName}</span>
                <span class="f-weather">${wInfo.icon}</span>
                <span class="f-temp">${maxT}° / ${minT}°</span>
            </div>
        `;
        forecastSection.insertAdjacentHTML('beforeend', markup);
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
    handleCitySelection(e.target.value, countrySelect.value);
});

locateBtn.addEventListener('click', handleAutoLocate);

init();

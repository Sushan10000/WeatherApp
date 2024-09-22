// Constants for API key and base URL
const API_KEY = '3857c192db49424bb4b54721242009';
const BASE_URL = 'http://api.weatherapi.com/v1/forecast.json';

// Declare variables for DOM elements
let searchInput, searchBtn, weatherDisplay, weeklyForecast, highlightsSection;
let dayBtn, weekBtn, weatherDay, weatherWeek;

// Wait for the DOM to load before executing the main logic
async function loadContent() {
    console.log('DOM content loaded');
    initializeDOMElements();

    if (!areElementsFound()) return;

    // Fetch weather for default city on initial load
    await fetchWeather('Kathmandu');

    // Add event listeners
    addEventListeners();
}

loadContent().then(
    function () {
        console.log("Content Loaded Successfully");
    },
    function (error) {
        console.error("Error loading content: ", error);
    }
);

// Function to initialize DOM elements
function initializeDOMElements() {
    searchInput = document.querySelector('.search-bar input');
    searchBtn = document.querySelector('.refresh-btn');
    weatherDisplay = document.querySelector('.current-weather');
    weeklyForecast = document.querySelector('.weather-week');
    highlightsSection = document.querySelector('.highlight-grid');
    dayBtn = document.getElementById('day-btn');
    weekBtn = document.getElementById('week-btn');
    weatherDay = document.getElementById('weather-day');
    weatherWeek = document.getElementById('weather-week');
}

// Function to check if all required DOM elements are found
function areElementsFound() {
    const elements = [searchInput, searchBtn, weatherDisplay, weeklyForecast, highlightsSection, dayBtn, weekBtn, weatherDay, weatherWeek];
    if (elements.some(el => !el)) {
        console.error('One or more DOM elements not found');
        return false;
    }
    return true;
}

// Function to add event listeners
function addEventListeners() {
    searchBtn.addEventListener('click', async () => {
        const city = searchInput.value.trim();
        if (city) await fetchWeather(city);
    });

    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) await fetchWeather(city);
        }
    });

    dayBtn.addEventListener('click', () => toggleWeatherView('day'));
    weekBtn.addEventListener('click', () => toggleWeatherView('week'));
}

// Function to toggle weather view
function toggleWeatherView(view) {
    const isDayView = view === 'day';
    dayBtn.classList.toggle('active', isDayView);
    weekBtn.classList.toggle('active', !isDayView);
    weatherDay.style.order = isDayView ? '1' : '2';
    weatherWeek.style.order = isDayView ? '2' : '1';
}

// Simplified fetchWeather function using async/await without manual Promise
async function fetchWeather(city) {
    console.log(`Fetching weather for ${city}`);
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayCurrentWeather(data);
        displayWeeklyForecast(data.forecast.forecastday);
        displayHighlights(data);
    } catch (error) {
        displayError(error.message);
    }
}

// Function to display current weather information
function displayCurrentWeather(data) {
    const { temp_c, condition } = data.current;
    const { name, country } = data.location;

    weatherDisplay.innerHTML = `
        <div class="weather-icon">
            <img src="https:${condition.icon}" alt="${condition.text}" title="${condition.text}">
        </div>
        <div class="temperature">${Math.round(temp_c)}°C</div>
        <div class="date">${new Date().toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' })}</div>
        <div class="conditions">
            <div>${condition.text}</div>
            <div>Rain - ${data.forecast.forecastday[0].day.daily_chance_of_rain}%</div>
        </div>
        <div class="location">
            <img src="images/Swayambhu.jpg" alt="${name} Weather"> ${name}, ${country}
        </div>
    `;
}

// Function to display weekly forecast
function displayWeeklyForecast(forecastDays) {
    weeklyForecast.innerHTML = forecastDays.map((day, index) => `
        <div class="week-container">
            <h3>${getDayName(index)}</h3>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div>${Math.round(day.day.maxtemp_c)}°</div>
            <div>${Math.round(day.day.mintemp_c)}°</div>
        </div>
    `).join('');
}

// Function to display weather highlights
function displayHighlights(data) {
    const { uv, wind_kph, wind_dir, humidity, vis_km } = data.current;
    const { sunrise, sunset } = data.forecast.forecastday[0].astro;

    highlightsSection.innerHTML = `
        <div class="highlight-card">
            <h3>UV Index</h3>
            <div class="uv-meter">
                <div class="uv-value">${uv}</div>
            </div>
        </div>
        <div class="highlight-card">
            <h3>Wind Status</h3>
            <div class="wind-status">
                <div class="wind-speed">${wind_kph.toFixed(2)} km/h</div>
                <div class="wind-direction">${wind_dir}</div>
            </div>
        </div>
        <div class="highlight-card">
            <h3>Sunrise & Sunset</h3>
            <div class="sun-times">
                <div>${sunrise}</div>
                <div>${sunset}</div>
            </div>
        </div>
        <div class="highlight-card">
            <h3>Humidity</h3>
            <div class="humidity">
                <div class="humidity-value">${humidity}%</div>
                <div class="humidity-status">${getHumidityStatus(humidity)}</div>
            </div>
        </div>
        <div class="highlight-card">
            <h3>Visibility</h3>
            <div class="visibility">
                <div class="visibility-value">${vis_km} km</div>
                <div class="visibility-status">${getVisibilityStatus(vis_km)}</div>
            </div>
        </div>
    `;
}

// Function to display error messages
function displayError(message) {
    weatherDisplay.innerHTML = `<div class="error" role="alert"><p>${message}</p></div>`;
    weeklyForecast.innerHTML = '';
    highlightsSection.innerHTML = '';
}

// Helper function to get day name from index
function getDayName(index) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[(new Date().getDay() + index) % 7];
}

// Helper function to determine humidity status
function getHumidityStatus(humidity) {
    return humidity < 30 ? 'Low' : humidity < 60 ? 'Normal' : 'High';
}

// Helper function to determine visibility status
function getVisibilityStatus(visibility) {
    return visibility < 2 ? 'Poor' : visibility < 5 ? 'Average' : 'Good';
}

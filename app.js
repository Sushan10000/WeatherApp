// Constants for API key and base URL
const API_KEY = '3857c192db49424bb4b54721242009';
const BASE_URL = 'http://api.weatherapi.com/v1/forecast.json';

// Declaring variables for DOM element
let searchInput, searchBtn, weatherDisplay, weeklyForecast, highlightsSection;
let dayBtn, weekBtn, weatherDay, weatherWeek;

// Wait for the DOM to load before executing main logic
async function loadContent() {
    console.log('DOM content loaded');
    initializeDOMElements();

    if (!areElementsFound()) return;

    // Fetching weather for default city on initial load
    await fetchWeather('Kathmandu');

    // Addign event listeners
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

// Creating function to initialize DOM elements
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

// Function to check if all required DOM elements are found or not
function areElementsFound() {
    //Creting array containing variables of DOM elements
    const elements = [searchInput, searchBtn, weatherDisplay, weeklyForecast, highlightsSection, dayBtn, weekBtn, weatherDay, weatherWeek];
    //Checking if any element in array is null or not
    if (elements.some(el => !el)) {
        console.error('One or more DOM elements not found');
        return false;
    }
    return true;
}

// Function to add event listeners
function addEventListeners() {
    //Event listener of search button when click happens
    searchBtn.addEventListener('click', async () => {
        //Geting name of the city and trimming white spaces
        const city = searchInput.value.trim();
        //if the input is not empty fetch the weather data
        if (city) await fetchWeather(city);
    });

    //Event listener when 'Enter' is pressed
    searchInput.addEventListener('keypress', async (e) => {
        //To check if 'Enter' is pressed
        if (e.key === 'Enter') {
            //Geting name of the city and trimming white spaces
            const city = searchInput.value.trim();
            //if the input is not empty fetch the weather data
            if (city) await fetchWeather(city);
        }
    });

    //Event Listener to toggle to day on click event
    dayBtn.addEventListener('click', () => toggleWeatherView('day'));
    //Event Listener to toggle to week on click event
    weekBtn.addEventListener('click', () => toggleWeatherView('week'));
}

// Function to toggle weather view
function toggleWeatherView(view) {
    //To check if the passed view is 'day'
    const isDayView = view === 'day';
    //Togle active class on day if true
    dayBtn.classList.toggle('active', isDayView);
    //Togle active class on week if false
    weekBtn.classList.toggle('active', !isDayView);
    //Order the of display of week if isDayView is true
    weatherDay.style.order = isDayView ? '1' : '2';
    //Order the of display of week if isDayView is false 
    weatherWeek.style.order = isDayView ? '2' : '1';
}

//FetchWeather function using async/await 
async function fetchWeather(city) {
    console.log(`Fetching weather for ${city}`);
    //Constructing the base url with city using base url and API key
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7`;

    try {
        //Fetch a request to contructed url for response 
        const response = await fetch(url);
        //to check if resposnse is not ok
        if (!response.ok) {
            //Throw error status if response is not ok
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        //Parse the response as json
        const data = await response.json();
        displayCurrentWeather(data);
        displayWeeklyForecast(data.forecast.forecastday);
        displayHighlights(data);
    } catch (error) {
        displayError(error.message);
    }
}

//Function to display current weather information
function displayCurrentWeather(data) {
    //Destructuring properties form data element
    const { temp_c, condition } = data.current;
    const { name, country } = data.location;

    //Upadating content of weatherDisplay
    weatherDisplay.innerHTML = `
        <div class="weather-icon">
            <img src="https:${condition.icon}" alt="${condition.text}" title="${condition.text}">
        </div>
        <div class="temperature">${temp_c}°C</div>
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

//Function to display weekly forecast
function displayWeeklyForecast(forecastDays) {
    //Updating the content of weeklyForecast element
    weeklyForecast.innerHTML = forecastDays.map((day, index) => `
        <div class="week-container">
            <h3>${getDayName(index)}</h3>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div>${day.day.maxtemp_c}°</div>
            <div>${day.day.mintemp_c}°</div>
        </div>
    `).join('');
}

// Function to display weather highlights
function displayHighlights(data) {
    //Destructuring the properties from data element
    const { uv, wind_kph, wind_dir, humidity, vis_km } = data.current;
    const { sunrise, sunset } = data.forecast.forecastday[0].astro;

    //upadating the contents of hightlightSection
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
        <div class="highlight-card">
                <h3>Air Quality</h3>
                <div class="air-quality">
                    <div class="aqi-value">N/A</div>
                    <div class="aqi-status">N/A</div>
                </div>
            </div>
    `;
}

// Function to display error messages
function displayError(message) {
    //Updating the elements to show error message
    weatherDisplay.innerHTML = `<div class="error" role="alert"><p>${message}</p></div>`;
    weeklyForecast.innerHTML = '';
    highlightsSection.innerHTML = '';
}

//Helper function to get day name from index
function getDayName(index) {
    //Creating arrays for day names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[(new Date().getDay() + index) % 7];
}

// Helper function to determine humidity status
function getHumidityStatus(humidity) {
    //Determining humidity status
    return humidity < 30 ? 'Low' : humidity < 60 ? 'Normal' : 'High';
}

// Helper function to determine visibility status
function getVisibilityStatus(visibility) {
    //Determining humifity status
    return visibility < 2 ? 'Poor' : visibility < 5 ? 'Average' : 'Good';
}
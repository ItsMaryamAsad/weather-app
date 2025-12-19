const apiKey = "e263f2ce50ee565ae82cfe7f414451ca";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility")
const direction = document.getElementById("windDir")
// const sunriseSunset = document.getElementById("sunriseSunset")
const weatherIcon = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecastContainer");
const errorMsg = document.getElementById("errorMsg");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenBtn = document.getElementById("fahrenBtn");

let isCelsius = true;
let currentTemp = 0;
let feelsLikeTemp = 0;
let tempMax = 0;
let tempMin = 0;
let forecastData = [];
let hourlyData = [];

const favoritesDropdown = document.getElementById("favoritesDropdown");
const selectedCity = document.getElementById("selectedCity");
const dropdownList = document.getElementById("dropdownList");
const addFavoriteBtn = document.getElementById("addFavoriteBtn");

let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];
updateFavoritesDropdown();

// Toggle dropdown open/close
selectedCity.addEventListener("click", () => {
  dropdownList.classList.toggle("hidden");
});

// Add city to favorites
addFavoriteBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city && !favoriteCities.includes(city)) {
    favoriteCities.push(city);
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
    updateFavoritesDropdown();
  }
});

document.addEventListener("click", (e) => {
  if (!favoritesDropdown.contains(e.target)) {
    dropdownList.classList.add("hidden");
  }
});

// Build dropdown items
function updateFavoritesDropdown() {
  dropdownList.innerHTML = "";
  if (favoriteCities.length === 0) {
    dropdownList.innerHTML = `<p style="padding:8px;">No saved cities</p>`;
  } else {
    favoriteCities.forEach(city => {
      const item = document.createElement("div");
      item.classList.add("dropdown-item");

      const citySpan = document.createElement("span");
      citySpan.textContent = city;
      // 
      citySpan.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent closing early
        dropdownList.classList.add("hidden");

        selectedCity.textContent = city;
        cityInput.value = city;

        // ✅ Add a short delay to ensure UI updates before API call
        setTimeout(() => {
          fetchWeather(city);
        }, 100);
      });


      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.classList.add("remove-btn");
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent triggering city click
        favoriteCities = favoriteCities.filter(c => c !== city);
        localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
        updateFavoritesDropdown();
      });

      item.appendChild(citySpan);
      item.appendChild(removeBtn);
      dropdownList.appendChild(item);
    });
  }
}

// ✅ Mapping weather conditions to custom icons
const weatherIcons = {
  clear: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
  clouds: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
  rain: "https://cdn-icons-png.flaticon.com/512/1163/1163650.png",
  snow: "https://cdn-icons-png.flaticon.com/512/1163/1163629.png",
  thunderstorm: "https://cdn-icons-png.flaticon.com/512/1163/1163660.png",
  drizzle: "https://cdn-icons-png.flaticon.com/512/1163/1163646.png",
  mist: "https://cdn-icons-png.flaticon.com/512/1163/1163626.png"
};

// Search button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  } else {
    errorMsg.textContent = "Please enter a city name!";
  }
});

// Enter key triggers search
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// // Toggle Celsius/Fahrenheit

celsiusBtn.addEventListener("click", () => {
  isCelsius = true;
  updateTemperatureDisplay();
  displayForecast(forecastData);
  displayHourlyForecast(hourlyData);
  celsiusBtn.classList.add("active");
  fahrenBtn.classList.remove("active");
});

fahrenBtn.addEventListener("click", () => {
  isCelsius = false;
  updateTemperatureDisplay();
  displayForecast(forecastData);
  displayHourlyForecast(hourlyData);
  fahrenBtn.classList.add("active");
  celsiusBtn.classList.remove("active");
});


function updateTemperatureDisplay() {
  if (currentTemp !== null) {
    if (isCelsius) {
      temperature.textContent = `${currentTemp.toFixed(1)}°C`;
      feelsLike.textContent = `Feels like: ${feelsLikeTemp.toFixed(1)}°C`;
      highLowTemp.textContent = `H: ${tempMax.toFixed(1)}°C / L: ${tempMin.toFixed(1)}°C`;
    } else {
      const tempF = (currentTemp * 9) / 5 + 32;
      const feelsF = (feelsLikeTemp * 9) / 5 + 32;
      const maxF = (tempMax * 9) / 5 + 32;
      const minF = (tempMin * 9) / 5 + 32;

      temperature.textContent = `${tempF.toFixed(1)}°F`;
      feelsLike.textContent = `Feels like: ${feelsF.toFixed(1)}°F`;
      highLowTemp.textContent = `H: ${maxF.toFixed(1)}°F / L: ${minF.toFixed(1)}°F`;
    }
  }
}

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  const loader = document.getElementById("loader");
  const weatherInfoDiv = document.getElementById("weatherInfo");

  loader.style.display = "block"; 
  weatherInfoDiv.classList.remove("show"); 
  errorMsg.textContent = "";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);

      displayWeather(data);
      updateSunriseSunset(data);
      setBackground(data.weather[0].main);
      fetchForecast(city);        // 5-day forecast
      fetchHourlyForecast(city);  // hourly forecast
      errorMsg.textContent = "";
    })
    .catch(err => {
      console.error(err);
      errorMsg.textContent = "City not found!";
    })
    .finally(() => {
      loader.style.display = "none"; 
      weatherInfoDiv.classList.add("show"); 
    });
}

function updateSuggestion(temp, condition) {
  let clothing = "";
  let activity = "";
  condition = condition.toLowerCase();

  // 🌧️ CLOTHING suggestions
  if (condition.includes("rain") || condition.includes("drizzle")) {
    clothing = "Carry an umbrella and wear a waterproof jacket.";
    activity = "Maybe stay indoors or enjoy the rain with a cup of tea ☔";
  } else if (condition.includes("snow")) {
    clothing = "Bundle up! Wear a warm coat, gloves, and boots.";
    activity = "Perfect day for hot chocolate and a cozy blanket ❄️";
  } else if (condition.includes("storm") || condition.includes("thunder")) {
    clothing = "Avoid going out — stay safe and warm.";
    activity = "Not a good day for outdoor plans ⚡";
  } else if (temp < 10) {
    clothing = "It’s cold outside! Wear warm layers and a jacket.";
    activity = "Maybe read a book or binge a show indoors 📚";
  } else if (temp >= 10 && temp < 20) {
    clothing = "A light jacket or sweater will do.";
    activity = "Nice weather for a peaceful walk or coffee outside ☕";
  } else if (temp >= 20 && temp < 30) {
    clothing = "Comfy T-shirt and jeans — perfect day!";
    activity = "Great time for outdoor activities or sports 🏃‍♀️";
  } else if (temp >= 30) {
    clothing = "Stay cool — light clothes and sunglasses.";
    activity = "Avoid the heat, hydrate well, and chill indoors 🧋";
  } else {
    clothing = "Weather looks fine — dress comfortably!";
    activity = "Enjoy your day doing what you love 💫";
  }

  const suggestionElement = document.getElementById("suggestion");
  suggestionElement.innerHTML = `
    <strong>👕 Clothing:</strong> ${clothing}<br>
    <strong>🎯 Activity:</strong> ${activity}
  `;
}


function displayWeather(data) {
  currentTemp = data.main.temp;
  feelsLikeTemp = data.main.feels_like;
  tempMax = data.main.temp_max;
  tempMin = data.main.temp_min;
  updateTemperatureDisplay();

  document.getElementById("weatherInfo").style.display = "block";

  // City and Country
  cityName.textContent = `${data.name}, ${data.sys.country}`;

  // Weather description
  description.textContent = `${data.weather[0].description}`;
  updateSuggestion(data.main.temp, data.weather[0].description.toLowerCase());


  // Humidity, Pressure, Wind
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
  wind.textContent = `Wind: ${data.wind.speed} m/s`;

  // Feels Like
  feelsLike.textContent = `Feels like: ${data.main.feels_like.toFixed(1)}°C`;

  // High & Low Temperature
  highLowTemp.textContent = `H: ${data.main.temp_max.toFixed(1)}°C / L: ${data.main.temp_min.toFixed(1)}°C`;

  // Sunrise & Sunset
  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  // sunriseSunset.textContent = `Sunrise: ${sunrise.getHours()}:${sunrise.getMinutes().toString().padStart(2,'0')} | Sunset: ${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2,'0')}`;

  document.getElementById("sunrise").textContent = `Sunrise: ${sunrise.getHours()}:${sunrise.getMinutes().toString().padStart(2,'0')}`;
  document.getElementById("sunset").textContent = `Sunset: ${sunset.getHours()}:${sunset.getMinutes().toString().padStart(2,'0')}`;


   // 🌬 Wind Direction (if available)
  if (data.wind.deg !== undefined) {
    const windDirText = getWindDirection(data.wind.deg);
    windDir.textContent = `Direction: ${windDirText} (${data.wind.deg}°)`;
  } else {
    windDir.textContent = `Direction: N/A`;
  }

  // Visibility (convert to km)
  if (data.visibility !== undefined) {
    visibility.textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;
  } else {
    visibility.textContent = `Visibility: N/A`;
  }

  // Current Date & Time
  const now = new Date();
  dateTime.textContent = now.toLocaleString();

    // Day Name
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  document.getElementById("dayName").textContent = dayName === new Date().toLocaleDateString("en-US", { weekday: "long" }) 
    ? "Today" 
    : dayName;

  // Weather Icon
  const mainWeather = data.weather[0].main.toLowerCase();
  weatherIcon.src = weatherIcons[mainWeather] || weatherIcons.clear;
}

// function displayWeather(data) {
//   currentTemp = data.main.temp;
//   feelsLikeTemp = data.main.feels_like;
//   tempMax = data.main.temp_max;
//   tempMin = data.main.temp_min;
//   updateTemperatureDisplay();

//   document.getElementById("weatherInfo").style.display = "block";

//   // 🌆 City and Country
//   cityName.textContent = `${data.name}, ${data.sys.country}`;

//   // 🌤 Description
//   description.textContent = `${data.weather[0].description}`;
//   updateSuggestion(data.main.temp, data.weather[0].description.toLowerCase());

//   // 🌡️ Basic Stats
//   humidity.textContent = `Humidity: ${data.main.humidity}%`;
//   pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
//   wind.textContent = `Wind: ${data.wind.speed} m/s`;
//   feelsLike.textContent = `Feels like: ${data.main.feels_like.toFixed(1)}°C`;
//   highLowTemp.textContent = `H: ${data.main.temp_max.toFixed(1)}°C / L: ${data.main.temp_min.toFixed(1)}°C`;

//   // 🌅 Sunrise & Sunset
//   const sunriseTimestamp = data.sys.sunrise * 1000;
//   const sunsetTimestamp = data.sys.sunset * 1000;

//   document.getElementById("sunrise").textContent =
//     `Sunrise: ${new Date(sunriseTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
//   document.getElementById("sunset").textContent =
//     `Sunset: ${new Date(sunsetTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

//   // 🌬 Wind Direction
//   if (data.wind.deg !== undefined) {
//     const windDirText = getWindDirection(data.wind.deg);
//     windDir.textContent = `Direction: ${windDirText} (${data.wind.deg}°)`;
//   } else {
//     windDir.textContent = `Direction: N/A`;
//   }

//   // 👁 Visibility
//   if (data.visibility !== undefined) {
//     visibility.textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;
//   } else {
//     visibility.textContent = `Visibility: N/A`;
//   }

//   // 🕒 Live Date & Time (updates every second)
//   if (window.timeInterval) clearInterval(window.timeInterval);
//   function updateDateTime() {
//     const now = new Date();
//     dateTime.textContent = now.toLocaleString();
//     const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
//     document.getElementById("dayName").textContent = "Today";
//   }
//   updateDateTime();
//   window.timeInterval = setInterval(updateDateTime, 1000);

//   // 🌈 Weather Icon
//   const mainWeather = data.weather[0].main.toLowerCase();
//   weatherIcon.src = weatherIcons[mainWeather] || weatherIcons.clear;

//   // 🌞 Countdown Function (LIVE updating every second)
//   function updateCountdowns() {
//     const now = Date.now();

//     const sunriseDiff = sunriseTimestamp - now;
//     const sunsetDiff = sunsetTimestamp - now;

//     const sunriseCountdown = document.getElementById("sunriseCountdown");
//     const sunsetCountdown = document.getElementById("sunsetCountdown");

//     sunriseCountdown.textContent = formatCountdown(sunriseDiff);
//     sunsetCountdown.textContent = formatCountdown(sunsetDiff);

//     setCountdownColor(sunriseCountdown, sunriseDiff);
//     setCountdownColor(sunsetCountdown, sunsetDiff);
//   }

//   updateCountdowns();
//   if (window.countdownInterval) clearInterval(window.countdownInterval);
//   window.countdownInterval = setInterval(updateCountdowns, 1000);
// }

// // 🧩 Helpers
// function formatCountdown(diff) {
//   if (diff <= 0) return "Now!";
//   const hours = Math.floor(diff / (1000 * 60 * 60));
//   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//   const seconds = Math.floor((diff % (1000 * 60)) / 1000);
//   return `in ${hours}h ${minutes}m ${seconds}s`;
// }

// function setCountdownColor(element, diff) {
//   const hours = diff / (1000 * 60 * 60);
//   element.classList.remove("soon", "medium", "far", "countdown");
//   element.classList.add("countdown");

//   if (hours <= 1) element.classList.add("soon");
//   else if (hours <= 3) element.classList.add("medium");
//   else element.classList.add("far");
// }






// function displayWeather(data) {
//   currentTemp = data.main.temp;
//   feelsLikeTemp = data.main.feels_like;
//   tempMax = data.main.temp_max;
//   tempMin = data.main.temp_min;
//   updateTemperatureDisplay();

//   document.getElementById("weatherInfo").style.display = "block";

//   // 🌆 City and Country
//   cityName.textContent = `${data.name}, ${data.sys.country}`;

//   // 🌤 Description
//   description.textContent = `${data.weather[0].description}`;
//   updateSuggestion(data.main.temp, data.weather[0].description.toLowerCase());

//   // 🌡️ Basic Stats
//   humidity.textContent = `Humidity: ${data.main.humidity}%`;
//   pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
//   wind.textContent = `Wind: ${data.wind.speed} m/s`;
//   feelsLike.textContent = `Feels like: ${data.main.feels_like.toFixed(1)}°C`;
//   highLowTemp.textContent = `H: ${data.main.temp_max.toFixed(1)}°C / L: ${data.main.temp_min.toFixed(1)}°C`;

//   // 🌅 Sunrise & Sunset
//   const sunriseTimestamp = data.sys.sunrise;
//   const sunsetTimestamp = data.sys.sunset;

//   const sunriseTime = new Date(sunriseTimestamp * 1000);
//   const sunsetTime = new Date(sunsetTimestamp * 1000);

//   document.getElementById("sunriseTime").textContent = sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   document.getElementById("sunsetTime").textContent = sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   // 🌬 Wind Direction
//   if (data.wind.deg !== undefined) {
//     const windDirText = getWindDirection(data.wind.deg);
//     windDir.textContent = `Direction: ${windDirText} (${data.wind.deg}°)`;
//   } else {
//     windDir.textContent = `Direction: N/A`;
//   }

//   // 👁 Visibility
//   if (data.visibility !== undefined) {
//     visibility.textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;
//   } else {
//     visibility.textContent = `Visibility: N/A`;
//   }

//   // 🕒 Date & Day
//   const now = new Date();
//   dateTime.textContent = now.toLocaleString();
//   const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
//   document.getElementById("dayName").textContent = "Today";

//   // 🌈 Weather Icon
//   const mainWeather = data.weather[0].main.toLowerCase();
//   weatherIcon.src = weatherIcons[mainWeather] || weatherIcons.clear;

//   // 🌞 Start Live Sunrise/Sunset Countdown
//   updateCountdowns();
//   clearInterval(window.countdownInterval);
//   window.countdownInterval = setInterval(updateCountdowns, 60000); // update every minute

//   function updateCountdowns() {
//     const now = new Date();

//     const sunriseDiff = sunriseTime - now;
//     const sunsetDiff = sunsetTime - now;

//     const sunriseCountdown = document.getElementById("sunriseCountdown");
//     const sunsetCountdown = document.getElementById("sunsetCountdown");

//     sunriseCountdown.textContent = formatCountdown(sunriseDiff);
//     sunsetCountdown.textContent = formatCountdown(sunsetDiff);

//     // Color change effect 🌈
//     setCountdownColor(sunriseCountdown, sunriseDiff);
//     setCountdownColor(sunsetCountdown, sunsetDiff);
//   }
// }


  // function setCountdownColor(element, diff) {
  //   const hours = diff / (1000 * 60 * 60);

  //   element.classList.remove("soon", "medium", "far", "countdown");
  //   element.classList.add("countdown");

  //   if (hours <= 1) {
  //     element.classList.add("soon");   // red: less than 1 hour
  //   } else if (hours <= 3) {
  //     element.classList.add("medium"); // orange: less than 3 hours
  //   } else {
  //     element.classList.add("far");    // green: more than 3 hours
  //   }
  // }

  // function formatCountdown(diff) {
  //   if (diff <= 0) return "Now!";
  //   const hours = Math.floor(diff / (1000 * 60 * 60));
  //   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  //   return `in ${hours}h ${minutes}m`;
  // }

// function displayWeather(data) {
//   currentTemp = data.main.temp;
//   feelsLikeTemp = data.main.feels_like;
//   tempMax = data.main.temp_max;
//   tempMin = data.main.temp_min;
//   updateTemperatureDisplay();

//   document.getElementById("weatherInfo").style.display = "block";

//   // 🌆 City and Country
//   cityName.textContent = `${data.name}, ${data.sys.country}`;

//   // 🌤 Description
//   description.textContent = `${data.weather[0].description}`;
//   updateSuggestion(data.main.temp, data.weather[0].description.toLowerCase());

//   // 🌡️ Basic Stats
//   humidity.textContent = `Humidity: ${data.main.humidity}%`;
//   pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
//   wind.textContent = `Wind: ${data.wind.speed} m/s`;
//   feelsLike.textContent = `Feels like: ${data.main.feels_like.toFixed(1)}°C`;
//   highLowTemp.textContent = `H: ${data.main.temp_max.toFixed(1)}°C / L: ${data.main.temp_min.toFixed(1)}°C`;

//   // 🌅 Sunrise & Sunset
//   const sunriseTimestamp = data.sys.sunrise * 1000;
//   const sunsetTimestamp = data.sys.sunset * 1000;
//   const sunriseTime = new Date(sunriseTimestamp);
//   const sunsetTime = new Date(sunsetTimestamp);

//   document.getElementById("sunriseTime").textContent = `Sunrise: ${sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
//   document.getElementById("sunsetTime").textContent = `Sunset: ${sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

//   // 🌞 Live Countdown Function
//   function updateCountdowns() {
//     const now = new Date();
//     const sunriseDiff = sunriseTime - now;
//     const sunsetDiff = sunsetTime - now;

//     const sunriseCountdown = document.getElementById("sunriseCountdown");
//     const sunsetCountdown = document.getElementById("sunsetCountdown");

//     sunriseCountdown.textContent = "Sunrise " + formatCountdown(sunriseDiff);
//     sunsetCountdown.textContent = "Sunset " + formatCountdown(sunsetDiff);

//     setCountdownColor(sunriseCountdown, sunriseDiff);
//     setCountdownColor(sunsetCountdown, sunsetDiff);
//   }

//   // Start live updates
//   clearInterval(window.countdownInterval);
//   updateCountdowns(); // immediate
//   window.countdownInterval = setInterval(updateCountdowns, 1000); // update every second
// }

// // 🕓 Format countdown (now includes seconds)
// function formatCountdown(diff) {
//   if (diff <= 0) return "Now!";
//   const hours = Math.floor(diff / (1000 * 60 * 60));
//   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//   const seconds = Math.floor((diff % (1000 * 60)) / 1000);
//   return `in ${hours}h ${minutes}m ${seconds}s`;
// }

// // 🎨 Countdown color system
// function setCountdownColor(element, diff) {
//   const hours = diff / (1000 * 60 * 60);
//   element.classList.remove("soon", "medium", "far", "countdown");
//   element.classList.add("countdown");

//   if (hours <= 1) element.classList.add("soon");      // red
//   else if (hours <= 3) element.classList.add("medium"); // orange
//   else element.classList.add("far");                   // green
// }



// Update every minute
// updateCountdown();
// setInterval(updateCountdown, 60000);




// // Fetch 5-day forecast

function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      // Group by day
      const dailyData = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
        if (!dailyData[dateKey]) dailyData[dateKey] = { temps: [], icons: [] };
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].icons.push(item.weather[0].main.toLowerCase());
      });

      const days = Object.keys(dailyData).slice(0, 5);

      forecastData = days.map(dateKey => {
        const temps = dailyData[dateKey].temps;
        const icons = dailyData[dateKey].icons;
        const icon = icons.sort((a,b) =>
          icons.filter(v => v===a).length - icons.filter(v => v===b).length
        ).pop();

        return {
          date: dateKey,
          min: Math.min(...temps),
          max: Math.max(...temps),
          icon: icon
        };
      });

      displayForecast(forecastData);
    })
    .catch(() => {
      forecastContainer.innerHTML = "<p>Error fetching forecast.</p>";
    });
}

function displayForecast(forecastData) {
  forecastContainer.innerHTML = "";
  forecastData.forEach((day, index) => {
    const forecastDate = new Date(day.date + "T00:00:00");
    let dayName = forecastDate.toLocaleDateString("en-US", { weekday: "long" });
    if (index === 0) dayName = "Today";
    const dateStr = forecastDate.toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' });

    const minTemp = isCelsius ? day.min : (day.min*9)/5 + 32;
    const maxTemp = isCelsius ? day.max : (day.max*9)/5 + 32;
    const unit = isCelsius ? "°C" : "°F";
    const icon = weatherIcons[day.icon] || weatherIcons.clear;

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <p class="forecast-day">${dayName}<br><span class="forecast-date">${dateStr}</span></p>
      <img src="${icon}" alt="">
      <p>🌡️ ${minTemp.toFixed(1)}${unit} - ${maxTemp.toFixed(1)}${unit}</p>
    `;
    forecastContainer.appendChild(card);
    gsap.from(card, { opacity: 0, y: 20, duration: 0.5 });
  });
}

// Change background based on weather
function setBackground(condition) {
  const body = document.body;
  switch (condition.toLowerCase()) {
    case "clear":
      body.style.background = "linear-gradient(135deg, #fddb92, #d1fdff)";
      break;
    case "clouds":
      body.style.background = "linear-gradient(135deg, #d7d2cc, #304352)";
      break;
    case "rain":
      body.style.background = "linear-gradient(135deg, #74ebd5, #ACB6E5)";
      break;
    case "snow":
      body.style.background = "linear-gradient(135deg, #E0EAFC, #CFDEF3)";
      break;
    case "thunderstorm":
      body.style.background = "linear-gradient(135deg, #373B44, #4286f4)";
      break;
    default:
      body.style.background = "linear-gradient(135deg, #74ebd5, #ACB6E5)";
  }
}

function getWindDirection(deg) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

// Live Clock (updates every second)
setInterval(() => {
  const now = new Date();
  const dateTimeEl = document.getElementById("dateTime");
  const dayNameEl = document.getElementById("dayName");
  if (dateTimeEl && dayNameEl) {
    dateTimeEl.textContent = now.toLocaleString();
    dayNameEl.textContent = now.toLocaleDateString("en-US", { weekday: "long" });
  }
}, 1000);

function fetchHourlyForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      // Save next 8 intervals (24 hours) globally
      hourlyData = data.list.slice(0, 8);
      displayHourlyForecast(hourlyData);
    })
    .catch(() => {
      document.getElementById("hourlyForecast").innerHTML = "<p>Error fetching hourly forecast.</p>";
    });
}

function displayHourlyForecast(list) {
  const container = document.getElementById("hourlyForecast");
  container.innerHTML = "";
  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const temp = isCelsius ? item.main.temp.toFixed(1) : ((item.main.temp*9)/5 + 32).toFixed(1);
    const unit = isCelsius ? "°C" : "°F";
    const icon = weatherIcons[item.weather[0].main.toLowerCase()] || weatherIcons.clear;

    const card = document.createElement("div");
    card.className = "hourly-card";
    card.innerHTML = `
      <p class="hourly-time">${time}</p>
      <img src="${icon}" alt="">
      <p class="hourly-temp">${temp}${unit}</p>
    `;
    container.appendChild(card);
    gsap.from(card, { opacity: 0, y: 20, duration: 0.4 });
  });
}

function updateSunriseSunset(data) {
  const sunriseElement = document.getElementById("sunriseTime");
  const sunsetElement = document.getElementById("sunsetTime");
  const sunriseCountdown = document.getElementById("sunriseCountdown");
  const sunsetCountdown = document.getElementById("sunsetCountdown");

  let sunriseTime = new Date(data.sys.sunrise * 1000);
  let sunsetTime = new Date(data.sys.sunset * 1000);

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function updateCountdowns() {
    const now = new Date();

    // If today's sunrise/sunset already passed, shift to next day
    if (now > sunriseTime) {
      sunriseTime = new Date(sunriseTime.getTime() + 24 * 60 * 60 * 1000);
    }
    if (now > sunsetTime) {
      sunsetTime = new Date(sunsetTime.getTime() + 24 * 60 * 60 * 1000);
    }

    const sunriseDiff = sunriseTime - now;
    const sunsetDiff = sunsetTime - now;

    function formatCountdown(ms) {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    sunriseElement.textContent = `Sunrise: ${formatTime(sunriseTime)}`;
    sunsetElement.textContent = `Sunset: ${formatTime(sunsetTime)}`;
    sunriseCountdown.textContent = `Next Sunrise in: ${formatCountdown(sunriseDiff)}`;
    sunsetCountdown.textContent = `Next Sunset in: ${formatCountdown(sunsetDiff)}`;
  }

  updateCountdowns();

  // Clear old interval before starting a new one
  if (window.sunInterval) clearInterval(window.sunInterval);
  window.sunInterval = setInterval(updateCountdowns, 1000);
}

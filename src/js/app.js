/*
=========================================
APP.JS
Página principal
=========================================
*/
import {
  COUNTRIES,
  STORAGE_KEYS,
  MESSAGES,
  buildIconUrl,
  buildLargeIconUrl,
} from "./config.js";

import {
  DEFAULT_CITIES,
  getWeatherByCity,
  getMultipleCities,
  getForecast,
  mapWeatherData,
  filterByCountry,
  sortWeatherData,
  formatTime,
} from "./api.js";

/*
=========================================
ELEMENTOS DEL DOM
=========================================
*/
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const sortSelect = document.getElementById("sortSelect");
const countryFilter = document.getElementById("countryFilter");
const cardsContainer = document.getElementById("weatherContainer");
const loaderContainer = document.getElementById("loaderContainer");
const messageContainer = document.getElementById("messageContainer");
const citiesCount = document.getElementById("citiesCount");
const favoritesCount = document.getElementById("favoritesCount");
const modal = document.getElementById("weatherModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const themeToggle = document.getElementById("themeToggle");

/*
=========================================
ESTADO GLOBAL
=========================================
*/
let weatherData = [];
let filteredData = [];
let currentPage = 0;
const pageSize = 8;

/*
=========================================
INICIALIZACIÓN
=========================================
*/
document.addEventListener("DOMContentLoaded", init);

async function init() {
  applyStoredTheme();
  populateCountryFilter();
  updateFavoritesCounter();
  await loadInitialCities();
  addEvents();
}

/*
=========================================
MODO OSCURO
=========================================
*/
function applyStoredTheme() {
  if (localStorage.getItem(STORAGE_KEYS.THEME) === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? "dark" : "light");
});

/*
=========================================
EVENTOS
=========================================
*/
function addEvents() {
  searchBtn.addEventListener("click", searchCity);

  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") searchCity();
  });

  searchInput.addEventListener("input", () => {
    searchInput.classList.remove("error");
  });

  sortSelect.addEventListener("change", applyFiltersAndSort);

  countryFilter.addEventListener("change", applyFiltersAndSort);

  clearBtn.addEventListener("click", clearAll);

  document
    .getElementById("loadMoreBtn")
    .addEventListener("click", loadMoreCities);

  closeModal.addEventListener("click", closeWeatherModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) closeWeatherModal();
  });
}

/*
=========================================
CIUDADES INICIALES — primera página
=========================================
*/
async function loadInitialCities() {
  currentPage = 0;
  try {
    showLoader();
    const slice = DEFAULT_CITIES.slice(0, pageSize);
    const data = await getMultipleCities(slice);
    weatherData = data.map(mapWeatherData);
    filteredData = [...weatherData];
    renderCards();
    currentPage++;
    toggleLoadMoreButton();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    hideLoader();
  }
}

/*
=========================================
CARGAR MÁS CIUDADES
=========================================
*/
async function loadMoreCities() {
  try {
    showLoader();
    const slice = DEFAULT_CITIES.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize,
    );
    const data = await getMultipleCities(slice);
    const newCities = data.map(mapWeatherData);
    weatherData = weatherData.concat(newCities);
    filteredData = [...weatherData];
    renderCards();
    currentPage++;
    toggleLoadMoreButton();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    hideLoader();
  }
}

/*
=========================================
MOSTRAR / OCULTAR BOTÓN "CARGAR MÁS"
=========================================
*/
function toggleLoadMoreButton() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (currentPage * pageSize >= DEFAULT_CITIES.length) {
    loadMoreBtn.classList.add("hidden");
  } else {
    loadMoreBtn.classList.remove("hidden");
  }
}

/*
=========================================
BUSCAR CIUDAD
=========================================
*/
async function searchCity() {
  const city = searchInput.value.trim();

  if (city.length < 2) {
    showMessage("Ingresá al menos 2 caracteres.", "error");
    searchInput.classList.add("error");
    return;
  }

  searchInput.classList.remove("error");

  try {
    showLoader();
    const result = await getWeatherByCity(city);
    const cityData = mapWeatherData(result);

    if (!weatherData.some((item) => item.id === cityData.id)) {
      weatherData.unshift(cityData);
    }

    applyFiltersAndSort();
    searchInput.value = "";
    showMessage(`${cityData.city} agregada correctamente.`, "success");
  } catch (error) {
    showMessage(error.message, "error");
    searchInput.classList.add("error");
  } finally {
    hideLoader();
  }
}

/*
=========================================
FILTRO + ORDEN
=========================================
*/
function applyFiltersAndSort() {
  let data = [...weatherData];
  data = filterByCountry(data, countryFilter.value);
  data = sortWeatherData(data, sortSelect.value);
  filteredData = data;
  renderCards();
}

/*
=========================================
RENDER CARDS
=========================================
*/
function renderCards() {
  cardsContainer.innerHTML = "";

  if (filteredData.length === 0) {
    cardsContainer.innerHTML = `
      <div class="empty-state">
        <h2>No hay resultados</h2>
      </div>`;
    updateCitiesCounter();
    return;
  }

  const favoritesList = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.FAVORITES) || "[]",
  );

  filteredData.forEach((item) => {
    const isFav = favoritesList.includes(item.city);
    const favClass = isFav ? " favorito-agregado" : "";
    const favText = isFav ? "★ En favoritos" : "❤ Favorito";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${buildIconUrl(item.icon)}" alt="${item.description}">
      <h3>${item.city}</h3>
      <p class="country">${item.country}</p>
      <p class="temperature">${item.temperature}°C</p>
      <p class="weather-description">${item.description}</p>
      <div class="card-buttons">
        <button class="btn btn-detail" data-id="${item.id}">Detalle</button>
        <button class="btn btn-favorite${favClass}" data-city="${item.city}">${favText}</button>
      </div>
    `;
    cardsContainer.appendChild(card);
  });

  addCardEvents();
  updateCitiesCounter();
}

/*
=========================================
EVENTOS DE CARDS
=========================================
*/
function addCardEvents() {
  document.querySelectorAll(".btn-detail").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const city = weatherData.find((item) => item.id === id);
      if (city) openWeatherModal(city);
    });
  });

  document.querySelectorAll(".btn-favorite").forEach((button) => {
    button.addEventListener("click", () => {
      saveFavorite(button.dataset.city, button);
    });
  });
}

/*
=========================================
MODAL — clima actual + pronóstico 5 días
=========================================
*/
async function openWeatherModal(city) {
  modalBody.innerHTML = `
    <div class="modal-weather">
      <img src="${buildLargeIconUrl(city.icon)}" alt="${city.description}">
      <h2>${city.city}</h2>
      <p>${city.country}</p>
      <h3>${city.temperature}°C</h3>
      <p>Sensación térmica: ${city.feelsLike}°C</p>
      <p>Humedad: ${city.humidity}%</p>
      <p>Presión: ${city.pressure} hPa</p>
      <p>Viento: ${city.windSpeed} m/s</p>
      <p>Amanecer: ${formatTime(city.sunrise)}</p>
      <p>Atardecer: ${formatTime(city.sunset)}</p>
      <p>${city.description}</p>
    </div>
    <div id="forecastSection">
      <p style="text-align:center; margin-top:16px; color:var(--text-light)">
        Cargando pronóstico...
      </p>
    </div>
  `;

  modal.classList.remove("hidden");

  try {
    const forecastData = await getForecast(city.lat, city.lon);

    const nextDays = forecastData.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 5);

    const daysToShow =
      nextDays.length > 0
        ? nextDays
        : Object.values(
            forecastData.list.reduce((acc, item) => {
              const date = item.dt_txt.split(" ")[0];
              if (!acc[date]) acc[date] = item;
              return acc;
            }, {}),
          ).slice(0, 5);

    const forecastHTML = daysToShow
      .map((day) => {
        const fecha = new Date(day.dt_txt).toLocaleDateString("es-AR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        return `
        <div class="forecast-day">
          <p>${fecha}</p>
          <img src="${buildIconUrl(day.weather[0].icon)}" alt="${day.weather[0].description}">
          <strong>${Math.round(day.main.temp)}°C</strong>
          <p style="font-size:0.8rem; text-transform:capitalize; color:var(--text-light)">
            ${day.weather[0].description}
          </p>
        </div>
      `;
      })
      .join("");

    document.getElementById("forecastSection").innerHTML = `
      <hr style="margin: 20px 0; border-color: #e5e7eb;">
      <h3 style="text-align:center; margin-bottom:14px;">Pronóstico 5 días</h3>
      <div class="forecast-container">${forecastHTML}</div>
    `;
  } catch (error) {
    document.getElementById("forecastSection").innerHTML = `
      <p style="text-align:center; margin-top:16px; color:var(--danger-color)">
        No se pudo cargar el pronóstico.
      </p>
    `;
  }
}

function closeWeatherModal() {
  modal.classList.add("hidden");
}

/*
=========================================
FAVORITOS
=========================================
*/
function saveFavorite(cityName, button) {
  const favorites =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];

  if (favorites.includes(cityName)) {
    showMessage("La ciudad ya existe en favoritos.", "error");
    return;
  }

  favorites.push(cityName);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));

  if (button) {
    button.classList.add("favorito-agregado");
    button.textContent = "★ En favoritos";
  }

  updateFavoritesCounter();
  showMessage(MESSAGES.FAVORITE_ADDED, "success");
}

function updateFavoritesCounter() {
  const favorites =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
  favoritesCount.textContent = favorites.length;
}

/*
=========================================
FILTRO DE PAÍSES
=========================================
*/
function populateCountryFilter() {
  COUNTRIES.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = country.name;
    countryFilter.appendChild(option);
  });
}

/*
=========================================
CONTADORES
=========================================
*/
function updateCitiesCounter() {
  citiesCount.textContent = filteredData.length;
}

/*
=========================================
LIMPIAR TODO
=========================================
*/
function clearAll() {
  weatherData = [];
  filteredData = [];
  renderCards();
  searchInput.value = "";
  sortSelect.value = "";
  countryFilter.value = "";
  showMessage("Datos limpiados.", "success");
}

/*
=========================================
LOADER
=========================================
*/
function showLoader() {
  loaderContainer.classList.remove("hidden");
}

function hideLoader() {
  loaderContainer.classList.add("hidden");
}

/*
=========================================
MENSAJES
=========================================
*/
function showMessage(text, type = "success") {
  const className = type === "error" ? "message-error" : "message-success";
  messageContainer.innerHTML = `
    <div class="message ${className}">${text}</div>
  `;
  setTimeout(() => {
    messageContainer.innerHTML = "";
  }, 3000);
}

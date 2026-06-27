/*
=========================================
FAVORITES.JS
Página de favoritos
=========================================
*/
import {
  STORAGE_KEYS,
  MESSAGES,
  buildIconUrl,
  buildLargeIconUrl,
} from "./config.js";

import { loadFavoritesWeather, formatTime, getForecast } from "./api.js";

/*
=========================================
ELEMENTOS DEL DOM
=========================================
*/
const favoritesContainer = document.getElementById("favoritesContainer");

const favoritesCount = document.getElementById("favoritesCount");

const emptyState = document.getElementById("emptyState");

const loaderContainer = document.getElementById("loaderContainer");

const messageContainer = document.getElementById("messageContainer");

const refreshFavoritesBtn = document.getElementById("refreshFavoritesBtn");

const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");

const modal = document.getElementById("weatherModal");

const modalBody = document.getElementById("modalBody");

const closeModal = document.getElementById("closeModal");

/*
=========================================
ESTADO
=========================================
*/
let favoritesWeather = [];

/*
=========================================
INIT
=========================================
*/
document.addEventListener("DOMContentLoaded", init);

async function init() {
  addEvents();
  await loadFavorites();
}

/*
=========================================
EVENTOS
=========================================
*/
function addEvents() {
  refreshFavoritesBtn.addEventListener("click", loadFavorites);

  clearFavoritesBtn.addEventListener("click", clearFavorites);

  closeModal.addEventListener("click", closeWeatherModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeWeatherModal();
    }
  });
}

/*
=========================================
CARGAR FAVORITOS
=========================================
*/
async function loadFavorites() {
  try {
    showLoader();

    const favorites =
      JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];

    updateCounter(favorites.length);

    if (favorites.length === 0) {
      favoritesContainer.innerHTML = "";

      emptyState.classList.remove("hidden");

      favoritesWeather = [];

      return;
    }

    emptyState.classList.add("hidden");

    favoritesWeather = await loadFavoritesWeather(favorites);

    renderCards();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    hideLoader();
  }
}

/*
=========================================
RENDER
=========================================
*/
function renderCards() {
  favoritesContainer.innerHTML = "";

  favoritesWeather.forEach((city) => {
    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
                <img
                    src="${buildIconUrl(city.icon)}"
                    alt="${city.description}"
                >
                <h3>
                    ${city.city}
                </h3>
                <p class="country">
                    ${city.country}
                </p>
                <p class="temperature">
                    ${city.temperature}°C
                </p>
                <p class="weather-description">
                    ${city.description}
                </p>
                <div class="card-buttons">
                    <button
                        class="btn btn-detail"
                        data-id="${city.id}"
                    >
                        Detalle
                    </button>
                    <button
                        class="btn btn-remove"
                        data-city="${city.city}"
                    >
                        Eliminar
                    </button>
                </div>
            `;
    favoritesContainer.appendChild(card);
  });
  addCardEvents();
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
      const city = favoritesWeather.find((item) => item.id === id);

      if (city) {
        openWeatherModal(city);
      }
    });
  });

  document.querySelectorAll(".btn-remove").forEach((button) => {
    button.addEventListener("click", () => {
      removeFavorite(button.dataset.city);
    });
  });
}

/*
=========================================
ELIMINAR FAVORITO
=========================================
*/
function removeFavorite(cityName) {
  const favorites =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];

  const updated = favorites.filter((city) => city !== cityName);

  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));

  showMessage(MESSAGES.FAVORITE_REMOVED, "success");

  loadFavorites();
}

/*
=========================================
ELIMINAR TODOS
=========================================
*/
function clearFavorites() {
  const confirmDelete = confirm("¿Eliminar todos los favoritos?");

  if (!confirmDelete) {
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.FAVORITES);

  favoritesWeather = [];

  favoritesContainer.innerHTML = "";

  updateCounter(0);

  emptyState.classList.remove("hidden");

  showMessage(MESSAGES.FAVORITES_CLEARED, "success");
}

/*
=========================================
MODAL
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
CONTADOR
=========================================
*/
function updateCounter(value) {
  favoritesCount.textContent = value;
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
        <div class="message ${className}">
            ${text}
        </div>
    `;

  setTimeout(() => {
    messageContainer.innerHTML = "";
  }, 3000);
}

/*
=========================================
API.JS - Lógica de comunicación con OpenWeatherMap
=========================================
*/
import { API_KEY, BASE_URL, DEFAULT_PARAMS, MESSAGES } from "./config.js";

/*
=========================================
VALIDAR RESPUESTA HTTP
=========================================
*/
async function handleResponse(response) {
  if (!response.ok) {
    switch (response.status) {
      case 404:
        throw new Error(MESSAGES.CITY_NOT_FOUND);
      case 401:
        throw new Error("API Key inválida.");
      case 429:
        throw new Error("Se alcanzó el límite de consultas.");
      default:
        throw new Error(MESSAGES.NETWORK_ERROR);
    }
  }
  return await response.json();
}

/*
=========================================
ARMAR URL CON PARÁMETROS
=========================================
*/
function createUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);

  url.searchParams.append("appid", API_KEY);

  url.searchParams.append("units", DEFAULT_PARAMS.units);

  url.searchParams.append("lang", DEFAULT_PARAMS.lang);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/*
=========================================
OBTENER CLIMA POR CIUDAD
=========================================
*/
export async function getWeatherByCity(city) {
  const url = createUrl("weather", { q: city });

  const response = await fetch(url);

  return await handleResponse(response);
}

/*
=========================================
OBTENER CLIMA POR LATITUD/LONGITUD
=========================================
*/
export async function getForecast(lat, lon) {
  const url = createUrl("forecast", { lat, lon });

  const response = await fetch(url);

  return await handleResponse(response);
}

/*
=========================================
BUSCAR MÚLTIPLES CIUDADES
=========================================
lista inicial al abrir la aplicación.
*/
export async function getMultipleCities(cities = []) {
  const requests = cities.map((city) => getWeatherByCity(city));
  const results = await Promise.allSettled(requests);

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

/*
=========================================
TRANSFORMA DATOS
=========================================
Genera un objeto limpio para usar en cards.
*/
export function mapWeatherData(data) {
  return {
    id: data.id,
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    weather: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    lat: data.coord.lat,
    lon: data.coord.lon,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
  };
}

/*
=========================================
ORDENAMIENTO
=========================================
*/
export function sortWeatherData(data, sortType) {
  const items = [...data];
  switch (sortType) {
    case "name-asc":
      return items.sort((a, b) => a.city.localeCompare(b.city));
    case "name-desc":
      return items.sort((a, b) => b.city.localeCompare(a.city));
    case "temp-asc":
      return items.sort((a, b) => a.temperature - b.temperature);
    case "temp-desc":
      return items.sort((a, b) => b.temperature - a.temperature);
    default:
      return items;
  }
}

/*
=========================================
FILTRO POR PAÍS
=========================================
*/
export function filterByCountry(data, countryCode) {
  if (!countryCode) {
    return data;
  }
  return data.filter((item) => item.country === countryCode);
}

/*
=========================================
CONVERTIR TIMESTAMP A HORA
=========================================
*/
export function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
=========================================
OBTENER NOMBRE DE DÍA
=========================================
*/
/*export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}*/

/*
=========================================
OBTENER DATOS DE FAVORITOS
=========================================
Recibe lista de ciudades guardadas en localStorage y consulta clima.
*/
export async function loadFavoritesWeather(favorites) {
  if (!favorites || favorites.length === 0) {
    return [];
  }

  const requests = favorites.map((city) => getWeatherByCity(city));
  const results = await Promise.allSettled(requests);

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => mapWeatherData(result.value));
}

/*
=========================================
CIUDADES INICIALES
=========================================
*/
export const DEFAULT_CITIES = [
  "Buenos Aires",
  "Rosario",
  "Córdoba",
  "Mendoza",
  "Salta",
  "Tucumán",
  "Mar del Plata",
  "La Plata",
  "Neuquén",
  "Posadas",
  "Resistencia",
  "Santa Fe",
  "San Miguel de Tucumán",
  "Corrientes",
  "Ushuaia",
  "Río Gallegos",
  "Bariloche",
  "San Juan",
  "San Luis",
  "Montevideo",
  "Santiago",
  "Lima",
  "Bogotá",
  "Quito",
  "Caracas",
  "Asunción",
  "Madrid",
  "Barcelona",
  "Sevilla",
  "Valencia",
  "París",
  "Londres",
  "Roma",
  "Berlín",
  "Tokio",
  "Seúl",
  "Nueva York",
  "Los Ángeles",
  "Chicago",
  "Miami",
  "Toronto",
  "Sídney",
  "Bangkok",
  "Estanbul",
  "Dubai",
  "Kuala Lumpur",
  "San Carlos de Bariloche",
  "Viedma",
  "Necochea",
];

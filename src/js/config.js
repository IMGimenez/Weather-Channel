/*
=========================================
CONFIGURACIÓN GENERAL DE LA APLICACIÓN
=========================================
*/
export const API_KEY = import.meta.env.VITE_ACCESS_KEY;

export const BASE_URL = import.meta.env.VITE_API_URL;

export const ICON_URL = "https://openweathermap.org/img/wn";

/*
=========================================
CONFIGURACIÓN DE FETCH
=========================================
*/
export const DEFAULT_PARAMS = {
  units: "metric",
  lang: "es",
};

/*
=========================================
LOCAL STORAGE
=========================================
*/
export const STORAGE_KEYS = {
  FAVORITES: "weather_favorites",
  THEME: "weather_theme",
};

/*
=========================================
MENSAJES DE LA APP
=========================================
*/
export const MESSAGES = {
  EMPTY_SEARCH: "Ingrese una ciudad para buscar.",
  CITY_NOT_FOUND: "No se encontró la ciudad indicada.",
  NETWORK_ERROR: "Error de conexión. Intente nuevamente.",
  FAVORITE_ADDED: "Ciudad agregada a favoritos.",
  FAVORITE_REMOVED: "Ciudad eliminada de favoritos.",
  FAVORITES_EMPTY: "No existen favoritos guardados.",
  FAVORITES_CLEARED: "Todos los favoritos fueron eliminados.",
};

/*
=========================================
PAÍSES SOPORTADOS PARA FILTRO
=========================================
*/
export const COUNTRIES = [
  {
    code: "AR",
    name: "Argentina",
  },
  {
    code: "BR",
    name: "Brasil",
  },
  {
    code: "CL",
    name: "Chile",
  },
  {
    code: "UY",
    name: "Uruguay",
  },
  {
    code: "PY",
    name: "Paraguay",
  },
  {
    code: "BO",
    name: "Bolivia",
  },
  {
    code: "PE",
    name: "Perú",
  },
  {
    code: "CO",
    name: "Colombia",
  },
  {
    code: "VE",
    name: "Venezuela",
  },
  {
    code: "EC",
    name: "Ecuador",
  },
  {
    code: "MX",
    name: "México",
  },
  {
    code: "US",
    name: "Estados Unidos",
  },
  {
    code: "CA",
    name: "Canadá",
  },
  {
    code: "ES",
    name: "España",
  },
  {
    code: "FR",
    name: "Francia",
  },
  {
    code: "IT",
    name: "Italia",
  },
  {
    code: "DE",
    name: "Alemania",
  },
  {
    code: "GB",
    name: "Reino Unido",
  },
];

/*
=========================================
FUNCIONES AUXILIARES
=========================================
*/
export function buildIconUrl(iconCode) {
  return `${ICON_URL}/${iconCode}@2x.png`;
}

export function buildLargeIconUrl(iconCode) {
  return `${ICON_URL}/${iconCode}@4x.png`;
}

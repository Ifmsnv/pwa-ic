const weatherApp = {
  selectedLocations: {},
  addDialogContainer: document.getElementById('addDialogContainer'),
};

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
  // Hide the dialog
  toggleAddDialog();
  // Get the selected city
  const select = document.getElementById('selectCityToAdd');
  const selected = select.options[select.selectedIndex];
  const key = selected.value;
  const [lat, lon] = key.split(',')
  const label = selected.textContent;
  const location = {label, key, lat, lon};
  // Create a new card & get the weather data from the server
  const card = getForecastCard(location);
  getForecastFromNetwork(location).then((forecast) => {
    renderForecast(card, forecast);
  });
  // Save the updated list of selected cities.
  weatherApp.selectedLocations[key] = location;
  saveLocationList(weatherApp.selectedLocations);
}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the weather forecast.
 */
function getForecastCard(location) {
  const id = location.key;
  const card = document.getElementById(id);
  if (card) {
    return card;
  }
  const newCard = document.getElementById('weather-template').cloneNode(true);
  newCard.querySelector('.location').textContent = location.label;
  newCard.setAttribute('id', id);
  newCard.querySelector('.remove-city')
    .addEventListener('click', removeLocation);
  document.querySelector('main').appendChild(newCard);
  newCard.removeAttribute('hidden');
  return newCard;
}

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {Object} location Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(location) {
  console.log('getForecastFromCache', location);
  // code to get weather forecast from the caches object.
  if (!('caches' in window)) {
    return null;
  }
  const url = getForecastUrl(location);
  return caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch((err) => {
      console.error('Error getting data from cache', err);
      return null;
    });
}

/**
 * Get's the latest forecast data from the network.
 *
 * @param {Object} location Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromNetwork(location) {
  console.log('getForecastFromNetwork', location);
  const url = getForecastUrl(location);

  return fetch(url)
    .then((response) => response.json())
    .then(response => response)
    .catch(() => null);
}

function getForecastUrl(location) {
  return `./forecast/${location.lat},${location.lon}`;
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadLocationList() {
  let locations = localStorage.getItem('locationList');
  if (locations) {
    try {
      locations = JSON.parse(locations);
    } catch (ex) {
      locations = {};
    }
  }
  if (!locations || Object.keys(locations).length === 0) {
    // const key = '40.7720232,-73.9732319';
    const lat = '-23.7456071'
    const lon = '-53.2934951'
    const key = `${lat},${lon}`;
    const label = 'Umuarama/PR';
    locations = {};
    locations[key] = {label, key, lat, lon};
  }
  return locations;
}

/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
  const parent = evt.srcElement.parentElement;
  parent.remove();
  if (weatherApp.selectedLocations[parent.id]) {
    delete weatherApp.selectedLocations[parent.id];
    saveLocationList(weatherApp.selectedLocations);
  }
}

/**
 * Renders the forecast data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Weather forecast data to update the element with.
 */
function renderForecast(card, data) {
  if (!data) {
    // There's no data, skip the update.
    return;
  }

  // Find out when the element was last updated.
  const cardLastUpdatedElem = card.querySelector('.card-last-updated');
  const cardLastUpdated = cardLastUpdatedElem.textContent;
  const lastUpdated = parseInt(cardLastUpdated);

  // If the data on the element is newer, skip the update.
  if (lastUpdated >= data.current.dt) {
    return;
  }
  cardLastUpdatedElem.textContent = data.current.dt;

  const current = data.current;
  const weather = current.weather[0];

  // Render the forecast data into the card.
  card.querySelector('.description').textContent = weather.main;
  const forecastFrom = luxon.DateTime
    .fromSeconds(data.current.dt)
    .setZone(data.timezone)
    .toFormat('DDDD t');
  card.querySelector('.date').textContent = forecastFrom;
  card.querySelector('.current .icon')
    .innerHTML = `<img alt="${weather.description}" src="${urlIcon(weather.icon)}">`;
  card.querySelector('.current .temperature .value')
    .textContent = Math.round(current.temp);
  card.querySelector('.current .humidity .value')
    .textContent = Math.round(current.humidity);
  card.querySelector('.current .wind .value')
    .textContent = Math.round(current.wind_speed);
  card.querySelector('.current .wind .direction')
    .textContent = Math.round(current.wind_deg);
  const sunrise = luxon.DateTime
    .fromSeconds(current.sunrise)
    .setZone(data.timezone)
    .toFormat('t');
  card.querySelector('.current .sunrise .value').textContent = sunrise;
  const sunset = luxon.DateTime
    .fromSeconds(current.sunset)
    .setZone(data.timezone)
    .toFormat('t');
  card.querySelector('.current .sunset .value').textContent = sunset;

  // Render the next 7 days.
  const futureTiles = card.querySelectorAll('.future .oneday');
  futureTiles.forEach((tile, index) => {
    const forecast = data.daily[index + 1];
    const forecastFor = luxon.DateTime
      .fromSeconds(forecast.dt)
      .setZone(data.timezone)
      .toFormat('ccc');
    tile.querySelector('.date').textContent = forecastFor;
    tile.querySelector('.icon')
      .innerHTML = `<img alt="${forecast.weather[0].description}" src="${urlIcon(forecast.weather[0].icon)}">`;
    tile.querySelector('.temp-high .value')
      .textContent = Math.round(forecast.temp.max);
    tile.querySelector('.temp-low .value')
      .textContent = Math.round(forecast.temp.min);
  });

  // If the loading spinner is still visible, remove it.
  const spinner = card.querySelector('.card-spinner');
  if (spinner) {
    card.removeChild(spinner);
  }
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
  const data = JSON.stringify(locations);
  localStorage.setItem('locationList', data);
}

/**
 * Toggles the visibility of the add location dialog box.
 */
function toggleAddDialog() {
  weatherApp.addDialogContainer.classList.toggle('visible');
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() {
  Object.keys(weatherApp.selectedLocations).forEach((key) => {
    const location = weatherApp.selectedLocations[key];
    const card = getForecastCard(location);

    // code to call getForecastFromCache
    getForecastFromCache(location)
      .then((forecast) => {
        renderForecast(card, forecast);
      });

    // Get the forecast data from the network.
    getForecastFromNetwork(location)
      .then((forecast) => {
        renderForecast(card, forecast);
      });
  });
}

/**
 * Return icon url
 * @param icon
 */
function urlIcon(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function init() {
  luxon.DateTime.local();

  // Get the location list, and update the UI.
  weatherApp.selectedLocations = loadLocationList();
  updateData();

  // Set up the event handlers for all of the buttons.
  document.getElementById('butRefresh').addEventListener('click', updateData);
  document.getElementById('butAdd').addEventListener('click', toggleAddDialog);
  document.getElementById('butDialogCancel')
    .addEventListener('click', toggleAddDialog);
  document.getElementById('butDialogAdd')
    .addEventListener('click', addLocation);
}

function sw() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((reg) => {
          console.log('Service worker registered.', reg);
        });
    });
  }
}

init();
sw();

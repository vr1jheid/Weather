showWeather("geolocation");

///////////////////////////////

let searchButton = document.querySelector(".search-button");
let searchInput = document.querySelector(".search-input");

searchButton.addEventListener("click", searchCity);
//searchInput.addEventListener("focus", inputHandler);

//////////////////////////////////////////////

searchInput.onfocus = () => {
  let delay = null;

  searchInput.oninput = () => {
    if (delay) clearTimeout(delay);
    delay = setTimeout( () => {
      removeSuggestionsList();
      searchCity()
    }, 1000);
  }
}

searchInput.onblur = () => {
/*   searchInput.oninput = null;
  searchInput.value
  removeSuggestionsList();
  suggestionsList.removeEventListener("click", selectSuggestion);
   */
}

async function searchCity() {
  let searchInput = document.querySelector(".search-input");
  let searchForm = document.querySelector(".search-city");
  let suggestionsList = document.createElement("ul");
  let request = searchInput.value;
  let suggestionOptions = new Map;

  if (!request) return;
  let suggestions = (await getSuggestions(request)).suggestions;

  //if (!suggestions.length) suggestionsList.remove();
    
  showSuggestionsList(suggestions, searchForm);
  //let suggestionsList = document.querySelector(".suggestions-list")
  suggestionsList.addEventListener("click", selectSuggestion);

  function showSuggestionsList(suggestions, position) {

    suggestionsList.classList.add("suggestions-list");
  
    suggestions.forEach(elem => {
      if (suggestionsList.children.length > 4) return;
      console.log(elem);
      let suggestion = document.createElement("li")

      let options = {
        coords: 
          {
            latitude: elem.data.geo_lat, 
            longitude: elem.data.geo_lon
          },
          city: elem.value
      }

      suggestionOptions.set(suggestion, options)
      suggestion.textContent = elem.value;
      suggestion.classList.add("suggestion-item");
      suggestionsList.append(suggestion);
    });
    position.append(suggestionsList);
  }

  function selectSuggestion(event) {
    let suggestion = event.target.closest(".suggestion-item");
    if (!suggestion) return;

    showWeather("coords", suggestionOptions.get(suggestion));

    suggestionsList.removeEventListener("click", selectSuggestion);
    suggestionsList.remove();
    suggestionOptions.clear();
    searchInput.value = "";
  }
}

async function showWeather(type, options) {
  let icon = document.querySelector(".main-img");
  let degreesReal = document.querySelector(".real");
  let degreesFeel = document.querySelector(".feels-like");
  let description = document.querySelector(".description");
  let cityDiv = document.querySelector(".city");
  let wind = document.querySelector("#wind");
  let clouds = document.querySelector("#clouds");
  let humidity = document.querySelector("#humidity");
  let weatherData = null;
  let coords = null;

  switch (type) {
    case "geolocation":
      coords = await getUserCoords();
      break;

    case "coords":
      coords = options.coords;

    default:
      break;
  }

  console.log(coords);
  weatherData = await getWeather(coords);

  icon.src = `/images/${weatherData.weather.at(0).icon}.svg`;
  description.textContent = weatherData.weather[0].description;
  degreesReal.innerHTML = Math.round(weatherData.main.temp) + "&deg;"
  degreesFeel.innerHTML = `Ощущается как ${Math.round(weatherData.main.feels_like)}&deg`
  wind.textContent = weatherData.wind.speed + " м/c";
  clouds.textContent = weatherData.clouds.all + "%";
  humidity.textContent = weatherData.main.humidity + "%";

  //cityDiv.textContent = !options && weatherData.name;
  cityDiv.textContent = !options ? weatherData.name : options.city;

  console.log(weatherData);
}

async function getWeather(coords){
  let key = "4f6779cea760a01b2a2e95b86169d735";
  let params = new URLSearchParams({
    lat: coords.latitude,
    lon: coords.longitude,
    appid: key,
    units: "metric",
    lang: "ru",
  });

  let url = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`
  let response = await fetch(url);
  
  return await response.json();
}

function getUserCoords() {
  return new Promise( resolve => {
    navigator.geolocation.getCurrentPosition( position => resolve(position.coords));
  })
}

async function getSuggestions(request) {
  var url = "http://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
  var token = "939440e83c2ea29e4c2473b38a85f59efd56ec08";
  let options = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Token " + token
    },
    body: JSON.stringify({query: request})
  }
  //let response = await fetch("/script/suggestion.json");
  let response = await fetch(url, options)
  console.log("request");
  return await response.json();
}

function removeSuggestionsList() {
  let suggestionsList = document.querySelector(".suggestions-list");
  suggestionsList && suggestionsList.remove();
}

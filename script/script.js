/**
 * function getWeather()
 * 
 * @param {string} type - Тип запроса city/coords
 * @param {Object} options - Дополнительнеые параметры
 * @param {number} options.longitude - Longitude/Долгота
 * @param {number} options.latitude - Latitude/Широта
 */


async function getWeather(type, options){
  let key = "4f6779cea760a01b2a2e95b86169d735";
  let params = new URLSearchParams({
    appid: key,
    units: "metric",
    lang: "ru"
  });

  switch (type) {
    case "city":
      params.set("q", options.city)
      break;

    case "coords":
      params.set("lat", options.latitude);
      params.set("lon", options.longitude);
      break;

    default:
      break;
  }

  let url = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`
  let response = await fetch(url);
  
  return await response.json();
}


function getUserCoords() {
  return new Promise( resolve => {
    navigator.geolocation.getCurrentPosition( position => resolve(position.coords));
  })
}



async function showWeather(type, city) {
  let icon = document.querySelector(".main-img");
  let degreesReal = document.querySelector(".real");
  let degreesFeel = document.querySelector(".feels-like");
  let description = document.querySelector(".description");
  let cityDiv = document.querySelector(".city");
  let wind = document.querySelector("#wind");
  let clouds = document.querySelector("#clouds");
  let humidity = document.querySelector("#humidity");
  let weatherData = null;


  switch (type) {
    case "city":
      weatherData = await getWeather(type, {city: city})
      break;

    case "location":
      let coords = await getUserCoords();
      weatherData = await getWeather("coords", coords);
      console.log(coords);
      break;
  
    default:
      break;
  }


  icon.src = `/images/${weatherData.weather.at(0).icon}.svg`;
  description.textContent = weatherData.weather[0].description;
  degreesReal.innerHTML = Math.round(weatherData.main.temp) + "&deg;"
  degreesFeel.innerHTML = `Ощущается как ${Math.round(weatherData.main.feels_like)}&deg`
  wind.textContent = weatherData.wind.speed + " м/c";
  clouds.textContent = weatherData.clouds.all + "%";
  humidity.textContent = weatherData.main.humidity + "%";

  cityDiv.textContent = !city && weatherData.name;

  console.log(weatherData);
}


showWeather("location");

const API_KEY = "YRGBLQUXG9KJ7E4NBYBHBEPMH";
// https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Melbourne?unitGroup=us&key=YRGBLQUXG9KJ7E4NBYBHBEPMH&contentType=json

const weatherPrompt = null;
let promptValue;
let existingData;
let previousSearch;
let isFahrenheit = true;
if (localStorage.getItem("lastSearch") != undefined) previousSearch = JSON.parse(localStorage.getItem("lastSearch"));
if (localStorage.getItem("dataSet") != undefined) existingData = JSON.parse(localStorage.getItem("dataSet"));

async function fetchWeather(search) {
	if (JSON.parse(localStorage.getItem("lastSearch")) != search) {
		const response = await fetch(
			`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${search}?unitGroup=us&key=${API_KEY}&contentType=json`
		);
		const data = await response.json();
		localStorage.setItem("dataSet", JSON.stringify(data));
		existingData = data;
		previousSearch = search;
		localStorage.setItem("lastSearch", JSON.stringify(search));
	} else {
		console.log("already loaded, not fetching");
	}
	let instance = new WeatherPack(existingData);
	generateData(instance);
}

// function fetchWeather(search) {
// 	if (JSON.parse(localStorage.getItem("lastSearch")) == search) {
// 		console.log("already loaded");
// 		return;
// 	} else {
// 		previousSearch = search;
// 		localStorage.setItem("lastSearch", JSON.stringify(search));
// 	}

// 	fetch(
// 		`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${search}?unitGroup=us&key=${API_KEY}&contentType=json`
// 	)
// 		.then((response) => {
// 			return response.json();
// 		})
// 		.then((response) => {
// 			localStorage.setItem("dataSet", JSON.stringify(response));
// 			instance = new WeatherPack(response);
// 			existingData = instance;
// 		})
// 		.catch((err) => {
// 			console.error("invalid:", err);
// 		});
// }

function generateData(instance) {
	let highs = instance.tempHigh;
	let lows = instance.tempLow;
	let tempsymbol = "°F";

	if (!isFahrenheit) {
		highs = ((highs - 32) * 5) / 9;
		lows = ((lows - 32) * 5) / 9;
		tempsymbol = "°C";
	}

	const arr = {
		Location: instance.loc,
		Date: instance.date,
		Highs: `${Math.round(highs)}${tempsymbol}`,
		Lows: `${Math.round(lows)}${tempsymbol}`,
		// Conditions: instance.conditions,
		Description: instance.description,
	};
	const weatherItems = document.getElementById("weatherItems");
	weatherItems.innerHTML = "";
	for (const [key, value] of Object.entries(arr)) {
		const item = document.createElement("li");
		item.innerHTML = `<b>${key}:</b> ${value}`;
		weatherItems.appendChild(item);
	}
	console.log(instance.icon);
	const weatherIconContainer = document.querySelector(".weather-icon");
	weatherIconContainer.innerHTML = "";
	const weatherIcon = document.createElement("i");

	switch (instance.icon) {
		case "snow":
			weatherIcon.classList = "weather-icon fa-solid fa-snowflake fa-2x";
			break;
		case "rain":
			weatherIcon.classList = "weather-icon fa-solid fa-cloud-rain fa-2x";
			break;
		case "fog":
			weatherIcon.classList = "weather-icon fa-solid fa-smog fa-2x";
			break;
		case "wind":
			weatherIcon.classList = "weather-icon fa-solid fa-wind fa-2x";
			break;
		case "cloudy":
			weatherIcon.classList = "weather-icon fa-solid fa-cloud fa-2x";
			break;
		case "partly-cloudy-day":
			weatherIcon.classList = "weather-icon fa-solid fa-cloud-sun fa-2x";
			break;
		case "partly-cloudy-night":
			weatherIcon.classList = "weather-icon fa-solid fa-cloud-moon fa-2x";
			break;
		case "clear-day":
			weatherIcon.classList = "weather-icon fa-solid fa-sun fa-2x";
			break;
		case "clear-night":
			weatherIcon.classList = "weather-icon fa-solid fa-moon fa-2x";
			break;
	}
	weatherIconContainer.appendChild(weatherIcon);
}

class WeatherPack {
	constructor(weather) {
		this.id = new Date().getTime();
		this.loc = weather.resolvedAddress;
		this.date = weather.days[0].datetime;
		this.tempHigh = weather.days[0].tempmax;
		this.tempLow = weather.days[0].tempmin;
		this.conditions = weather.days[0].conditions;
		this.description = weather.days[0].description;
		this.icon = weather.days[0].icon;
	}
}

const searchButton = document.getElementById("search-btn");
searchButton.addEventListener("click", (e) => {
	e.preventDefault();
	if (document.getElementById("temp-option").value == "tempF") isFahrenheit = true;
	else isFahrenheit = false;
	console.log(isFahrenheit);

	promptValue = document.getElementById("search-prompt").value;
	console.log(promptValue);
	fetchWeather(promptValue).catch((err) => {
		console.error("invalid input:", err);
	});
});

fetchWeather(previousSearch);

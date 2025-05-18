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

	generateData(instance, 7);
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

function generateData(instance, days) {


	if (instance.isDay()) {
		document.getElementById("content").classList = "";
	} else {
		document.getElementById("content").classList = "dark-mode";
	}

	let current = instance.tempCurrent;
	let tempsymbol = "°F";
	if (!isFahrenheit) {
		current = ((current - 32) * 5) / 9;
		tempsymbol = "°C";
	}

	const arrLoc = {
		Location: instance.loc,
		Time: instance.time,
		Currently: `${Math.round(current)}${tempsymbol}`,
		Description: instance.description,
	};
	const locItems = document.getElementById("location-info");
	locItems.innerHTML = "";
	for (const [key, value] of Object.entries(arrLoc)) {
		const item = document.createElement("p");
		item.innerHTML = `<b>${key}:</b> ${value}`;
		locItems.appendChild(item);
	}

	const weatherWrapper = document.getElementById("weather-wrapper");
	weatherWrapper.innerHTML = '';
	for (let index = 0; index < days; index++) {
		const weatherContainer = document.createElement("div");
		weatherContainer.className = "weather-container";
		weatherWrapper.appendChild(weatherContainer);

		let highs = instance.getHighs(index);
		let lows = instance.getLows(index);

		if (!isFahrenheit) {
			highs = ((highs - 32) * 5) / 9;
			lows = ((lows - 32) * 5) / 9;
		}
		const date = new Date(instance.getDate(index));

		const arrWeather = {
			Day: date.toLocaleDateString(date, {weekday: 'long'}),
			Date: date.toLocaleDateString(date),
			Highs: `${Math.round(highs)}${tempsymbol}`,
			Lows: `${Math.round(lows)}${tempsymbol}`,
			// Conditions: instance.conditions,
			Description: instance.getDesc(index),
		};

		const weatherItems = document.createElement("ul");
		weatherItems.className = "weather-items";
		weatherContainer.appendChild(weatherItems);

		for (const [key, value] of Object.entries(arrWeather)) {
			const item = document.createElement("li");
			item.innerHTML = `<b>${key}:</b> ${value}`;
			weatherItems.appendChild(item);
		}

		const weatherIconContainer = document.createElement("i");
		weatherContainer.appendChild(weatherIconContainer);
		const weatherIcon = document.createElement("i");
		weatherIcon.className = "weather-icon";
		switch (instance.getIcon(index)) {
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
}

class WeatherPack {
	constructor(weather) {
		this.id = new Date().getTime();
		this.loc = weather.resolvedAddress;
		this.days = weather.days;
		this.time = weather.currentConditions.datetime;
		this.sunset = weather.currentConditions.sunset;
		this.sunrise = weather.currentConditions.sunrise;
		this.tempCurrent = weather.currentConditions.temp;
		this.description = weather.description;
	}
	isDay = () => this.time > this.sunrise && this.time < this.sunset;

	getDate = (i) => this.days[i].datetime;
	getHighs = (i) => this.days[i].tempmax;
	getLows = (i) => this.days[i].tempmin;
	getCond = (i) => this.days[i].conditions;
	getDesc = (i) => this.days[i].description;
	getIcon = (i) => this.days[i].icon;
}

const searchButton = document.getElementById("search-btn");
searchButton.addEventListener("click", (e) => {
	e.preventDefault();
	if (document.getElementById("temp-option").value == "tempF") isFahrenheit = true;
	else isFahrenheit = false;

	promptValue = document.getElementById("search-prompt").value;
	fetchWeather(promptValue).catch((err) => {
		console.error("invalid input:", err);
	});
});

fetchWeather(previousSearch);

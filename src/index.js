const API_KEY = "YRGBLQUXG9KJ7E4NBYBHBEPMH";
// https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Melbourne?unitGroup=us&key=YRGBLQUXG9KJ7E4NBYBHBEPMH&contentType=json

const weatherPrompt = null;
let promptValue;
let existingData;
let previousSearch;
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
	const arr = {
		Location: instance.loc,
		Date: instance.date,
		Highs: instance.tempHigh,
		Lows: instance.tempLow,
		// Conditions: instance.conditions,
		Description: instance.description,
	};
	const weatherContainer = document.getElementById("weatherContainer");
	weatherContainer.innerHTML = '';
	for (const [key, value] of Object.entries(arr)) {
		const item = document.createElement("li");
		item.textContent = `${key}: ${value}`;
		weatherContainer.appendChild(item);
	}
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
	}
}

const searchButton = document.getElementById('search-btn');
searchButton.addEventListener('click', (e) => {
	e.preventDefault();
if (document.getElementById("search-prompt").value === previousSearch) return;

	promptValue = document.getElementById("search-prompt").value;
	console.log(promptValue);
	fetchWeather(promptValue).catch((err) => {
	console.error("invalid input:", err);
});
})

fetchWeather(previousSearch);
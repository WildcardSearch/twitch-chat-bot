/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const fs = require('fs');

const {
	milliseconds, seconds, minutes,
	hours, days, weeks,
	months, years, decades, centuries,
} = require("../data/time.js");

const timeMap = require("../data/time.js");


/**
 * get a random number between specified values
 *
 * @param  Number
 * @param  Number
 * @param  Number
 * @return Number
 */
function rnd(e, s, p)
{
	let start = 0,
		end = 0;

	if (typeof s == "number") {
		start = s;
	}

	if (typeof e == "number") {
		end = e;
	}

	if (typeof p == "number" &&
		p > 2) {
		return Number.parseFloat(
			Math.random()*(end-start)+start
		).toPrecision(p);
	}

	return Math.round(
		Math.random()*(end-start)
	)+start;
}

/**
 * get a random array element
 *
 * @param  Array
 * @return mixed|Boolean
 */
function arnd(a)
{
	if (typeof a !== "object" ||
		Array.isArray(a) !== true ||
		a.length === 0) {
		return false;
	}

	return a[Math.round(
		Math.random()*(a.length-1)
	)];
}

/**
 * copy an object
 * NOTE: deep copies but no functions/class objects
 *
 * @param  Object
 * @return Object|Boolean
 */
function copyObject(o)
{
	if (typeof o !== "object") {
		return false;
	}

	return JSON.parse(
		JSON.stringify(o)
	);
}


/**
 * use fs to read a data file
 *
 * @param  String
 * @param  String
 * @return Object
 */
function readFile(path)
{
	try {
		return fs.readFileSync(path, {
			encoding: 'utf8',
			flag: 'r',
		});
	} catch (err) {
		console.error(err)
	}
}

/**
 * use fs to write the data file
 *
 * @param  String
 * @param  String
 * @return void
 */
function writeFile(path, content)
{
	try {
		const data = fs.writeFileSync(path, content)
	} catch (err) {
		console.error(err)
	}
}


/**
 * break a time stamp (in milliseconds) down to a count of each components, eg. days/hours/mins/secs/ms
 *
 * @param  Number
 * @param  Object
 * @return Boolean
 */
function formatTimeStamp(ts, options)
{
	let components = [],
		componentCount = 0,
		description = "",
		sep = "",

		tsTemp = ts,

		largest = null;

		o = {
			showCenturies: true,
			showDecades: true,
			showYears: true,
			showMonths: true,
			showWeeks: true,
			showDays: true,
			showHours: true,
			showMinutes: true,
			showSeconds: true,
			showMilliseconds: false,
		},

		componentLabels = {
			centuries: "century",
			decades: "decade",
			years: "year",
			months: "month",
			weeks: "week",
			days: "day",
			hours: "hour",
			minutes: "minute",
			seconds: "second",
			milliseconds: "millisecond",
		},

		data = {
			centuries: 0,
			decades: 0,
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0,
		},

		totals = {
			centuries: 0,
			decades: 0,
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0,
		};

	if (typeof ts !== "number" ||
		isNaN(ts) === true) {
		return;
	}

	// merge options
	o = { ...o, ...options };

	// dissect the time stamp
	for (const [k, v] of Object.entries(totals)) {
		const sv = constructShowVar(k);

		if (ts < timeMap[k]) {
			continue;
		}

		if (largest === null) {
			largest = k;
		}

		totals[k] = Math.floor(ts/timeMap[k]);

		// eg. showCenturies
		if (o[sv] === true) {
			data[k] = Math.floor(tsTemp/timeMap[k]);
			tsTemp -= data[k]*timeMap[k];

			// check for plural
			if (data[k] > 1) {
				componentLabels[k] = k;
			}

			components.push(`${data[k]} ${componentLabels[k]}`);
		}

		// done? then be done
		if (tsTemp <= 0) {
			break;
		}
	}

	if (components.length === 0) {
		console.log("no output: formatTimeStamp", ts, data, totals);

		return false;
	}

	// build the description
	for (const c of components) {
		description += `${sep}${c}`;

		sep = getSeparator(componentCount, components.length);
		componentCount++;
	}

	return {
		description: description,
		data: data,
		totals: totals,
		largest: largest,
	};
}

/**
 * build the element display option var eg. o.showCenturies
 *
 * @param  Object
 * @return String
 */
function constructShowVar(c)
{
	const l = c.slice(0, 1).toUpperCase();
	const remainder = c.slice(1);

	return `show${l}${remainder}`;
}

/**
 * get the correct separator for a string item list
 *
 * @param  Number
 * @param  Number
 * @return String
 */
function getSeparator(current, total)
{
	let sep = ", ";

	if (total === 2) {
		sep = " and ";
	} else {
		if (total > 2 &&
			(total-1)-current === 1) {
			sep = ", and ";
		}
	}

	return sep;
}

/**
 * check subscription status using tmi.js userstate info
 *
 * @param  Object
 * @return null|Boolean
 */
function checkSub(userstate)
{
	/**
	 * occasionally, tmi.js yields null, indicating a failure to fetch the information
	 * so we have to keep trying until it yields a Boolean
	 */
	if (typeof userstate.subscriber === "undefined") {
		return null;
	}

	return userstate.subscriber === true;
}


module.exports = {
	rnd, arnd, readFile, writeFile, formatTimeStamp, copyObject, getSeparator, checkSub,
};

/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const fs = require('fs');


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
		console.error(err);
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
		const data = fs.writeFileSync(path, content);
	} catch (err) {
		console.error(err);
	}
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
	rnd, arnd, readFile, writeFile, copyObject, checkSub,
};

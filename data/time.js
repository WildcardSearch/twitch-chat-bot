/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const milliseconds = 1;
const seconds = 1000*milliseconds;
const minutes = 60*seconds;
const hours = 60*minutes;
const days = 24*hours;
const weeks = 7*days;
const months = 30.4375*days;
const years = 365.25*days;
const decades = 10*years;
const centuries = 100*years;


module.exports = {
	milliseconds, seconds, minutes,
	hours, days, weeks,
	months, years, decades, centuries,
};

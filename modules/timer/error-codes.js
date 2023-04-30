/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [{
	key: "timer",
	title: "Live Timer",
}];

const errorCodes = [];

const warningCodes = [{
	key: "ERROR_TIMER_SET_LIVE_TS_BAD_INFO",
	message: "failed to queue message; setLiveTimeStampFromParams received bad info",
	category: "message-queue",
}];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

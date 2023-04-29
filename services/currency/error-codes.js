/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [{
	key: "currency",
	title: "Currency System",
}];

const errorCodes = [];

const warningCodes = [
	{
		key: "ERROR_CURRENCY_NO_SYSTEM",
		message: "No currency system exists to load or loading failed",
		category: "currency",
	}, {
		key: "ERROR_CURRENCY_ADD_BAD_INFO_NO_USERNAME",
		message: "Add Points - no username passed",
		category: "currency",
	}, {
		key: "ERROR_CURRENCY_ADD_BAD_INFO_BAD_AMOUNT",
		message: "Add Points - no amount passed",
		category: "currency",
	}, {
		key: "ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME",
		message: "Subtract Points - no username passed",
		category: "currency",
	}, {
		key: "ERROR_CURRENCY_SUBTRACT_BAD_INFO_BAD_AMOUNT",
		message: "Invalid value passed to currency system .add()",
		category: "currency",
	},
];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

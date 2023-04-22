/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [{
	key: "dictionary",
	title: "Dictionary",
}];

const errorCodes = [];

const warningCodes = [
	{
		key: "ERROR_DICTIONARY_ADD_ENTRIES_BAD_INFO",
		message: "failed to add dictionary entries; unsuitable info",
		category: "dictionary",
	},
];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

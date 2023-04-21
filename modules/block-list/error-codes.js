/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [{
	key: "block-list",
	title: "Block List",
}];

const errorCodes = [];

const warningCodes = [
	{
		key: "ERROR_BLOCK_LIST_ISBLOCKED_BAD_INFO_USERNAME",
		message: "failed to do block check; missing/invalid username",
		category: "block-list",
	},
];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

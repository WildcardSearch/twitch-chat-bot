/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [{
	key: "command-center",
	title: "Command Center",
}];

const errorCodes = [{
	key: "ERROR_COMMAND_CENTER_PARSE_COMMAND_USERTRACKER_MISSING",
	message: "failed to parse command; userTracker module is not loaded",
	category: "command-center",
}];

const warningCodes = [{
	key: "ERROR_COMMAND_CENTER_ADD_COMMAND_BAD_INFO",
	message: "failed to add command; unsuitable info",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_ADD_COMMAND_NO_OUTPUT_METHOD",
	message: "failed to add command; no output method available",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_ADD_COMMAND_DUPLICATE_COMMAND",
	message: "failed to add command; duplicate key",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_ADD_COMMAND_DUPLICATE_COMMAND_ALIAS",
	message: "failed to add alias; duplicate key",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_ADD_COMMAND_DUPLICATE_COMMAND_SHORTCUT",
	message: "failed to add shortcut; duplicate key",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_PARSE_COMMAND_BAD_INFO",
	message: "failed to parse command; bad/missing info",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_PARSE_COMMAND_BLANK_MESSAGE",
	message: "failed to parse command; received blank message",
	category: "command-center",
}, {
	key: "ERROR_COMMAND_CENTER_PARSE_COMMAND_NO_OUTPUT_METHOD",
	message: "failed to parse command; no output method available",
	category: "command-center",
}, {
	key: "ERROR_PERMISSIONS_CHECK_PERMISSIONS_NO_DATA",
	message: "failed to check user permissions; invalid command object received",
	category: "command-center",
}];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

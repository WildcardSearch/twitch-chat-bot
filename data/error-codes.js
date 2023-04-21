/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [
	{
		key: "general",
		title: "General",
	}, {
		key: "credentials",
		title: "Credentials",
	}, {
		key: "initialization",
		title: "Initialization",
	}, {
		key: "events",
		title: "Events",
	}, {
		key: "module",
		title: "Modules",
	}, {
		key: "external-module",
		title: "External Modules",
	}, {
		key: "internal-module",
		title: "Internal Modules",
	}, {
		key: "database",
		title: "Database",
	}, {
		key: "globals",
		title: "Globals",
	},
];

const errorCodes = [
	{
		key: "ERROR_INVALID_CREDENTIALS",
		message: "invalid or missing credentials",
		category: "credentials",
	}, {
		key: "ERROR_CONSTRUCTOR_NO_BOT_CREDENTIALS",
		message: "no credentials passed",
		category: "credentials",
	}, {
		key: "ERROR_CONSTRUCTOR_NO_USERNAME",
		message: "no username passed",
		category: "credentials",
	}, {
		key: "ERROR_CONSTRUCTOR_NO_OAUTH",
		message: "no OAuth passed",
		category: "credentials",
	}, {
		key: "ERROR_CONSTRUCTOR_NO_CHANNELS",
		message: "no channels passed",
		category: "credentials",
	}, {
		key: "ERROR_EVENT_ON_BAD_HANDLER",
		message: "bad handler passed to .on()",
		category: "events",
	}, {
		key: "ERROR_EXTERNAL_MODULE_INVALID",
		message: "Module Invalid",
		category: "external-module",
	}, {
		key: "ERROR_INTERNAL_MODULE_INVALID",
		message: "Module Invalid",
		category: "internal-module",
	}, {
		key: "ERROR_INTERNAL_MODULE_NO_KEY",
		message: "missing key",
		category: "internal-module",
	}, {
		key: "ERROR_INTERNAL_MODULE_KEY_LENGTH_BELOW_MINIMUM",
		message: "key too short (minimum = 3 characters)",
		category: "internal-module",
	}, {
		key: "ERROR_INTERNAL_MODULE_KEY_INVALID",
		message: "invalid key",
		category: "internal-module",
	}, {
		key: "ERROR_INTERNAL_MODULE_DUPLICATE_KEY",
		message: "duplicate key",
		category: "internal-module",
	}, {
		key: "ERROR_MODULE_INVALID_CONSTRUCTOR",
		message: "Passed invalid module (not instance of TwitchChatBotModule)",
		category: "module",
	}, {
		key: "ERROR_MODULE_CURRENCY_REQUIREMENT_FAILED",
		message: "module cannot load because it requires the currency system, which is not available",
		category: "module",
	}, {
		key: "ERROR_DB_INVALID",
		message: "Invalid Database Module",
		category: "database",
	}, {
		key: "ERROR_EVENT_REGISTER_BAD_INFO",
		message: "bad info passed to .registerEvent()",
		category: "events",
	},
];

const warningCodes = [
	{
		key: "ERROR_EVENT_REGISTER_DUPLICATE",
		message: "duplicate event sent to .registerEvent()",
		category: "events",
	}, {
		key: "ERROR_EVENT_ON_BAD_INFO",
		message: "bad info passed to .on()",
		category: "events",
	}, {
		key: "ERROR_EVENT_ON_INVALID_EVENT",
		message: "invalid event passed to .on()",
		category: "events",
	}, {
		key: "ERROR_EVENT_OFF_BAD_INFO",
		message: "bad info passed to .off()",
		category: "events",
	}, {
		key: "ERROR_EVENT_OFF_INVALID_EVENT",
		message: "bad event passed to .off()",
		category: "events",
	}, {
		key: "ERROR_EVENT_OFF_BAD_HANDLER",
		message: "bad handler passed to .off()",
		category: "events",
	}, {
		key: "ERROR_EVENT_FIRE_BAD_INFO",
		message: "bad info passed to .fireEvent()",
		category: "events",
	}, {
		key: "ERROR_EVENT_FIRE_BAD_HANDLER",
		message: "non-function passed to .fireEvent()",
		category: "events",
	}, {
		key: "ERROR_EVENT_FIRE_INVALID_EVENT",
		message: "invalid event passed to .fireEvent()",
		category: "events",
	}, {
		key: "ERROR_GLOBALS_REGISTER_INVALID_INFO",
		message: "invalid info passed to .registerGlobal()",
		category: "globals",
	}, {
		key: "ERROR_GLOBALS_REGISTER_INVALID_KEY",
		message: "invalid key passed to .registerGlobal()",
		category: "globals",
	}, {
		key: "ERROR_GLOBALS_REGISTER_INVALID_HANDLER",
		message: "invalid handler passed to .registerGlobal()",
		category: "globals",
	}, {
		key: "ERROR_GLOBALS_REGISTER_DUPLICATE",
		message: "duplicate global passed to .registerGlobal()",
		category: "globals",
	}, {
		key: "ERROR_GLOBALS_GET_INVALID_KEY",
		message: "invalid key passed to .getGlobal()",
		category: "globals",
	}, {
		key: "ERROR_GLOBALS_GET_UNKNOWN_KEY",
		message: "invalid key passed to .getGlobal()",
		category: "globals",
	},
];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

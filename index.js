/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const TwitchChatBot = require("./lib/twitch-chat-bot.js");
const TwitchChatBotModule = require("./lib/twitch-chat-bot-module.js");

const errorCodes = require("./data/error-codes.js");
const eventPriority = require("./data/event-priority.js");
const moderation = require("./data/moderation.js");
const time = require("./data/time.js");

const functions = require("./lib/functions.js");


module.exports = {
	TwitchChatBot: TwitchChatBot,
	TwitchChatBotModule: TwitchChatBotModule,

	errorCodes: errorCodes,
	eventPriority: eventPriority,
	moderation: moderation,
	time: time,

	functions: functions,
};

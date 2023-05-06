/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	EVENT_PRIORITY_DEFAULT,
} = require("../data/event-priority.js");


class TwitchChatBotModule
{
	id = null;

	valid = false;

	requiresCurrencySystem = false;

	bot = null;
	client = null;
	errorHandler = null;
	polyglot = null;

	permissions = null;
	commandCenter = null;

	dictionary = null;
	db = null;
	userTracker = null;
	timer = null;
	options = null;
	blockedList = null;
	debugMode = null;

	/**
	 * load the module up with internals; validate; and run any initialization code
	 */
	constructor(b, priority, debugMode)
	{
		this.bot = b;
		this.client = this.bot.client;
		this.errorHandler = this.bot.errorHandler;
		this.polyglot = this.bot.polyglot;

		this.permissions = this.bot.permissions;
		this.commandCenter = this.bot.commandCenter;

		this.dictionary = this.bot.dictionary;
		this.db = this.bot.db;
		this.userTracker = this.bot.userTracker;
		this.timer = this.bot.timer;
		this.options = this.bot.options;
		this.blockedList = this.bot.blockedList;
		this.debugMode = debugMode === true;

		if (this.requiresCurrencySystem === true &&
			this.bot.hasCurrencySystem !== true) {
			this.errorHandler.throwError("ERROR_MODULE_CURRENCY_REQUIREMENT_FAILED", this.id);

			return;
		}

		this.valid = true;

		if (typeof this.install === "function") {
			this.install();
		}

		if (typeof this.init === "function") {
			b.on("ready", this.init.bind(this), priority || EVENT_PRIORITY_DEFAULT);
		}
	}
}


module.exports = TwitchChatBotModule;

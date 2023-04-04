/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	EVENT_PRIORITY_LOW, EVENT_PRIORITY_DEFAULT, EVENT_PRIORITY_HIGH, EVENT_PRIORITY_EXTERNAL_MODULE_MAX,
} = require("../data/event-priority.js");


class TwitchChatBotModule
{
	id = null;

	valid = false;
	installable = false;
	installed = false;

	requiresCurrencySystem = false;

	bot = null;
	client = null;

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
		if (this.requiresCurrencySystem === true &&
			this.hasCurrencySystem !== true) {
			this.error(`Module "${this.id}" cannot load because it requires the currency system, but it is not available.`);

			return;
		}

		this.bot = b;
		this.client = this.bot.client;

		this.permissions = this.bot.permissions;
		this.commandCenter = this.bot.commandCenter;

		this.dictionary = this.bot.dictionary;
		this.db = this.bot.db;
		this.userTracker = this.bot.userTracker;
		this.timer = this.bot.timer;
		this.options = this.bot.options;
		this.blockedList = this.bot.blockedList;
		this.debugMode = debugMode === true;

		this.valid = true;

		this.installable = typeof this.install === "function" && typeof this.isInstalled === "function";

		if (this.installable === true) {
			this.install();
		}

		if (typeof this.init === "function") {
			b.on("ready", this.init.bind(this), priority || EVENT_PRIORITY_DEFAULT);
		}
	}
}


module.exports = TwitchChatBotModule;

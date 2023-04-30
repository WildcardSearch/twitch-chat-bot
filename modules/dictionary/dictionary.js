/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	arnd,
} = require("../../lib/functions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");

const {
	errorCategories, errorCodes, warningCodes,
} = require("./error-codes.js");


class Dictionary_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "dictionary";

	/**
	 * install module elements
	 *
	 * @return void
	 */
	install()
	{
		this.errorHandler.registerCategories(errorCategories);
		this.errorHandler.registerWarnings(warningCodes);
		this.errorHandler.registerCodes(errorCodes);
	}

	/**
	 * @return void
	 */
	init()
	{
		this.data = {};
	}

	/**
	 * fetch items from the dictionary
	 *
	 * @param  String
	 * @param  Boolean
	 * @return void
	 */
	get(id, all)
	{
		if (typeof this.data[id] !== "object") {
			return false;
		}

		if (all === true) {
			return this.data[id];
		}

		return arnd(this.data[id]);
	}

	/**
	 * fetch all items from an entry in the dictionary
	 *
	 * @param  String
	 * @return void
	 */
	getAll(id)
	{
		return this.get(id, true);
	}

	/**
	 * add items to the dictionary
	 *
	 * @param  String
	 * @return void
	 */
	add(data)
	{
		if (typeof data !== "object") {
			this.errorHandler.warn("ERROR_DICTIONARY_ADD_ENTRIES_BAD_INFO");

			return false;
		}

		this.data = { ...this.data, ...data };
	}
}


module.exports = Dictionary_TwitchChatBotModule;

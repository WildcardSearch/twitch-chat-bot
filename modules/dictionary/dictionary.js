/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	arnd,
} = require("../../lib/functions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class Dictionary_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "dictionary";

	/**
	 * @return void
	 */
	init()
	{
		this._d = {};
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
		if (typeof this._d[id] !== "object") {
			return false;
		}

		if (all === true) {
			return this._d[id];
		}

		return arnd(this._d[id]);
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
			return false;
		}

		this._d = { ...this._d, ...data };
	}
}


module.exports = Dictionary_TwitchChatBotModule;

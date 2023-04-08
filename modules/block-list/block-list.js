/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class BlockList_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "block-list";

	/**
	 * initialize the block list
	 *
	 * @return void
	 */
	init()
	{
		this.blocked = [];

		if (typeof this.options.blocking === "object" &&
			typeof this.options.blocking.blocked === "object" &&
			Array.isArray(this.options.blocking.blocked) === true) {
			this.blocked = this.options.blocking.blocked;
		}

		// bots
		if (typeof this.options.blocking !== "object" ||
			typeof this.options.blocking.blockBots !== "boolean" ||
			this.options.blocking.blockBots !== false) {
			this.blocked.push(...[
				"streamelements",
				"streamlabs",
				"nightbot",
			]);
		}

		// streamer
		if (typeof this.options.blocking !== "object" ||
			typeof this.options.blocking.blockStreamer === "undefined" ||
			this.options.blocking.blockStreamer !== false) {
			this.blocked.push(this.bot.channel);
		}

		// our bot
		this.blocked.push(this.bot.username);
	}

	/**
	 * getter for checking block list
	 *
	 * @param  String
	 * @param  Array
	 * @return Boolean
	 */
	isBlocked(user, exclude)
	{
		if (typeof user !== "string" ||
			user.length === 0) {
			console.log({ m: "bad info", user: user, exclude: exclude });

			return false;
		}

		if (Array.isArray(exclude) === true &&
			exclude.length > 0) {
			let cleanExcludeList = [];

			for (const [i, v] of Object.entries(exclude)) {
				if (typeof v !== "string" ||
					v.length === 0) {
					continue;
				}

				cleanExcludeList.push(v.toLowerCase());
			};

			if (cleanExcludeList.length > 0) {
				return this.blocked.concat(cleanExcludeList).includes(user.toLowerCase());
			}
		}

		return this.blocked.includes(user.toLowerCase());
	}
}


module.exports = BlockList_TwitchChatBotModule;

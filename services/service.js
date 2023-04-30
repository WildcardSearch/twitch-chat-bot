/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


class TwitchChatBotService {
	id = null;
	integrationId = null;

	valid = false;

	bot = null;
	errorHandler = null;
	options = null;

	/**
	 * @param  TwitchChatBot
	 * @return void
	 */
	constructor(b)
	{
		this.bot = b;
		this.errorHandler = this.bot.errorHandler;
		this.options = this.bot.options;
	}
}


module.exports = TwitchChatBotService;

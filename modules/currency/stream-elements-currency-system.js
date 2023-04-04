/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const CurrencySystem_TwitchChatBotModule = require("./base-currency-system.js");

const StreamElements = require('node-streamelements');


const SE_ERROR_USER_NOT_FOUND = 1;


class StreamElements_CurrencySystem extends CurrencySystem_TwitchChatBotModule {
	bot = null;
	_se = null;

	/**
	 * @param  TwitchChatBotModule
	 * @param  StreamElements
	 * @return void
	 */
	constructor(b, se)
	{
		super(b);

		this._se = se;
	}

	/**
	 * add chips to a user
	 *
	 * @param  String
	 * @param  String
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	addPoints(user, amount, onSuccess, onFail)
	{
		this._se.addUserPoints(user, parseInt(amount, 10))
		.then((response) => {
			console.log({ response: response });

			if (typeof onSuccess === "function") {
				onSuccess(response, { success: true });
			}
		})
		.catch((error) => {
			let errorCode = 0;

			console.log(`Error adding chips: ${error}`);

			if (error === "Not Found") {
				console.log(`"${user}" does not exist`);

				errorCode = SE_ERROR_USER_NOT_FOUND;
			} else {
				this.bot.sendMessage(`!editpoints ${user} ${amount}`);
			}

			if (typeof onFail === "function") {
				onFail(null, { error: error, errorCode: errorCode, success: false });
			}
		});
	}

	/**
	 * remove chips from a user
	 *
	 * @param  String
	 * @param  String
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	subtractPoints(user, amount, onSuccess, onFail)
	{
		this._se.removeUserPoints(user, parseInt(amount, 10))
		.then((response) => {
			console.log({ response: response });

			if (typeof onSuccess === "function") {
				onSuccess(response);
			}
		})
		.catch((error) => {
			console.log({ error: error });
			this.bot.sendMessage(`!editpoints ${user} -${amount}`);

			if (typeof onFail === "function") {
				onFail(error);
			}
		});
	}

	/**
	 * shortcut for StreamElements.getUserPoints
	 *
	 * @param  String
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	getPoints(username, onSuccess, onFail)
	{
		this._se.getUserPoints(username)
		.then((response) => {
			console.log({ response: response });

			onSuccess(response);
		})
		.catch((error) => {
			console.log({ error: error });

			onFail(error);
		});
	}

	/**
	 * shortcut for StreamElements.addUserPoints
	 *
	 * @param  String
	 * @param  Number
	 * @return void
	 */
	addUserPoints(user, amount)
	{
		return this._se.addUserPoints(user, amount);
	}

	/**
	 * shortcut for StreamElements.removeUserPoints
	 *
	 * @param  String
	 * @return void
	 */
	removeUserPoints(username, amount)
	{
		return this._se.removeUserPoints(username, amount);
	}
}


module.exports = StreamElements_CurrencySystem;

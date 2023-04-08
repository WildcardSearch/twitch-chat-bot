/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	ERROR_CURRENCY_NO_SYSTEM,
} = require("../../data/error-codes.js");


class CurrencySystem_TwitchChatBotModule {
	valid = false;

	/**
	 * @param  TwitchChatBot
	 * @return void
	 */
	constructor(b)
	{
		this.bot = b;

		if (typeof this.addPoints !== "function" ||
			typeof this.subtractPoints !== "function" ||
			typeof this.getPoints !== "function") {
			this.bot.error(ERROR_CURRENCY_NO_SYSTEM);

			return;
		}

		this.valid = true;
	}

	/**
	 * add loyalty points to a user's account
	 *
	 * @param  String
	 * @param  Number
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	add(user, amount, onSuccess, onFail)
	{
		if (typeof onSuccess !== "function") {
			onSuccess = ()=>{};
		}

		if (typeof onFail !== "function") {
			onFail = ()=>{};
		}

		if (typeof user !== "string" ||
			user.length === 0) {
			this.bot.error(ERROR_CURRENCY_ADD_BAD_INFO_NO_USERNAME);

			onFail();

			return;
		}

		if (typeof amount === "string") {
			amount =  parseInt(amount, 10);
		}

		if (typeof amount !== "number" ||
			amount <= 0) {
			this.bot.error(ERROR_CURRENCY_ADD_BAD_INFO_BAD_AMOUNT);

			onFail();

			return;
		}

		this.addPoints(user, amount, onSuccess, onFail);
	}

	/**
	 * subtract loyalty points from a user's account
	 *
	 * @param  String
	 * @param  Number
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	subtract(user, amount, onSuccess, onFail)
	{
		if (typeof onSuccess !== "function") {
			onSuccess = ()=>{};
		}

		if (typeof onFail !== "function") {
			onFail = ()=>{};
		}

		if (typeof user !== "string" ||
			user.length === 0) {
			this.bot.error(ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME);

			onFail();

			return;
		}

		if (typeof amount === "string") {
			amount =  parseInt(amount, 10);
		}

		if (typeof amount !== "number" ||
			amount <= 0) {
			this.bot.error(ERROR_CURRENCY_SUBTRACT_BAD_INFO_BAD_AMOUNT);

			onFail();

			return;
		}

		this.subtractPoints(user, amount);
	}

	/**
	 * add loyalty points to a user's account
	 *
	 * @param  String
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	get(user, onSuccess, onFail)
	{
		if (typeof onSuccess !== "function") {
			onSuccess = ()=>{};
		}

		if (typeof onFail !== "function") {
			onFail = ()=>{};
		}

		if (typeof user !== "string" ||
			user.length === 0) {
			this.bot.error(ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME);

			onFail();

			return;
		}

		this.getPoints(user, onSuccess, onFail);
	}
}

module.exports = CurrencySystem_TwitchChatBotModule;

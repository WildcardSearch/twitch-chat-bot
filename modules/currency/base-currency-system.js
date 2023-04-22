/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	errorCategories, errorCodes, warningCodes,
} = require("./error-codes.js");


class CurrencySystem_TwitchChatBotModule {
	valid = false;

	bot = null;
	errorHandler = null;

	/**
	 * @param  TwitchChatBot
	 * @return void
	 */
	constructor(b)
	{
		this.bot = b;
		this.errorHandler = this.bot.errorHandler;

		this.errorHandler.registerCategories(errorCategories);
		this.errorHandler.registerWarnings(warningCodes);
		this.errorHandler.registerCodes(errorCodes);

		if (typeof this.addPoints !== "function" ||
			typeof this.subtractPoints !== "function" ||
			typeof this.getPoints !== "function") {
			this.errorHandler.warn("ERROR_CURRENCY_NO_SYSTEM");

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
			this.errorHandler.warn("ERROR_CURRENCY_ADD_BAD_INFO_NO_USERNAME");

			onFail();

			return;
		}

		if (typeof amount === "string") {
			amount =  parseInt(amount, 10);
		}

		if (typeof amount !== "number" ||
			amount <= 0) {
			this.errorHandler.warn("ERROR_CURRENCY_ADD_BAD_INFO_BAD_AMOUNT");

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
			this.errorHandler.warn("ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME");

			onFail();

			return;
		}

		if (typeof amount === "string") {
			amount =  parseInt(amount, 10);
		}

		if (typeof amount !== "number" ||
			amount <= 0) {
			this.errorHandler.warn("ERROR_CURRENCY_SUBTRACT_BAD_INFO_BAD_AMOUNT");

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
			this.errorHandler.warn("ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME");

			onFail();

			return;
		}

		this.getPoints(user, onSuccess, onFail);
	}
}

module.exports = CurrencySystem_TwitchChatBotModule;

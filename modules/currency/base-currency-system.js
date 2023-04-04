/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	ERROR_INVALID_CREDENTIALS,

	ERROR_CONSTRUCTOR_NO_BOT_CREDENTIALS, ERROR_CONSTRUCTOR_NO_USERNAME, ERROR_CONSTRUCTOR_NO_OAUTH,
	ERROR_CONSTRUCTOR_NO_CHANNELS,

	ERROR_EVENT_ON_BAD_INFO, ERROR_EVENT_ON_INVALID_EVENT, ERROR_EVENT_REGISTER_BAD_INFO, ERROR_EVENT_REGISTER_DUPLICATE, ERROR_EVENT_OFF_BAD_INFO, ERROR_EVENT_OFF_INVALID_EVENT,
	ERROR_EVENT_FIRE_BAD_INFO, ERROR_EVENT_FIRE_INVALID_EVENT,

	ERROR_MODULE_INVALID_CONSTRUCTOR, ERROR_INTERNAL_MODULE_NO_KEY, ERROR_INTERNAL_MODULE_KEY_LENGTH_BELOW_MINIMUM,
	ERROR_INTERNAL_MODULE_KEY_INVALID, ERROR_EXTERNAL_MODULE_INVALID, ERROR_INTERNAL_MODULE_DUPLICATE_KEY,

	ERROR_DB_INVALID, ERROR_DB_MYSQL_CONNECT_FAIL, ERROR_DB_MYSQL_INSTALL_TABLE_FAIL,
	ERROR_DB_MYSQL_READ_DATA_FAIL, ERROR_DB_MYSQL_INSERT_DATA_FAIL, ERROR_DB_MYSQL_READ_ID_FAIL,
	ERROR_DB_MYSQL_READ_TABLES_FAIL, ERROR_DB_MYSQL_STORE_TABLES_FAIL, ERROR_DB_MYSQL_STORE_FIELDS_FAIL,
	ERROR_DB_MYSQL_READ_FIELDS_FAIL, ERROR_DB_MYSQL_INSTALL_FIELD_FAIL,

	ERROR_CURRENCY_NO_SYSTEM,

	errorMessages,
} = require("../../data/error-codes.js");


class CurrencySystem_TwitchChatBotModule {
	id = "";
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

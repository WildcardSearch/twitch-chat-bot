/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */

const CATEGORY_KEY_MIN_LENGTH = 2;
const CATEGORY_SPACING = 100000;

const {
	errorCategories, errorCodes, warningCodes,
} = require("../../data/error-codes.js");


class TwitchChatBotErrorHandler
{
	id = "error-handler";

	/**
	 * initialize and register base error codes
	 */
	constructor(b)
	{
		this.bot = b;

		this.categoryList = [];
		this.categories = {};
		this.categoryKeyMap = {};

		this.nextCategoryId = CATEGORY_SPACING;
		this.lastCategoryId = null;

		this.warningCodeList = [];
		this.warningCodes = {};
		this.warningCodeMap = {};

		this.errorCodeList = [];
		this.errorCodes = {};
		this.errorCodeMap = {};

		this.registerCategories(errorCategories);
		this.registerWarnings(warningCodes);
		this.registerCodes(errorCodes);
	}

	/**
	 * register an error category
	 *
	 * @param  Object
	 * @return Number|Boolean
	 */
	registerCategory(category)
	{
		let id = this.nextCategoryId;

		if (typeof category !== "object" ||
			category === null ||
			typeof category.key !== "string" ||
			category.key.length < CATEGORY_KEY_MIN_LENGTH ||
			typeof category.title !== "string" ||
			category.title.length === 0) {
			return false;
		}

		this.categoryList.push(id);
		this.categories[id] = {
			id: id,
			title: category.title,
			nextWarningId: id+1,
			nextErrorId: id+1001,
		};
		this.categoryKeyMap[category.key] = id;

		this.lastCategoryId = id;
		this.nextCategoryId += CATEGORY_SPACING;

		return id;
	}

	/**
	 * register an Array of error categories
	 *
	 * @param  Array
	 * @return void
	 */
	registerCategories(categories)
	{
		if (typeof categories !== "object" ||
			Array.isArray(categories) !== true ||
			categories.length === 0) {
			return;
		}

		for (const category of categories) {
			this.registerCategory(category);
		}
	}

	/**
	 * register a warning
	 *
	 * @param  Object
	 * @return Number|Boolean
	 */
	registerWarning(warning)
	{
		let id, key, category = "general", categoryId;

		if (typeof warning !== "object" ||
			warning === null ||
			typeof warning.key !== "string" ||
			warning.key.length === 0 ||
			typeof warning.message !== "string" ||
			warning.message.length === 0) {
			this.bot.log("Register Error Code: failed w/bad info", arguments);

			return false;
		}

		if (typeof warning.category !== "string" ||
			warning.category.length === 0 ||
			typeof this.categoryKeyMap[warning.category] !== "number" ||
			this.categoryList.includes(this.categoryKeyMap[warning.category]) !== true) {
			this.bot.log("Register Warning Code: failed w/bad category key", arguments);

			return false;
		}

		category = this.categories[this.categoryKeyMap[warning.category]];
		categoryId = category.id;
		id = this.categories[categoryId].nextWarningId++;
		key = warning.key.trim().toUpperCase();

		this.warningCodeList.push(id);
		this.warningCodeMap[key] = id;
		this.warningCodes[id] = {
			key: key,
			message: warning.message.trim() || `Error: ${id}`,
			category: category.id,
		};

		return id;
	}

	/**
	 * register an Array of warnings
	 *
	 * @param  Array
	 * @return void
	 */
	registerWarnings(warnings)
	{
		if (typeof warnings !== "object" ||
			Array.isArray(warnings) !== true ||
			warnings.length === 0) {
			return;
		}

		for (const warning of warnings) {
			this.registerWarning(warning);
		}
	}

	/**
	 * register an error
	 *
	 * @param  Object
	 * @return Number|Boolean
	 */
	registerCode(error)
	{
		let id, key, category = "general", categoryId;

		if (typeof error !== "object" ||
			error === null ||
			typeof error.key !== "string" ||
			error.key.length === 0 ||
			typeof error.message !== "string" ||
			error.message.length === 0) {
			this.bot.log("Register Error Code: failed w/bad info", arguments);

			return false;
		}

		if (typeof error.category !== "string" ||
			error.category.length === 0 ||
			typeof this.categoryKeyMap[error.category] !== "number" ||
			this.categoryList.includes(this.categoryKeyMap[error.category]) !== true) {
			this.bot.log("Register Error Code: failed w/bad category key", arguments);

			return false;
		}

		category = this.categories[this.categoryKeyMap[error.category]];
		categoryId = category.id;
		id = this.categories[categoryId].nextErrorId++;
		key = error.key.trim().toUpperCase();

		this.errorCodeList.push(id);
		this.errorCodeMap[key] = id;
		this.errorCodes[id] = {
			key: key,
			message: error.message.trim() || `Error: ${id}`,
			category: category.id,
		};

		return id;
	}

	/**
	 * register an Array of errors
	 *
	 * @param  Array
	 * @return void
	 */
	registerCodes(errors)
	{
		if (typeof errors !== "object" ||
			Array.isArray(errors) !== true ||
			errors.length === 0) {
			return;
		}

		for (const error of errors) {
			this.registerCode(error);
		}
	}


	/**
	 * issue a warning
	 *
	 * @param  String
	 * @return Boolean
	 */
	warn(key)
	{
		if (typeof key !== "string" ||
			key.length === 0 ||
			typeof this.warningCodeMap[key] !== "number") {
			return false;
		}

		let id = this.warningCodeMap[key];

		if (typeof this.warningCodes[id] !== "object" ||
			this.warningCodes[id] === null ||
			typeof this.warningCodes[id].message !== "string" ||
			this.warningCodes[id].message.length === 0 ||
			typeof this.warningCodes[id].category !== "number" ||
			this.warningCodes[id].category <= 0) {
			return false;
		}

		let warning = this.warningCodes[id];
		let category = this.categories[this.warningCodes[id].category];

		if (arguments.length > 1) {
			let args = Array.prototype.slice.call(arguments);
			args.shift();
			this.bot.log(args);
		}

		this.bot.log(`${category.title} Error ${id}: ${warning.message}`);
	}

	/**
	 * throw an error
	 *
	 * @param  String
	 * @return Boolean|void
	 */
	throwError(key)
	{
		let message = "the error that was thrown had no message content",
			categoryId = CATEGORY_SPACING;

		if (typeof key !== "string" ||
			key.length === 0 ||
			typeof this.errorCodeMap[key] !== "number") {
			throw new Error(`A fatal error was thrown with missing error key. key: ${key || typeof key}`);
		}

		let id = this.errorCodeMap[key];

		if (typeof this.errorCodes[id] !== "object" ||
			this.errorCodes[id] === null) {
			throw new Error(`A fatal error was thrown with a key that doesn't match any existing error codes. key: ${key || typeof key}`);

			return;
		}

		if (typeof this.errorCodes[id].message === "string" &&
			this.errorCodes[id].message.length > 0) {
			message = this.errorCodes[id].message;
		}

		if (typeof this.errorCodes[id].category === "number" &&
			this.errorCodes[id].category >= CATEGORY_SPACING) {
			categoryId = this.errorCodes[id].category;
		}

		let error = this.errorCodes[id];
		let category = this.categories[categoryId];

		if (arguments.length > 1) {
			let args = Array.prototype.slice.call(arguments);
			args.shift();
			this.bot.log(args);
		}

		throw new Error(`${id} — ${category.title} "${message}"`);
	}
}


module.exports = TwitchChatBotErrorHandler;

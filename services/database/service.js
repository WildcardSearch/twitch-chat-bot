/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */

const TwitchChatBotService = require("../service.js");


class TwitchChatBotDatabaseService extends
	TwitchChatBotService {

	id = "database";

	/**
	 * @param  TwitchChatBotModule
	 * @param  Function
	 * @return void
	 */
	constructor(b, onConnect)
	{
		super(b);

		this.fields = {};
		this.fieldList = [];

		this.credentials = null;

		if (typeof onConnect !== "function") {
			onConnect = ()=>{};
		}

		this.onConnect = onConnect;

		if (typeof this.init !== "function" ||
			typeof this.insertStreamRecord !== "function" ||
			typeof this.updateStreamInfo !== "function" ||
			typeof this.connect !== "function") {
			return;
		}

		this.valid = true;

		this.connect();
	}

	/**
	 * getter for this.valid
	 *
	 * @return void
	 */
	isValid()
	{
		return this.valid === true;
	}

	/**
	 * register a database field
	 *
	 * @param  Object
	 * @return void
	 */
	registerField(f)
	{
		if (Array.isArray(f) !== true) {
			f = [ f ];
		}

		for (const field of f) {
			if (typeof field !== "object" ||
				typeof field.key !== "string" ||
				field.key.length === 0 ||
				typeof field.type !== "string" ||
				field.type.length === 0 ||
				this.fieldList.includes(field.key)) {
				continue;
			}

			if (typeof field.initial === "undefined") {
				field.initial = "NULL";
			}

			this.fields[field.key] = field;
			this.fieldList.push(field.key);

			if (typeof this.installField === "function") {
				this.installField(field);
			}
		}
	}
}


module.exports = TwitchChatBotDatabaseService;

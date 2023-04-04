/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const fs = require('fs');

const {
	readFile, writeFile, copyObject,
} = require("../../lib/functions.js");

const DB_Base_TwitchChatBotModule = require("./db-base.js");


const ID_LOWEST_VALUE = 100;


class DB_JSON_TwitchChatBotModule extends DB_Base_TwitchChatBotModule
{
	id = "JSON";
	valid = false;

	/**
	 * connect to the db
	 *
	 * @param  TwitchChatBotModule
	 * @return void
	 */
	connect()
	{
		if (typeof this.options.database !== "object" ||
			typeof this.options.database.path !== "string" ||
			this.options.database.path.length === 0) {
			return;
		}

		this.path = this.options.database.path;
		this.db = null;

		this.loadDb();

		this.bot.log(`Connected to JSON database @ ${this.path}`);
		this.valid = true;

		this.onConnect();
	}

	/**
	 * initialize the db; grab the last stream; and call the TwitchChatBotModule ready event
	 *
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	init(onSuccess, onFail)
	{
		var n = Date.now() - this.options.newStreamMaxDelay;

		if (typeof onSuccess !== "function") {
			onSuccess = () => {};
		}

		if (typeof onFail !== "function") {
			onFail = () => {};
		}

		let latestStream = this.getCurrentStream();

		if (latestStream === null) {
			this.bot.log("new stream");

			this.insertStreamRecord(onSuccess, onFail);

			return;
		}

		this.bot.log("recovering from crash");
		this.bot.log(latestStream);

		this.bot.streamId = latestStream.id;
		this.bot.streamData = latestStream;

		onSuccess();
	}

	/**
	 * fetch the last (if any) stream record that was updated within the grace period for a crash (def: DELAY_CRASH_MAX)
	 *
	 * @return void
	 */
	getCurrentStream()
	{
		let n = Date.now() - this.options.newStreamMaxDelay;

		if (this.db.info.lastStreamId === null ||
			typeof this.db.data.streams[this.db.info.lastStreamId] !== "object" ||
			this.db.data.streams[this.db.info.lastStreamId].lastlive <= n) {
			return null;
		}

		return this.db.data.streams[this.db.info.lastStreamId];
	}

	/**
	 * start a fresh stream record
	 *
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	insertStreamRecord(onSuccess, onFail)
	{
		let id = this.getNextId(),
			data = {
				id: id,
				timestamp: Date.now(),
			};

		this.db.data.streams[id] = data;

		this.db.data.streamIds.push(id);

		this.bot.streamId = this.db.info.lastStreamId = id;
		this.bot.streamData = data;

		this.storeDb();

		this.bot.log(data);

		onSuccess();
	}

	/**
	 * store information from internal/external modules
	 *
	 * @param  Object
	 * @return void
	 */
	updateStreamInfo(fields)
	{
		this.db.data.streams[this.bot.streamId] = { ...this.db.data.streams[this.bot.streamId], ...fields };

		this.storeDb();
	}

	/**
	 * load the db
	 *
	 * @return void
	 */
	loadDb()
	{
		if (!fs.existsSync(this.path)) {
			this.wipeDb();
			this.storeDb();

			return;
		}

		let content = readFile(this.path);

		if (typeof content !== "string" ||
			content.trim().length === 0) {
			this.wipeDb();
			this.storeDb();

			return;
		}

		this.db = JSON.parse(content);
	}

	/**
	 * clear the db
	 *
	 * @return void
	 */
	wipeDb()
	{
		this.db = {
			info: {
				lastStreamId: null,
			},
			data: {
				streams: {},
				streamIds: [],
			},
		};
	}

	/**
	 * save the db
	 *
	 * @return void
	 */
	storeDb()
	{
		writeFile(this.path, JSON.stringify(this.db));
	}

	/**
	 * yield the first available ID
	 *
	 * @return void
	 */
	getNextId()
	{
		if (this.db.info.lastStreamId === null) {
			return this.db.info.lastStreamId = ID_LOWEST_VALUE;
		}

		return ++this.db.info.lastStreamId;
	}

	/**
	 * getter for field installation (always true for JSON)
	 *
	 * @param  Object
	 * @return void
	 */
	fieldExists(field)
	{
		return true;
	}
}


module.exports = DB_JSON_TwitchChatBotModule;

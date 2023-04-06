/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	arnd,
} = require("../../lib/functions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class UserTracker_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "user-tracker";

	install()
	{
		this.db.registerField([{
			key: "chatters",
			type: "json",
		}, {
			key: "activeChatters",
			type: "json",
		}, {
			key: "inactiveChatters",
			type: "json",
		}]);
	}

	isInstalled()
	{
		if (this.db.fieldExists("chatters") !== true ||
			this.db.fieldExists("activeChatters") !== true ||
			this.db.fieldExists("inactiveChatters") !== true) {
			return false;
		}

		return true;
	}

	/**
	 * setup; get stream data; add commands; attach bot events; check users active status
	 *
	 * @param  Object
	 * @return void
	 */
	init()
	{
		this.chatters = {};
		this.activeChatters = {};
		this.inactiveChatters = {};

		if (typeof this.bot.streamData === "object" &&
			typeof this.bot.streamData.chatters === "object") {
			this.chatters = this.bot.streamData.chatters.chatters || {};
			this.activeChatters = this.bot.streamData.chatters.activeChatters || {};
			this.inactiveChatters = this.bot.streamData.chatters.inactiveChatters || {};
		}

		this.commandCenter.addCommand([{
			key: "listchatters",
			description: "Get a list of all the people that have chatted in the current stream.",
			permissionLevel: this.permissions.permMap["PERMISSIONS_MODS"],
			parser: this.parseCommand.bind(this),
		}, {
			key: "listactives",
			description: "Get a list of all the people that are currently chatting in this stream.",
			permissionLevel: this.permissions.permMap["PERMISSIONS_MODS"],
			parser: this.parseCommand.bind(this),
		}, {
			key: "listinactives",
			description: "Get a list of all the people that were chatting in the stream earlier, but have gone quiet.",
			permissionLevel: this.permissions.permMap["PERMISSIONS_MODS"],
			parser: this.parseCommand.bind(this),
		}]);

		this.bot.on("chat", this.log.bind(this));

		this.checkUserStatus();
	}

	/**
	 * prune active list of inactive users
	 *
	 * @return void
	 */
	checkUserStatus()
	{
		let newActives = {};

		for (const key of Object.keys(this.activeChatters)) {
			var user = this.activeChatters[key];

			if (user.lastMessage > (Date.now()-this.options.userTracker.activeStatusTimeout)) {
				newActives[key] = user;
			}
		}

		this.activeChatters = newActives;

		setTimeout(this.checkUserStatus.bind(this), this.options.userTracker.activeStatusCheckDelay);
	}

	/**
	 * log a chatter
	 *
	 * @param  String
	 * @return void
	 */
	log(channel, userstate, message, self)
	{
		const username = userstate["display-name"],
			user = {
				username: username,
				lastMessage: Date.now(),
			};

		let name = "",
			d = "";

		if (typeof username == "undefined" ||
			username.length <= 0 ||
			this.blockedList.isBlocked(username)) {
			return;
		}

		name = username.toLowerCase();

		if (typeof this.chatters[name] === "undefined" ||
			typeof this.chatters[name].firstMessage === "undefined") {
			user.firstMessage = Date.now();
		} else {
			user.firstMessage = this.chatters[name].firstMessage;
		}

		this.chatters[name] = user;
		this.activeChatters[name] = user;

		d = {
			chatters: this.chatters,
			activeChatters: this.activeChatters,
			inactiveChatters: this.inactiveChatters,
		};

		this.db.updateStreamInfo({
			chatters: d,
			timestamp: Date.now(),
		});
	}

	/**
	 * get all chatters
	 *
	 * @return void
	 */
	getChatters()
	{
		return this.chatters;
	}

	/**
	 * get active chatters
	 *
	 * @return void
	 */
	getActiveChatters()
	{
		return this.activeChatters;
	}

	/**
	 * get inactive chatters
	 *
	 * @return void
	 */
	getInactiveChatters()
	{
		let inactives = {};

		switch (this.chatters.length) {
		case this.activeChatters.length:
			return false;
		case 0:
			this.bot.sendMessage("Ain't nobody here!");
			return false;
		}

		for (const key of Object.keys(this.chatters)) {
			let user = this.chatters[key];

			if (this.activeChatters.includes(key) === false) {
				inactives[key] = user;
			}
		}

		return this.inactiveChatters = inactives;
	}

	/**
	 * get a random chatter
	 *
	 * @param  Array
	 * @return void
	 */
	getRandomChatter(exclude)
	{
		let users = Object.keys(this.chatters);

		if (typeof exclude === "object" &&
			exclude.length > 0) {
			users = users.filter(n => exclude.includes(n) === false);
		}

		switch (users.length) {
		case 0:
			return false;
		case 1:
			return this.chatters[users[0]];
		}

		return this.chatters[arnd(users)];
	}

	/**
	 * get a random chatter that has been active recently
	 *
	 * @param  Array
	 * @return void
	 */
	getRandomActiveChatter(exclude)
	{
		let users = Object.keys(this.activeChatters);

		if (typeof exclude === "object" &&
			exclude.length > 0) {
			users = users.filter(n => exclude.includes(n) === false);
		}

		switch (users.length) {
		case 0:
			return false;
		case 1:
			return this.activeChatters[users[0]];
		}

		return this.activeChatters[arnd(users)];
	}

	/**
	 * get the number of chatters
	 *
	 * @return void
	 */
	getChatterCount()
	{
		return Object.keys(this.chatters).length;
	}

	/**
	 * get the number of active chatters
	 *
	 * @return void
	 */
	getActiveChatterCount()
	{
		return Object.keys(this.activeChatters).length;
	}

	/**
	 * get the number of inactive chatters
	 *
	 * @return void
	 */
	getInactiveChatterCount()
	{
		return Object.keys(this.inactiveChatters).length;
	}

	/**
	 * determine if a user is active
	 *
	 * @param  String
	 * @return void
	 */
	isActive(user)
	{
		if (typeof user !== "string" ||
			user.length === 0) {
			return null;
		}

		return user.toLowerCase() === this.bot.username.toLowerCase() || Object.keys(this.activeChatters).includes(user.toLowerCase()) === true;
	}

	/**
	 * get the time of a user's first message
	 *
	 * @param  String
	 * @return void
	 */
	getUserFirstMessageTime(username)
	{
		const name = username.toLowerCase();

		if (typeof this.chatters[name] === "undefined" ||
			typeof this.chatters[name].firstMessage === "undefined") {
			return false;
		} else {
			return this.chatters[name].firstMessage;
		}
	}

	/**
	 * route the command to the proper method
	 *
	 * @param  Object
	 * @return void
	 */
	parseCommand(options)
	{
		let o;

		switch(options.cleanCommand) {
			case "listinactives":
				o = false;
				break;
			case "listactives":
				o = true;
				break;
		}

		this.listChatters(o);
	}

	/**
	 * !listchatters | !listactives | !listinactives
	 *
	 * @param  Boolean
	 * @return void
	 */
	listChatters(active)
	{
		let userObject, userCount, description,
			sep = "", userList = "";

		switch (true) {
		case active === true:
			userObject = this.getActiveChatters();
			userCount = this.getActiveChatterCount();
			description = "active";
			break;
		case active === false:
			userObject = this.getInactiveChatters();
			userCount = this.getInactiveChatterCount();
			description = "inactive";
			break;
		default:
			userObject = this.getChatters();
			userCount = this.getChatterCount();
			description = "total";
		}

		if (userCount <= 0) {
			this.bot.sendMessage("Ain't nobody here!");
			return;
		}

		userList = `There are ${userCount} ${description} chatters: `;
		Object.keys(userObject).forEach(user => {
			userList += `${sep}${user}`;
			sep = ", ";
		});

		this.bot.sendMessage(userList);
	}
}


module.exports = UserTracker_TwitchChatBotModule;

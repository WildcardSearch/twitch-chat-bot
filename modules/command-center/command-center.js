/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");

const {
	errorCategories, errorCodes, warningCodes,
} = require("./error-codes.js");

const {
	BOT_MOD_PERMISSION_ACT,
} = require("../../data/moderation.js");

const {
	milliseconds, seconds, minutes,
	hours, days, weeks,
	months, years, decades, centuries,
} = require("../../data/time.js");


class CommandCenter_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "command-center";

	/**
	 * install module elements
	 *
	 * @return void
	 */
	install()
	{
		this.errorHandler.registerCategories(errorCategories);
		this.errorHandler.registerWarnings(warningCodes);
		this.errorHandler.registerCodes(errorCodes);

		this.polyglot.extend(require(`../../locales/${this.bot.locale}/command-center.json`));
	}

	/**
	 * set up module; register globals; and add commands
	 *
	 * @return void
	 */
	init()
	{
		this.commands = {};

		this.commandList = [];
		this.disabledCommands = [];

		this.shortcutList = [];
		this.shortcutMap = {};

		this.aliasList = [];
		this.aliasMap = {};

		this.activity = {};
		this.blockedUsers = [];
		this.blockInfo = {};

		this.bot.registerGlobal({
			key: "commands",
			get: this.getAllCommands.bind(this)
		});
		this.bot.registerGlobal({
			key: "commandList",
			get: this.getCommandList.bind(this)
		});

		this.addCommand([{
			key: "enable",
			description: this.polyglot.t("command_center.command_enable.description"),
			inputRequired: true,
			inputErrorMessage: this.polyglot.t("command_center.command_enable.input_error_message"),
			permissionLevel: this.permissions.permMap["PERMISSIONS_STREAMER"],
			parser: this.parseEnableCommand.bind(this),
		}, {
			key: "disable",
			description: this.polyglot.t("command_center.command_disable.description"),
			inputRequired: true,
			inputErrorMessage: this.polyglot.t("command_center.command_disable.input_error_message"),
			permissionLevel: this.permissions.permMap["PERMISSIONS_STREAMER"],
			parser: this.parseDisableCommand.bind(this),
		}]);

		this.bot.on("chat", this.onChat.bind(this));
	}

	/**
	 * parser: !disable
	 *
	 * @param  Object
	 * @return void
	 */
	parseDisableCommand(options)
	{
		let commandAliases,
			cleanParameter1 = options.msgPieces[1].toLowerCase();

		if (options.msgPieces[1].indexOf("!") === 0) {
			cleanParameter1 = cleanParameter1.slice(1);
		}

		if (this.disabledCommands.includes(cleanParameter1) === true) {
			this.bot.sendMessage(this.polyglot.t("command_center.command_already_disabled", {
				"command_name": cleanParameter1,
			}));

			return;
		}

		if (this.aliasList.includes(cleanParameter1) === true) {
			commandAliases = [].concat(this.aliasMap[cleanParameter1]);
			commandAliases.push(cleanParameter1);
			this.disabledCommands = this.disabledCommands.concat(commandAliases);
		} else {
			this.disabledCommands.push(cleanParameter1);
		}

		this.bot.sendMessage(this.polyglot.t("command_center.command_disabled", {
			command_name: cleanParameter1,
		}));
	}

	/**
	 * parser: !enable
	 *
	 * @param  Object
	 * @return void
	 */
	parseEnableCommand(options)
	{
		let commandAliases,
			cleanParameter1 = options.msgPieces[1].toLowerCase();

		if (options.msgPieces[1].indexOf("!") === 0) {
			cleanParameter1 = cleanParameter1.slice(1);
		}

		if (this.disabledCommands.includes(cleanParameter1) === false) {
			this.bot.sendMessage(this.polyglot.t("command_center.command_not_disabled", {
				"command_name": cleanParameter1,
			}));

			return;
		}

		if (this.aliasList.includes(cleanParameter1) === true) {
			commandAliases = [].concat(this.aliasMap[cleanParameter1]);
			commandAliases.push(cleanParameter1);

			for (const a of commandAliases) {
				const pos = this.disabledCommands.indexOf(a.toLowerCase())

				this.disabledCommands.splice(pos, 1);
			}

			return;
		}

		this.disabledCommands.splice(this.disabledCommands.indexOf(cleanParameter1.toLowerCase()), 1);

		this.bot.sendMessage(this.polyglot.t("command_center.command_enabled", {
			command_name: cleanParameter1,
		}));
	}

	/**
	 * getter for this.commands
	 *
	 * @return Object
	 */
	getAllCommands()
	{
		return this.commands;
	}

	/**
	 * getter for this.commandList
	 *
	 * @return Array
	 */
	getCommandList()
	{
		return this.commandList;
	}

	/**
	 * add a new chat command
	 *
	 * @param  Object
	 * @return Array
	 */
	addCommand(command)
	{
		if (typeof command === "undefined") {
			this.errorHandler.warn(
				"ERROR_COMMAND_CENTER_ADD_COMMAND_BAD_INFO",
				arguments
			);

			return false;
		}

		if (Array.isArray(command) !== true) {
			command = [ command ];
		}

		for (const c of command) {
			if (c.disabled === true) {
				continue;
			}

			if (typeof c === "undefined" ||
				c.length === 0) {
				this.errorHandler.warn(
					"ERROR_COMMAND_CENTER_ADD_COMMAND_BAD_INFO",
					arguments
				);

				continue;
			}

			if (typeof c.parser !== "function" &&
				(typeof c.textOutput !== "string" || c.textOutput.length === 0)) {
				this.errorHandler.warn("ERROR_COMMAND_CENTER_ADD_COMMAND_NO_OUTPUT_METHOD");

				continue;
			}

			let k = c.key;

			if (this.commandList.includes(k) === true) {
				this.errorHandler.warn("ERROR_COMMAND_CENTER_ADD_COMMAND_DUPLICATE_COMMAND");

				continue;
			}

			// store command
			this.commands[k] = c;
			this.commandList.push(k);

			this.bot.log(`Command Center: added "!${k}" @ "${this.permissions.permLevelMap[c.permissionLevel || 0]}"`);

			// aliases
			if (typeof c.aliases !== "undefined" &&
				c.aliases.length > 0) {
				for (const alias of c.aliases) {
					if (this.aliasList.includes(alias) === true) {
						this.errorHandler.warn(
							"ERROR_COMMAND_CENTER_ADD_COMMAND_DUPLICATE_COMMAND_ALIAS",
							`Alias: ${alias || "undefined"}`
						);

						continue;
					}

					this.aliasList.push(alias);
					this.aliasMap[alias] = k;
				};
			}

			// shortcuts
			if (typeof c.shortcuts !== "undefined" &&
				c.shortcuts.length > 0) {
				for (const sc of c.shortcuts) {
					if (this.shortcutList.includes(sc) === true) {
						this.errorHandler.warn(
							"ERROR_COMMAND_CENTER_ADD_COMMAND_DUPLICATE_COMMAND_SHORTCUT",
							`Shortcut: ${sc || "undefined"}`
						);

						continue;
					}

					this.shortcutList.push(sc.key);
					this.shortcutMap[sc.key] = sc.fullCommand;
				};
			}
		}
	}

	/**
	 * parse command; apply shortcuts/aliases; check permissions;
	 * check cooldowns; record user activity; output text only, or run commands
	 * and return their output
	 *
	 * @param  Object
	 * @param  String
	 * @return void|Boolean
	 */
	parseCommand(userstate, message)
	{
		let cleanCommand, msgPieces,
			permitted = false,
			userPermissionLevel = this.permissions.permMap["PERMISSIONS_ALL"];

		/* parameter checks */

		if (typeof userstate === "undefined") {
			this.errorHandler.warn("ERROR_COMMAND_CENTER_PARSE_COMMAND_BAD_INFO");

			return false;
		}

		const lcSender = userstate["display-name"].toLowerCase();

		/* initialize activity slot for user, if necessary */
		if (typeof this.activity[lcSender] !== "object") {
			this.activity[lcSender] = {};
		}

		if (typeof this.activity[lcSender].commands !== "object") {
			this.activity[lcSender].commands = {};
		}

		if (typeof this.activity[lcSender].warnings !== "number") {
			this.activity[lcSender].warnings = 0;
		}

		if (typeof this.bot.userTracker === "undefined" ||
			typeof this.bot.userTracker.getRandomChatter === "undefined" ||
			typeof this.bot.userTracker.getRandomActiveChatter === "undefined") {
			this.errorHandler.throwError("ERROR_COMMAND_CENTER_PARSE_COMMAND_USERTRACKER_MISSING");

			return false;
		}

		if (typeof message === "undefined" ||
			message.length === 0) {
			this.errorHandler.warn("ERROR_COMMAND_CENTER_PARSE_COMMAND_BLANK_MESSAGE");

			return false;
		}

		msgPieces = message.split(" ");

		if (msgPieces.length === 0 ||
			typeof msgPieces[0] !== "string" ||
			msgPieces[0].length === 0) {
			this.errorHandler.warn("ERROR_COMMAND_CENTER_PARSE_COMMAND_BLANK_MESSAGE");

			return false;
		}


		/* command building; aliases & shortcut parsing */

		cleanCommand = msgPieces[0].trim().toLowerCase();

		// with a shortcut, we know there are no parameters, so just assign the replacement
		if (this.shortcutList.includes(cleanCommand) === true) {
			message = this.shortcutMap[cleanCommand];
			msgPieces = message.split(" ");
			cleanCommand = msgPieces[0].trim().toLowerCase();
		}

		// with an alias, we have to do some string splicing
		if (this.aliasList.includes(cleanCommand) === true) {
			message = this.aliasMap[cleanCommand]+message.slice(cleanCommand.length);
			msgPieces = message.split(" ");
			cleanCommand = msgPieces[0].trim().toLowerCase();
		}


		/* invalid command name? */

		if (typeof this.commandList === "undefined" ||
			this.commandList.includes(cleanCommand) === false) {
			this.bot.log(`Invalid command passed: ${cleanCommand}`);

			return false;
		}


		/* disabled command? */

		if (this.disabledCommands.includes(cleanCommand) === true) {
			this.bot.log(`blocked ${lcSender} from using "!${cleanCommand}"`);
			this.bot.sendMessage(this.polyglot.t("command_currently_enabled", {
				"command_name": cleanCommand,
			}));

			return;
		}

		/* required input missing? */

		if (this.commands[cleanCommand].inputRequired === true &&
			(typeof msgPieces[1] === "undefined" ||
			msgPieces[1].length === 0)) {
			this.bot.sendMessage(this.polyglot.t("input_required_message", {
				usage: this.commands[cleanCommand].inputErrorMessage || this.polyglot.t("input_required"),
			}));

			return false;
		}


		/* build info object */

		const options = {
			userstate: userstate,
			sender: userstate["display-name"],
			lcSender: lcSender,

			vip: userstate.vip === true,
			subscriber: userstate.subscriber === true,
			mod: userstate.mod === true,

			message: message,
			msgPieces: msgPieces,
			cleanCommand: cleanCommand,

			rUser: this.bot.userTracker.getRandomChatter(this.blockedList.blocked.concat(lcSender)),
			raUser: this.bot.userTracker.getRandomActiveChatter(this.blockedList.blocked.concat(lcSender)),
		};


		/* permissions check */

		userPermissionLevel = this.permissions.getUserPermissionLevel(options);

		if (typeof this.commands[cleanCommand].permissionLevel === "number" &&
			this.commands[cleanCommand].permissionLevel > this.permissions.permMap["PERMISSIONS_ALL"]) {
			if (this.commands[cleanCommand].exclusivePermission === true &&
				userPermissionLevel < this.permissions.permMap["PERMISSIONS_MODS"] &&
				userPermissionLevel !== this.commands[cleanCommand].permissionLevel) {
				permitted = false;
			} else {
				permitted = this.permissions.checkPermissions(cleanCommand, options);
			}

			if (permitted !== true) {
				this.bot.log(`Permission denied: ${lcSender} -> "${message}"`);

				return;
			}
		}

		/* cooldown violation? */

		if (userPermissionLevel < this.options.moderation.cooldownExemptionLevel) {
			if (typeof this.activity[lcSender].lastCommandTime === "number" &&
				(Date.now()-this.activity[lcSender].lastCommandTime) < this.options.moderation.globalCooldown) {
				this.cooldownWarning(userstate["display-name"], cleanCommand, this.polyglot.t("moderation.user_blocked", {
					"username": userstate["display-name"],
				}));

				return;
			}

			if (typeof this.commands[cleanCommand].cooldown === "number" &&
				this.commands[cleanCommand].cooldown > 0 &&
				(Date.now()-this.activity[lcSender].commands[cleanCommand]) < this.commands[cleanCommand].cooldown) {
				this.bot.log(`Passive Block: ${userstate["display-name"]} -> ${cleanCommand}`);

				return;
			}
		}

		/* blocked chatter? */

		if (this.blockedUsers.includes(lcSender)) {
			if ((Date.now()-this.blockInfo[lcSender].timestamp) > this.blockInfo[lcSender].duration*seconds) {
				this.blockedUsers.splice(this.blockedUsers.indexOf(lcSender), 1);
				delete this.blockInfo[lcSender];

				this.bot.log(`cooldown violation expires: ${lcSender}`);
			} else {
				this.cooldownWarning(userstate["display-name"], cleanCommand, this.polyglot.t("moderation.user_blocked", {
					"username": userstate["display-name"],
				}));

				this.bot.log(`Blocked ${userstate["display-name"]} from using "!${cleanCommand}" for cooldown violation`);

				return;
			}
		}


		/* all checks clear: log & proceed */

		this.activity[lcSender].lastCommandTime = Date.now();
		this.activity[lcSender].commands[cleanCommand] = Date.now();

		if (typeof this.commands[cleanCommand].textOutput === "string" &&
			this.commands[cleanCommand].textOutput.length > 0) {
			this.bot.sendMessage(this.commands[cleanCommand].textOutput);

			return;
		}

		if (typeof this.commands[cleanCommand].parser === "function") {
			return this.commands[cleanCommand].parser(options);
		}

		/* no output method */

		this.errorHandler.warn("ERROR_COMMAND_CENTER_PARSE_COMMAND_NO_OUTPUT_METHOD");
	}

	/**
	 * warn a user for cooldown violation
	 *
	 * @param  Object
	 * @param  String
	 * @param  String
	 * @return void
	 */
	cooldownWarning(user, cleanCommand, message)
	{
		this.activity[user.toLowerCase()].lastCommandTime = Date.now();
		this.activity[user.toLowerCase()].commands[cleanCommand] = Date.now();
		this.activity[user.toLowerCase()].warnings++;

		this.bot.log(`USER WARNING: ${user}`);
		this.bot.log(this.activity[user.toLowerCase()]);

		this.determineCorrectiveAction(user, message)
	}

	/**
	 * determine how harsh the user's punishment will be
	 *
	 * @param  Object
	 * @param  String
	 * @return void
	 */
	determineCorrectiveAction(user, message)
	{
		if (this.activity[user.toLowerCase()].warnings >= this.options.moderation.warningsTillBlock) {
			this.blockUser(user);

			return;
		}

		if (this.activity[user.toLowerCase()].warnings >= this.options.moderation.warningsTillTimeout) {
			this.recommendTimeout(user);

			return;
		}

		if (this.activity[user.toLowerCase()].warnings >= this.options.moderation.warningsTillBan) {
			this.recommendBan(user);

			return;
		}

		this.bot.sendMessage(message);
	}

	/**
	 * block a user from using chat commands
	 *
	 * @param  String
	 * @return void
	 */
	blockUser(user)
	{
		if (this.blockedUsers.includes(user.toLowerCase()) === true) {
			this.recommendTimeout(user);

			return;
		}

		let d = this.getBlockDuration(user);

		if (d === false ||
			d === null) {
			return;
		}

		this.blockedUsers.push(user.toLowerCase());
		this.blockInfo[user.toLowerCase()] = {
			timestamp: Date.now(),
			duration: d,
		};

		this.bot.sendMessage(this.polyglot.t("moderation.user_blocked_for", {
			username: user,
			seconds: d,
		}));
	}

	/**
	 * timeout a viewer OR advise the mods to do so
	 *
	 * @param  String
	 * @return void
	 */
	recommendTimeout(user)
	{
		let d = this.getTimeoutDuration(user),
			reason = this.polyglot.t("moderation.timeout_reason_generic");

		if (d === false) {
			return false;
		}

		if (this.options.moderation.permissions === BOT_MOD_PERMISSION_ACT) {
			this.bot.sendMessage(`/timeout ${user} ${d} ${reason}`);

			return;
		}

		let timeoutLength = this.polyglot.t("moderation.timeout_length", d);

		this.bot.sendMessage(this.polyglot.t("moderation.timeout_recommendation", {
			username: user,
			timeout_length: timeoutLength,
		}));
	}

	/**
	 * ban a viewer OR advise the mods to do so
	 *
	 * @param  String
	 * @return void
	 */
	recommendBan(user)
	{
		let reason = this.polyglot.t("moderation.ban_reason_generic");

		if (this.activity[user.toLowerCase()].banWarning === true) {
			this.bot.log(`multiple ban warnings: ${user}`);

			return;
		}

		if (this.options.moderation.permissions === BOT_MOD_PERMISSION_ACT) {
			this.bot.sendMessage(`/ban ${user} ${reason}`);

			return;
		}

		this.bot.sendMessage(this.polyglot.t("moderation.ban_recommendation", {
			username: user,
			reason: reason,
		}));

		this.activity[user.toLowerCase()].banWarning = true;
	}

	/**
	 * use settings to determine how long a block should last
	 *
	 * @param  String
	 * @return Number|Boolean
	 */
	getBlockDuration(user)
	{
		if (typeof this.activity[user.toLowerCase()] !== "object" ||
			typeof this.activity[user.toLowerCase()].warnings !== "number" ||
			this.activity[user.toLowerCase()].warnings === 0) {
			return null;
		}

		let w = this.activity[user.toLowerCase()].warnings > 3 ? 3 : this.activity[user.toLowerCase()].warnings;
		let d = this.options.moderation.cooldownBlockMatrix[w];

		if (d === false) {
			this.recommendTimeout(user);

			return false;
		}

		return d;
	}

	/**
	 * use settings to determine how long a timeout should last
	 *
	 * @param  String
	 * @return Number|Boolean
	 */
	getTimeoutDuration(user)
	{
		if (typeof this.activity[user.toLowerCase()] !== "object" ||
			typeof this.activity[user.toLowerCase()].warnings !== "number" ||
			this.activity[user.toLowerCase()].warnings === 0) {
			return null;
		}

		let w = this.activity[user.toLowerCase()].warnings;

		if (w > this.options.moderation.warningsTillBan) {
			w = this.options.moderation.warningsTillBan
		}

		let d = this.options.moderation.cooldownTimeoutMatrix[w];

		if (d === false) {
			this.recommendBan(user);

			return false;
		}

		return d;
	}

	/**
	 * push a command through, directly
	 *
	 * @param  String
	 * @return void
	 */
	exec(commandString, user)
	{
		if (typeof user !== "object" ||
			user === null) {
			user = {
				"display-name": this.bot.displayName,
				subscriber: this.bot.isSubbed(),
				mod: true,
			};
		}

		return this.parseCommand(user, commandString);
	}

	/**
	 * if it begins with an !, then its our time to shine (tmi.js chat event)
	 *
	 * @param  String
	 * @param  Object
	 * @param  String
	 * @param  Boolean
	 * @return void
	 */
	onChat(channel, userstate, message, self)
	{
		if (message.length <= 1 ||
			message.slice(0, 1) !== "!") {
			return;
		}

		this.parseCommand(userstate, message.slice(1));
	}
}


module.exports = CommandCenter_TwitchChatBotModule;

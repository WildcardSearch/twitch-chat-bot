/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");

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

		this.bot.registerGlobal( { key: "commands", get: this.getAllCommands.bind(this) } );
		this.bot.registerGlobal( { key: "commandList", get: this.getCommandList.bind(this) } );

		this.addCommand([{
			key: "enable",
			description: "Enable a chat command.",
			inputRequired: true,
			inputErrorMessage: "!enable {command} eg. !enable hug",
			permissionLevel: this.permissions.permMap["PERMISSIONS_STREAMER"],
			parser: this.parseEnableCommand.bind(this),
		}, {
			key: "disable",
			description: "Disable a chat command.",
			inputRequired: true,
			inputErrorMessage: "!disable {command} eg. !disable hug",
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
			this.bot.sendMessage(`The ${cleanParameter1} command is already disabled.`);

			return;
		}

		if (this.aliasList.includes(cleanParameter1) === true) {
			commandAliases = [].concat(this.aliasMap[cleanParameter1]);
			commandAliases.push(cleanParameter1);
			this.disabledCommands = this.disabledCommands.concat(commandAliases);
		} else {
			this.disabledCommands.push(cleanParameter1);
		}

		this.bot.sendMessage(`The ${cleanParameter1} command is now disabled.`);
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
			this.bot.sendMessage(`The ${cleanParameter1} command is not currently disabled.`);

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

		this.bot.sendMessage(`The ${cleanParameter1} command is now enabled.`);
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
			console.log({ msg: "no command data", arguments });

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
				continue;
			}

			let k = c.key;

			if (this.commandList.includes(k) === true) {
				console.log(`commandCenter.addCommand() duplicate command "${k}"`);

				return;
			}

			this.commands[k] = c;
			this.commandList.push(k);

			this.bot.log(`Command Center: added "!${k}" @ "${this.permissions.permLevelMap[c.permissionLevel || 0]}"`);

			if (typeof c.aliases !== "undefined" &&
				c.aliases.length > 0) {
				for (const alias of c.aliases) {
					if (this.aliasList.includes(alias) === true) {
						console.log(`commandCenter.addCommand() duplicate alias "${alias}"`);

						continue;
					}

					this.aliasList.push(alias);
					this.aliasMap[alias] = k;
				};
			}

			if (typeof c.shortcuts !== "undefined" &&
				c.shortcuts.length > 0) {
				for (const sc of c.shortcuts) {
					if (this.shortcutList.includes(sc) === true) {
						console.log("commandCenter.addCommand() duplicate shortcut");

						continue;
					}

					this.shortcutList.push(sc.key);
					this.shortcutMap[sc.key] = sc.fullCommand;
				};
			}
		}
	}

	/**
	 * parse command; apply shortcuts/aliases; check permissions; output text only, or run commands
	 * and return their output
	 *
	 * @param  Object
	 * @param  String
	 * @return void|Boolean
	 */
	parseCommand(userstate, message)
	{
		let cleanCommand, msgPieces,
			permitted = false;

		/* parameter checks */

		if (typeof userstate === "undefined") {
			console.log("Function received no user info.");
			return false;
		}

		const lcSender = userstate["display-name"].toLowerCase();

		if (typeof this.bot.userTracker === "undefined" ||
			typeof this.bot.userTracker.getRandomChatter === "undefined" ||
			typeof this.bot.userTracker.getRandomActiveChatter === "undefined") {
			console.log("userTracker not loaded.");

			return false;
		}

		if (typeof message === "undefined" ||
			message.length === 0) {
			console.log("Function received blank message.");

			return false;
		}

		msgPieces = message.split(" ");

		if (msgPieces.length === 0 ||
			typeof msgPieces[0] !== "string" ||
			msgPieces[0].length === 0) {
			console.log("Message array was empty.");

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
			console.log(`Invalid command passed: ${cleanCommand}`);

			return false;
		}


		/* disabled command? */

		if (this.disabledCommands.includes(cleanCommand) === true) {
			console.log(`blocked ${lcSender} from using "!${cleanCommand}"`);
			this.bot.sendMessage(`The "${cleanCommand}" command is currently disabled.`);

			return;
		}


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


		/* cooldown violation? */

		if (lcSender !== this.bot.channel.toLowerCase() &&
			userstate.mod !== true &&
			userstate.vip !== true) {
			if (typeof this.activity[lcSender].lastCommandTime === "number" &&
				(Date.now()-this.activity[lcSender].lastCommandTime) < this.options.moderation.globalCooldown) {
				this.cooldownWarning(userstate["display-name"], cleanCommand, `${userstate["display-name"]}, you are using commands too quickly. Please slow down.`);

				return;
			}

			if (typeof this.commands[cleanCommand].cooldown === "number" &&
				this.commands[cleanCommand].cooldown > 0 &&
				(Date.now()-this.activity[lcSender].commands[cleanCommand]) < this.commands[cleanCommand].cooldown) {
				this.cooldownWarning(userstate["display-name"], cleanCommand, `${userstate["display-name"]}, you are using the !${cleanCommand} command too quickly. Please slow down.`);

				return;
			}
		}

		if (this.blockedUsers.includes(lcSender)) {
			if ((Date.now()-this.blockInfo[lcSender].timestamp) > this.blockInfo[lcSender].duration*seconds) {
				this.blockedUsers.splice(this.blockedUsers.indexOf(lcSender), 1);
				delete this.blockInfo[lcSender];

				console.log(`cooldown violation expires: ${lcSender}`);
			} else {
				this.cooldownWarning(userstate["display-name"], cleanCommand, `${userstate["display-name"]}, you are blocked from using commands for using commands too quickly. Please slow down.`);

				console.log(`Blocked ${userstate["display-name"]} from using "!${cleanCommand}" for cooldown violation`);

				return;
			}
		}


		/* required input missing? */

		if (this.commands[cleanCommand].inputRequired === true &&
			(typeof msgPieces[1] === "undefined" ||
			msgPieces[1].length === 0)) {
			this.bot.sendMessage("Usage: "+(this.commands[cleanCommand].inputErrorMessage || "Input required"));

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

		if (typeof this.commands[cleanCommand].permissionLevel === "number" &&
			this.commands[cleanCommand].permissionLevel > this.permissions.permMap["PERMISSIONS_ALL"]) {
			permitted = this.permissions.checkPermissions(cleanCommand, options);

			if (permitted !== true) {
				console.log(`Permission denied: ${lcSender} -> "${message}"`);

				return;
			}
		}


		/* all checks clear: log & proceed */

		this.activity[lcSender].lastCommandTime = Date.now();
		this.activity[lcSender].commands[cleanCommand] = Date.now();

		if (typeof this.commands[cleanCommand].textOutput !== "undefined" &&
			this.commands[cleanCommand].textOutput.length > 0) {
			this.bot.sendMessage(this.commands[cleanCommand].textOutput);

			return;
		}

		return this.commands[cleanCommand].parser(options);
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

		console.log(`USER WARNING: ${user}`);
		console.log(this.activity[user.toLowerCase()]);

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

		this.bot.sendMessage(`${user} you have been blocked from using commands for ${d} seconds for using commands too quickly. Please play nice.`);
	}

	/**
	 * timeout a viewer OR advise the mods to do so
	 *
	 * @param  String
	 * @return void
	 */
	recommendTimeout(user)
	{
		let d = this.getTimeoutDuration(user);

		if (d === false) {
			return false;
		}

		if (this.options.moderation.permissions === BOT_MOD_PERMISSION_ACT) {
			this.bot.sendMessage(`/timeout ${user} ${d} repeated rules violations`);

			return;
		}

		this.bot.sendMessage(`MODS: I recommend that ${user} is timed out for ${d} seconds`);
	}

	/**
	 * ban a viewer OR advise the mods to do so
	 *
	 * @param  String
	 * @return void
	 */
	recommendBan(user)
	{
		if (this.activity[user.toLowerCase()].banWarning === true) {
			console.log(`multiple ban warnings: ${user}`);

			return;
		}

		if (this.options.moderation.permissions === BOT_MOD_PERMISSION_ACT) {
			this.bot.sendMessage(`/ban ${user} repeated rules violations`);

			return;
		}

		this.bot.sendMessage(`MODS: I recommend that ${user} is banned for repeated violations of the rules.`);

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
	exec(commandString)
	{
		return this.parseCommand({
			"display-name": this.bot.displayName,
			subscriber: false,
			mod: true,
		}, commandString);
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

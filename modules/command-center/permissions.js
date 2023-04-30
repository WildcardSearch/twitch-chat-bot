/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	PERMISSIONS_ALL, PERMISSIONS_VIPS, PERMISSIONS_SUBS, PERMISSIONS_MODS, PERMISSIONS_STREAMER,
} = require("../../data/permissions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class Permissions_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "permissions";

	/**
	 * process all permission levels and then order them
	 *
	 * @return void
	 */
	init()
	{
		this.allPermissions = [{
				key: "PERMISSIONS_ALL",
				level: PERMISSIONS_ALL,
				description: "all users",
			}, {
				key: "PERMISSIONS_VIPS",
				level: PERMISSIONS_VIPS,
				description: "VIPs",
				test: (options) => {
					return options.vip === true;
				},
			}, {
				key: "PERMISSIONS_SUBS",
				level: PERMISSIONS_SUBS,
				description: "subscribers",
				test: (options) => {
					return options.subscriber === true;
				},
			}, {
				key: "PERMISSIONS_MODS",
				level: PERMISSIONS_MODS,
				description: "moderators",
				test: (options) => {
					return options.mod === true;
				},
			}, {
				key: "PERMISSIONS_STREAMER",
				level: PERMISSIONS_STREAMER,
				description: "broadcaster",
				test: (options) => {
					return options.lcSender === this.bot.channel;
				},
			},
		];

		if (Array.isArray(this.options.permissions) !== true) {
			this.options.permissions = [ this.options.permissions ];
		}

		for (const p of this.options.permissions) {
			if (typeof p !== "object" ||
				Object.keys(p).length === 0 ||
				typeof p.key !== "string" ||
				p.key.length === 0 ||
				typeof p.level !== "number" ||
				p.level <= PERMISSIONS_ALL ||
				p.level === PERMISSIONS_VIPS ||
				p.level === PERMISSIONS_SUBS ||
				p.level === PERMISSIONS_MODS ||
				p.level >= PERMISSIONS_STREAMER ||
				typeof p.test !== "function") {
				continue;
			}

			this.allPermissions.push(p);
		}

		this.orderPermissions();
	}

	/**
	 * order permission by level from least to greatest
	 *
	 * @return void
	 */
	orderPermissions()
	{
		let permLevelList = [],
			allPerms = {},

			perms = [],
			permKeys = [],
			permMap = {},
			permLevelMap = {},
			permLevelDescriptionMap = {};

		for (const p of this.allPermissions) {
			permLevelList.push(p.level);
			allPerms[p.level] = p;
		}

		permLevelList.sort((a, b) => a - b);

		for (const l of permLevelList) {
			let p = allPerms[l];

			perms.push(p);
			permKeys.push(p.key);
			permMap[p.key] = p.level;
			permLevelMap[p.level] = p.key;
			permLevelDescriptionMap[p.level] = p.description || "no description";
		}

		this.allPermissions = perms;
		this.permKeys = permKeys;
		this.permMap = permMap;
		this.permLevelMap = permLevelMap;
		this.permLevelDescriptionMap = permLevelDescriptionMap;
		this.permLevelList = permLevelList;
	}

	/**
	 * check that a user can use a particular command
	 *
	 * @param  Object
	 * @param  Object
	 * @return Boolean
	 */
	checkPermissions(cmd, options)
	{
		let commands = this.bot.getGlobal("commands");

		if (typeof commands[cmd] !== "object" ||
			commands[cmd] === null) {
			this.errorHandler.warn("ERROR_PERMISSIONS_CHECK_PERMISSIONS_NO_DATA", cmd, options);

			return;
		}

		let permissionLevel = commands[cmd].permissionLevel;

		if (typeof permissionLevel === "undefined" ||
			permissionLevel <= this.permMap["PERMISSIONS_ALL"]) {
			return true;
		}

		return this.getUserPermissionLevel(options) >= permissionLevel;
	}

	/**
	 * return a user's permission level
	 *
	 * @param  Object
	 * @return Number
	 */
	getUserPermissionLevel(options)
	{
		let permissionLevel = this.permMap["PERMISSIONS_ALL"];

		for (const p of this.allPermissions) {
			if (p.level === this.permMap["PERMISSIONS_ALL"]) {
				continue;
			}

			if (typeof p.test === "function" &&
				p.test(options) === true) {
				permissionLevel = p.level;
			}
		}

		return permissionLevel;
	}
}


module.exports = Permissions_TwitchChatBotModule;

/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	readFile, writeFile, copyObject,
} = require("../../lib/functions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class Documentation_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "docs";

	/**
	 * add our command and bounce
	 *
	 * @return void
	 */
	init()
	{
		this.path = this.bot.options.docs.path || "";

		this.commandCenter.addCommand({
			key: "helpfile",
			description: "Produce this document.",
			permissionLevel: this.permissions.permMap["PERMISSIONS_STREAMER"],
			parser: this.parseCommand.bind(this),
		});
	}

	/**
	 * compile documentation for every command in Markdown, separating the permission-required commands
	 *
	 * @param  Object
	 * @return void
	 */
	parseCommand(options)
	{
		let allCommands = {},
			output = {},
			commands = this.bot.getGlobal("commands"),
			commandList = copyObject(this.bot.getGlobal("commandList")).sort();


		// sort commands by permission level
		for (const c of commandList) {
			let cmd = commands[c],
				p = cmd.permissionLevel || this.permissions.permMap["PERMISSIONS_ALL"];

			if (typeof allCommands[p] === "undefined") {
				allCommands[p] = [];
			}

			allCommands[p].push(cmd);
		}

		// build the command description lists for each permission level
		for (const p of this.permissions.permLevelList) {
			if (typeof allCommands[p] === "undefined" ||
				Array.isArray(allCommands[p]) !== true) {
				allCommands[p] = [];

				continue;
			}

			output[p] = `**${this.bot.displayName}** (${this.bot.instanceVersion})\n*automatically generated command list*\n\n**${this.permissions.permLevelDescriptionMap[p].toUpperCase()}**`;

			// build the description for each command
			for (const thisCommand of allCommands[p]) {
				if (thisCommand.disabled === true) {
					continue;
				}

				let aliasPhrase = "Aliases",
					usageText = "",
					commandAliasList = "";

				if (typeof thisCommand.aliases !== "undefined" &&
					thisCommand.aliases.length > 0) {
					commandAliasList = "!"+thisCommand.aliases.join(", !");
					if (thisCommand.aliases.length === 1) {
						aliasPhrase = "Alias";
					}
				}

				if (typeof thisCommand.inputErrorMessage === "string" &&
					thisCommand.inputErrorMessage.length > 0) {
					usageText = `\n**Usage:** ${thisCommand.inputErrorMessage}`;
				}

				if (commandAliasList.length > 0) {
					commandAliasList = `\n**${aliasPhrase}:** ${commandAliasList}`;
				}

				output[p] += `\n\n\`!${thisCommand.key}\` — ${thisCommand.description}${commandAliasList}${usageText}`;
			}
		}

		// write a file for each permission level
		for (const p of this.permissions.permLevelList) {
			if (typeof output[p] !== "string" ||
				output[p].length === 0) {
				continue;
			}

			let filename = this.buildCleanFilename(this.permissions.permLevelDescriptionMap[p]);

			let path = `${this.path}${filename}-command-list.md`
			writeFile(path, output[p]);
		}

		this.bot.sendMessage("Help file(s) generated.");
	}

	/**
	 * remove any characters that woud make our file name look ugly
	 *
	 * @param  String
	 * @return void
	 */
	buildCleanFilename(name)
	{
		return (name || "")
			.replace(/[\?|\(|\)|_]/g, "-")	// replace symbols that are considered "word" characters with dashes
			.replace(/[^(?:\w)]/gi, "-")	// replace all other none-word characters with a dash
			.replace(/-{2,}/g, "-")			// replace any series of dashes with a single dash
			.replace(/^-/g, "")				// remove any dash from the beginning
			.replace(/-$/g, "");			// remove any dash from the end
	}
}


module.exports = Documentation_TwitchChatBotModule;

# twitch-chat-bot 0.4.1
*a highly customizable base Twitch chat bot to build on*

<p align="center">
  <a href="https://www.npmjs.com/package/twitch-chat-bot"><img alt="NPM Version" src="https://img.shields.io/npm/v/twitch-chat-bot?maxAge=43200"></a>
  <a href="https://www.npmjs.com/package/twitch-chat-bot"><img alt="npm downloads per month" src="https://img.shields.io/npm/dm/twitch-chat-bot?maxAge=43200"></a>
  <a href="https://www.npmjs.com/package/twitch-chat-bot"><img alt="NPM bundle size" src="https://img.shields.io/bundlephobia/min/twitch-chat-bot?maxAge=43200"></a>
  <a href="https://twitter.com/WildcardSearch"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/WildcardSearch?style=social&maxAge=43200"></a>
</p>

`npm install twitch-chat-bot`

```javascript
const {
	TwitchChatBot,
} = require("twitch-chat-bot");

function main()
{
	let myBot = new TwitchChatBot({
		credentials: {
			username: "bot_username",
			oauth: "oauth_string",
			channel: "twitch_channel",
		},
	});

	myBot.on("ready", ready);
}

function ready()
{
	this.sendMessage("is online", { action: true });
}

main();
```

See: [Getting Started](https://github.com/WildcardSearch/twitch-chat-bot/wiki#getting-started)

**Features:**

- Easy to get started.
- Many, many aspects of bot operation can be controlled at a very low level
- Event-driven operation allows a high level of customization
- i18n compliant (English & German translations available)

*Command Center*
- Add new chat commands by passing parameters
- Built-in, customizable chat cooldown with global and individual settings
- Commands are versatile and support aliases, shortcuts, plain text commands, and complex function-driven commands
- Commands can be added directly inside modules
- Built-in safe moderation helper
- Moderation helper can be customized to notify moderators of abuse (eg. spamming commands) or instructed to perform timeouts/bans without human approval
- Several commands built in to internal modules, pre-loaded
- Abilty to enable and disable any command programmatically, through chat commands, and manually, through the options object
- Override permissions for internal "default" commands

*Self-Documenting*
- Built-in `!helpfile` command that documents all commands, both internal and custom and produces documents for every permission level. Documents formatted for Discord Markdown.

*Block List*
- prevent users from accessing commands permanently
- prevent bots from cross-talking and/or participating in chat games

*Message Queue*
- Uses configurable limits for how quickly the bot can message chat.
- Manual override built-in to messaging system to allow exceptions.
- Messaging includes many configurable options include action messages, announcements, callbacks for after the message has beent sent, and skipping the message queue, entirely.

*Timer*
- Tracks live status of your stream, according to settings and/or chat commands.
- Fires an event that modules and direct code can monitor and react to.
- Supports custom events that are fired by the implementation, programmatically

*User Tracker*
- Tracks how often users send chat messages
- Tracks active/inactive users based on customizable cooldowns (last typed in chat)
- Provides a service to pick random users from either the active pool or all users that have participated in chat

*Loyalty Points/Chat Currency*
- Currently support StreamElements, to allow custom games to award loyalty points for chat activities, games, etc.
- Looking to add support for both StreamLabs and custom, internal currency systems

*Database*
- Built-in support for both MySQL and JSON file-based databases
- Tracks streams live status, detects and reacts to crashes and prevents the bot from "starting over" if timers are in use

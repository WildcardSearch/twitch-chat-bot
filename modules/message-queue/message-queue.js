/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class MessageQueue_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "message-queue";

	/**
	 * @return void
	 */
	init()
	{
		this.queue = [];

		this.lastMessageTime = null;

		this.running = false;
		this.waiting = false;

		this.stallOverride = false;

		this.bot.on("disconnect", this.onDisconnect.bind(this));
		this.bot.on("reconnect", this.onReconnect.bind(this));
	}

	/**
	 * stop the message queue when tmi.js disconnects
	 *
	 * @return void
	 */
	onDisconnect()
	{
		this.stallOverride = true;

		this.stop();
	}

	/**
	 * start the message queue once tmi.js reconnects
	 *
	 * @return void
	 */
	onReconnect()
	{
		this.stallOverride = false;

		this.start();
	}

	/**
	 * queue a message to be sent to chat
	 *
	 * @param  String
	 * @param  Object
	 * @return void
	 */
	queueMessage(text, options)
	{
		let o = {
				action: false,
				forceDebug: false,
				skipQueue: false,
				onSend: ()=>{},
				announcement: false,
				announcementColor: false,
			};

		o = { ...o, ...options };

		if (typeof text !== "string" ||
			text.length === 0) {
			this.bot.log( { err: "empty message sent to queue", text: text, options: options } );

			return;
		}

		const m = {
			text: text,
			action: o.action,
			onSend: typeof o.onSend === "function" ? o.onSend : ()=>{},
			announcement: o.announcement === true,
			announcementColor: o.announcementColor || false,
		};

		if (o.skipQueue !== true ||
			this.stallOverride === true) {
			this.add(m);

			return;
		}

		this.output(m);
	}

	/**
	 * send a message to Twitch chat
	 *
	 * @param  String
	 * @return Boolean
	 */
	output(message)
	{
		const announceCommand = "announce";

		let announceCommandExtra = "",
			msg = "";

		if (typeof message !== "object" ||
			typeof message.text !== "string" ||
			message.text.length <= 0) {
			return false;
		}

		msg = message.text;

		if (message.action === true) {
			this.client.action(this.bot.channel, message.text);
		} else {
			if (message.announcement === true) {
				if (typeof message.announcementColor !== "undefined" &&
					message.announcementColor !== false &&
					[ "blue", "green", "orange", "purple" ].includes(message.announcementColor.toLowerCase()) === true) {
					announceCommandExtra = message.announcementColor.toLowerCase();
				}

				msg = `/${announceCommand}${announceCommandExtra} ${msg}`;
			}

			this.client.say(this.bot.channel, msg);
		}

		return message.onSend();
	}

	/**
	 * add a message to the queue
	 *
	 * @param String
	 * return Void
	 */
	add(message)
	{
		this.queue.push(message);

		if (this.waiting || this.stallOverride === true) {
			return;
		}

		if (this.lastMessageTime !== null &&
			Date.now()-this.lastMessageTime < this.options.messaging.cooldown) {
			this.waiting = true;
			setTimeout(this.sendNext.bind(this), (this.options.messaging.cooldown-Date.now()-this.lastMessageTime));
			return;
		}

		if (!this.running) {
			this.start();
		}
	}

	/**
	 * begin working through the message queue
	 *
	 * return Void
	 */
	start()
	{
		if (this.running ||
			this.stallOverride === true ||
			this.queue.length == 0) {
			return;
		}

		this.running = true;

		this.sendNext();
	}

	/**
	 * stop working through the message queue
	 *
	 * return Void
	 */
	stop()
	{
		if (this.running !== true) {
			return;
		}

		this.running = false;
	}

	/**
	 * send the message
	 *
	 * return Void
	 */
	sendNext()
	{
		const message = this.queue.shift();

		if (typeof message !== "object" ||
			typeof message.text !== "string" ||
			message.text.length === 0) {
			console.log("Invalid message sent!");
		} else {
			this.output(message);
			this.lastMessageTime = Date.now();
			this.waiting = false;
		}

		if (this.queue.length > 0) {
			setTimeout(this.sendNext.bind(this), this.options.messaging.cooldown);
		} else {
			this.stop();
		}
	}
}


module.exports = MessageQueue_TwitchChatBotModule;

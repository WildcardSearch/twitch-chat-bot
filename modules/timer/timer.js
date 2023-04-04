/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	formatTimeStamp,
} = require("../../lib/functions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");


class StreamTimer_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "timer";

	install()
	{
		this.db.registerField([{
			key: "live",
			type: "boolean",
		}, {
			key: "livetime",
			type: "number",
		}, {
			key: "lastlive",
			type: "number",
		}]);
	}

	isInstalled()
	{
		if (this.db.fieldExists("live") !== true ||
			this.db.fieldExists("livetime") !== true ||
			this.db.fieldExists("lastlive") !== true) {
			return false;
		}

		return true;
	}

	/**
	 * setup; add commands; get stream info and calculate/retrieve live time; start the live timer if applicable
	 *
	 * @return void
	 */
	init()
	{
		this.live = false;
		this.liveTimeStamp = null;
		this.liveFunctions = [];
		this.liveTimer = null;

		const now = Date.now();

		this.bot.registerEvent("live", true);
		this.bot.isLive = this.isLive;

		this.commandCenter.addCommand([{
			key: "livetime",
			description: "Find out how long until the stream starts or how long it has been live.",
			aliases: [ "lt" ],
			parser: this.parseLiveTimeCommand.bind(this),
		}, {
			key: "golive",
			description: "Go live.",
			permissionLevel: this.permissions.permMap["PERMISSIONS_STREAMER"],
			parser: this.parseGoLiveCommand.bind(this),
		}]);

		if (typeof this.bot.streamData !== "object" ||
			typeof this.bot.streamData.livetime === "undefined" ||
			typeof this.bot.streamData.live === "undefined" ||
			this.bot.streamData.livetime === 0) {
			this.calculateLiveTime();

			return;
		}

		this.liveTimeStamp = this.bot.streamData.livetime;

		let msTillLive = this.liveTimeStamp-now;

		if (this.bot.streamData.live ||
			msTillLive <= 0) {
			this.isLive(true);

			return;
		}

		this.liveTimer = setTimeout(this.onLive.bind(this), msTillLive);
	}

	/**
	 * parser: !golive
	 *
	 * @param  Object
	 * @return void
	 */
	parseGoLiveCommand(options)
	{
		const now = Date.now();

		if (options.msgPieces.length === 1 ||
			typeof options.msgPieces[1] !== "string" ||
			options.msgPieces[1].length === 0) {
			this.isLive(true);

			return;
		}

		this.setLiveTimeStamp(options.msgPieces[1]);

		let msTillLive = this.liveTimeStamp-now;

		this.liveTimer = setTimeout(this.onLive.bind(this), msTillLive);

		this.db.updateStreamInfo({
			live: 0,
			livetime: this.liveTimeStamp,
		});

		this.parseLiveTimeCommand();
	}

	/**
	 * initialize the timer
	 *
	 * @return void
	 */
	calculateLiveTime()
	{
		const now = Date.now();

		if (this.options.timer.livetime === null) {
			console.log("cancelling live timer startup");

			return;
		}

		this.setLiveTimeStamp(this.options.timer.livetime);

		let msTillLive = this.liveTimeStamp-now;

		this.liveTimer = setTimeout(this.onLive.bind(this), msTillLive);

		this.db.updateStreamInfo({
			live: 0,
			livetime: this.liveTimeStamp,
		});
	}

	/**
	 * produce a live timestamp from provided options
	 *
	 * @param  String|Number
	 * @return void
	 */
	setLiveTimeStamp(lt = "top")
	{
		const
			rDate = new Date(),
			hrs = rDate.getHours();

		let mins = rDate.getMinutes();

		if (typeof lt === "string" &&
			isNaN(parseInt(lt, 10)) === false) {
			lt = parseInt(lt, 10);
		}

		switch(typeof lt) {
			case "string":
				switch(lt) {
					case "top":
						rDate.setHours(hrs+1);
						rDate.setMinutes(0);
						rDate.setSeconds(0);
						rDate.setMilliseconds(0);
						break;
					case "bottom":
						if (mins > 30) {
							rDate.setHours(hrs+1);
							rDate.setMinutes(30);
						} else {
							rDate.setMinutes(30);
						}

						rDate.setSeconds(0);
						rDate.setMilliseconds(0);
						break;
					case "nextquarter":
						if (mins > 45) {
							rDate.setHours(hrs+1);
							rDate.setMinutes(0);
						} else {
							if (mins > 30) {
								rDate.setMinutes(45);
							} else {
								if (mins > 15) {
									rDate.setMinutes(30);
								} else {
									rDate.setMinutes(15);
								}
							}
						}
						rDate.setSeconds(0);
						rDate.setMilliseconds(0);
						break;
				}

				break;
			case "number":
				let wait = parseInt(lt, 10),
					hoursToAdd = 0;

				// input is in minutes, so allow for large values
				while (wait > (60-mins)) {
					hoursToAdd++;

					wait -= (60-mins);
					mins = 0;
				}

				if (hoursToAdd > 0) {
					rDate.setHours(hrs+hoursToAdd);
				}

				if (wait > 0) {
					rDate.setMinutes(mins+wait);
				}

				break;
			default:
				this.bot.log({ error: "setLiveTimeStamp received bad info", arguments });

				return;
		}

		this.liveTimeStamp = rDate.getTime();
	}

	/**
	 * parser: !livetime
	 *
	 * @param  Object
	 * @return void
	 */
	parseLiveTimeCommand(options)
	{
		let timeDescription = "";

		if (this.live) {
			timeDescription = formatTimeStamp(Date.now()-this.liveTimeStamp);
			this.bot.sendMessage(`The stream has been live for ${timeDescription.description || "an unknown amount of time."}.`);

			return;
		}

		if (this.liveTimeStamp === null) {
			this.bot.sendMessage("No live time has been set...");

			return;
		}

		timeDescription = formatTimeStamp(this.liveTimeStamp-Date.now());
		this.bot.sendMessage(`The stream will go live in ${timeDescription.description}.`);
	}

	/**
	 * getter for live state
	 *
	 * @param  Boolean
	 * @return void
	 */
	isLive(state)
	{
		if (state === true) {
			this.clearLiveTimer();
			this.onLive();
		}

		return this.live;
	}

	/**
	 * go live
	 *
	 * @return void
	 */
	onLive()
	{
		this.live = true;

		this.db.updateStreamInfo({
			live: true,
			lastlive: Date.now(),
		});

		this.bot.fireEvent("live");

		this.bot.on("chat", () => {
			this.db.updateStreamInfo({
				lastlive: Date.now(),
			});
		});
	}

	/**
	 * return the time stamp of going live
	 *
	 * @return void
	 */
	getLiveTime()
	{
		return this.liveTimeStamp;
	}

	/**
	 * stop tracking the go live time
	 *
	 * @return void
	 */
	clearLiveTimer()
	{
		if (this.liveTimer === null) {
			return;
		}

		clearTimeout(this.liveTimer);
	}
}


module.exports = StreamTimer_TwitchChatBotModule;

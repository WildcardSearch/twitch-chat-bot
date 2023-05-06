/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	formatTimeStamp,
} = require("../../lib/functions.js");

const TwitchChatBotModule = require("../../lib/twitch-chat-bot-module.js");

const {
	errorCategories, errorCodes, warningCodes,
} = require("./error-codes.js");


class StreamTimer_TwitchChatBotModule extends TwitchChatBotModule
{
	id = "timer";

	/**
	 * register database fields &
	 * error codes
	 *
	 * @return void
	 */
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

		this.errorHandler.registerCategories(errorCategories);
		this.errorHandler.registerWarnings(warningCodes);
		this.errorHandler.registerCodes(errorCodes);

		this.polyglot.extend(require(`../../locales/${this.bot.locale}/timer.js`));
	}

	/**
	 * setup; add commands; get stream info and calculate/retrieve live time; start the live timer if applicable
	 *
	 * @return void
	 */
	init()
	{
		this.live = false;
		this.liveTimestamp = null;
		this.liveFunctions = [];
		this.liveTimer = null;

		const now = Date.now();

		this.bot.registerEvent("live-time-update");
		this.bot.registerEvent("live", true);
		this.bot.isLive = this.isLive;

		this.commandCenter.addCommand([{
			key: "livetime",
			description: this.polyglot.t("timer.commands.live_time.description"),
			aliases: [ "lt" ],
			parser: this.parseLiveTimeCommand.bind(this),
		}, {
			key: "golive",
			description: this.polyglot.t("timer.commands.go_live.description"),
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

		this.setLiveTimestamp(this.bot.streamData.livetime);

		let msTillLive = this.liveTimestamp-now;

		if (this.bot.streamData.live ||
			msTillLive <= 0) {
			this.forceLive();

			return;
		}

		this.liveTimer = setTimeout(this.goLive.bind(this), msTillLive);
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

		if (this.live === true) {
			this.bot.sendMessage(this.polyglot.t("timer.commands.go_live.stream_already_live"));

			return;
		}

		if (options.msgPieces.length === 1 ||
			typeof options.msgPieces[1] !== "string" ||
			options.msgPieces[1].length === 0) {
			this.forceLive();

			return;
		}

		this.setLiveTimeStampFromParams(options.msgPieces[1]);

		let msTillLive = this.liveTimestamp-now;

		this.liveTimer = setTimeout(this.goLive.bind(this), msTillLive);

		this.db.updateStreamInfo({
			live: 0,
			livetime: this.liveTimestamp,
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
			this.bot.log("cancelling live timer startup");

			return;
		}

		this.setLiveTimeStampFromParams(this.options.timer.livetime);

		let msTillLive = this.liveTimestamp-now;

		this.liveTimer = setTimeout(this.goLive.bind(this), msTillLive);

		this.db.updateStreamInfo({
			live: 0,
			livetime: this.liveTimestamp,
		});
	}

	/**
	 * set the propety and fire the event
	 *
	 * @param  String|Number
	 * @return void
	 */
	setLiveTimestamp(v)
	{
		this.liveTimestamp = v;

		this.bot.fireEvent("live-time-update");
	}

	/**
	 * produce a live timestamp from provided options
	 *
	 * @param  String|Number
	 * @return void
	 */
	setLiveTimeStampFromParams(lt = "top")
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
			this.errorHandler.warn("ERROR_TIMER_SET_LIVE_TS_BAD_INFO", arguments);

			return;
		}

		this.setLiveTimestamp(rDate.getTime());
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
			timeDescription = formatTimeStamp(Date.now() - this.liveTimestamp);
			this.bot.sendMessage(this.polyglot.t("timer.commands.live_time.stream_time_since_live", {
				"live_time_description": timeDescription.description || this.polyglot.t("timer.commands.live_time.unknown_amount_of_time"),
			}));

			return;
		}

		if (this.liveTimestamp === null) {
			this.bot.sendMessage(this.polyglot.t("timer.commands.live_time.no_live_time_set"));

			return;
		}

		timeDescription = formatTimeStamp(this.liveTimestamp-Date.now());
		this.bot.sendMessage(this.polyglot.t("timer.commands.live_time.stream_time_till_live", {
			"time_description": timeDescription.description || this.polyglot.t("timer.commands.live_time.unknown_amount_of_time"),
		}));
	}

	/**
	 * for crash recovery; force stream into live mode
	 *
	 * @param  Boolean
	 * @return void
	 */
	forceLive()
	{
		this.clearLiveTimer();
		this.goLive();
	}

	/**
	 * getter for live state
	 *
	 * @param  Boolean
	 * @return void
	 */
	isLive()
	{
		return this.live;
	}

	/**
	 * go live
	 *
	 * @return void
	 */
	goLive()
	{
		let data = {
			live: true,
			lastlive: Date.now(),
		};

		if (typeof this.bot.streamData.livetime === "undefined" ||
			isNaN(parseInt(this.bot.streamData.livetime, 10)) == true ||
			parseInt(this.bot.streamData.livetime, 10) <= 0) {
			this.liveTimestamp = data.livetime = Date.now();
		}

		this.live = true;

		this.db.updateStreamInfo(data);

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
		return this.liveTimestamp;
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

		this.liveTimer = null;
	}
}


module.exports = StreamTimer_TwitchChatBotModule;

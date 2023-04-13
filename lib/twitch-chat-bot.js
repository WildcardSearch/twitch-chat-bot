/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	ERROR_CONSTRUCTOR_NO_BOT_CREDENTIALS, ERROR_CONSTRUCTOR_NO_USERNAME, ERROR_CONSTRUCTOR_NO_OAUTH,
	ERROR_CONSTRUCTOR_NO_CHANNELS,

	ERROR_EVENT_ON_BAD_INFO, ERROR_EVENT_ON_INVALID_EVENT, ERROR_EVENT_REGISTER_BAD_INFO, ERROR_EVENT_REGISTER_DUPLICATE, ERROR_EVENT_OFF_BAD_INFO, ERROR_EVENT_OFF_INVALID_EVENT,
	ERROR_EVENT_FIRE_BAD_INFO, ERROR_EVENT_FIRE_INVALID_EVENT,

	ERROR_MODULE_INVALID_CONSTRUCTOR, ERROR_INTERNAL_MODULE_NO_KEY, ERROR_INTERNAL_MODULE_KEY_LENGTH_BELOW_MINIMUM,
	ERROR_INTERNAL_MODULE_KEY_INVALID, ERROR_EXTERNAL_MODULE_INVALID, ERROR_INTERNAL_MODULE_DUPLICATE_KEY,

	ERROR_DB_INVALID,

	errorMessages,
} = require("../data/error-codes.js");

const {
	EVENT_PRIORITY_DEFAULT, EVENT_PRIORITY_HIGH, EVENT_PRIORITY_EXTERNAL_MODULE_MAX,
} = require("../data/event-priority.js");

const {
	COOLDOWN_COMMAND_USAGE_GLOBAL,

	COOLDOWN_WARNINGS_TILL_BLOCK,
	COOLDOWN_WARNINGS_TILL_TIMEOUT,
	COOLDOWN_WARNINGS_TILL_BAN,

	COOLDOWN_BLOCK_MATRIX,
	COOLDOWN_TIMEOUT_MATRIX,

	BOT_MOD_PERMISSION_NOTIFY,
} = require("../data/moderation.js");

const {
	milliseconds, seconds, minutes,
	hours, days, weeks,
	months, years, decades, centuries,
} = require("../data/time.js");

const {
	checkSub,
} = require("./functions.js");


const CurrencySystem_TwitchChatBotModule = require("../modules/currency/base-currency-system.js");
const StreamElements_CurrencySystem = require("../modules/currency/stream-elements-currency-system.js");

const StreamElements = require('node-streamelements');
const tmi = require("tmi.js");


/* Default Values */

const TWITCH_USERNAME_MIN_LENGTH = 4;
const TWITCH_USERNAME_MAX_LENGTH = 25;

const MESSAGING_COOLDOWN = 4*seconds;

const SUB_CHECK_DEFAULT_MAX_ATTEMPTS = 10;
const SUB_CHECK_DEFAULT_RETRY_DELAY = 3*seconds;
const SUB_CHECK_DEFAULT_DECAY = 1.1;

const DELAY_CRASH_MAX = 10*minutes;

const DELAY_ACTIVE_USERS_CHECK = 5000;
const DELAY_ACTIVE_USERS_CHECK_MIN = 2000;
const DELAY_ACTIVE_TIMEOUT = 180000;

const DEFAULT_DISPLAY_NAME = "TwitchChatBot by WildcardSearch";


/* internal modules */

const TwitchChatBotModule = require("./twitch-chat-bot-module.js");

const DB_JSON_TwitchChatBotModule = require("../modules/database/db-json.js");
const DB_MYSQL_TwitchChatBotModule = require("../modules/database/db-mysql.js");

const BlockList_TwitchChatBotModule = require("../modules/block-list/block-list.js");
const MessageQueue_TwitchChatBotModule = require("../modules/message-queue/message-queue.js");
const Dictionary_TwitchChatBotModule = require("../modules/dictionary/dictionary.js");
const UserTracker_TwitchChatBotModule = require("../modules/user-tracker/user-tracker.js");

const Permissions_TwitchChatBotModule = require("../modules/command-center/permissions.js");
const CommandCenter_TwitchChatBotModule = require("../modules/command-center/command-center.js");

const StreamTimer_TwitchChatBotModule = require("../modules/timer/timer.js");
const Documentation_TwitchChatBotModule = require("../modules/docs/docs.js");


const VERSION = "0.0.3";
const DEFAULT_INSTANCE_VERSION = "1.0.0";

const TWITCH_BOT_DEFAULT_OPTIONS = {
	newStreamMaxDelay: DELAY_CRASH_MAX,
	verboseLogin: true,
	verboseLogging: true,
	forceDebug: false,

	currency: {
		type: null,
		implementation: null,
	},

	permissions: [],

	permissionOverrides: null,

	userTracker: {
		activeStatusCheckDelay: DELAY_ACTIVE_USERS_CHECK,
		activeStatusTimeout: DELAY_ACTIVE_TIMEOUT,
	},

	timer: {
		livetime: null,
	},

	docs: {
		path: '',
	},

	database: {
		type: "JSON",
		table: "streams",
		path: 'data.json',
	},

	personalization: {
		displayName: DEFAULT_DISPLAY_NAME,
		version: DEFAULT_INSTANCE_VERSION,
	},

	subCheck: {
		maxAttempts: SUB_CHECK_DEFAULT_MAX_ATTEMPTS,
		delay: SUB_CHECK_DEFAULT_RETRY_DELAY,
		decay: SUB_CHECK_DEFAULT_DECAY,
	},

	blocking: {
		blocked: [],
		blockBots: true,
		blockStreamer: true,
	},

	moderation: {
		globalCooldown: COOLDOWN_COMMAND_USAGE_GLOBAL,

		warningsTillBlock: COOLDOWN_WARNINGS_TILL_BLOCK,
		warningsTillTimeout: COOLDOWN_WARNINGS_TILL_TIMEOUT,
		warningsTillBan: COOLDOWN_WARNINGS_TILL_BAN,

		cooldownBlockMatrix: COOLDOWN_BLOCK_MATRIX,
		cooldownTimeoutMatrix: COOLDOWN_TIMEOUT_MATRIX,

		permissions: BOT_MOD_PERMISSION_NOTIFY,
	},

    messaging: {
        cooldown: MESSAGING_COOLDOWN,
    },
};


class TwitchChatBot {
	#valid = false;

	#connected = false;
	#subbed = false;

	username = null;
	#oauth = null;

	#subChecks = 1;
	#subCheckWait = SUB_CHECK_DEFAULT_RETRY_DELAY;

	#eventList = [];
	#eventHandlers = {};
	#firedEvents = [];
	#singularEvents = [];

	#globals = {};
	#globalKeys = [];
	#internalModuleKeys = [];

	#boundClientConnectEvent = this.onClientConnect.bind(this);
	#boundSubCheckEvent = this.subCheck.bind(this);
	#boundChatEvent = this.onChat.bind(this);

	options = {};

	displayName = "";
	channel = "";

	client = null;
	messaging = null;
	blockedList = null;

	permissions = null;
	commandCenter = null;
	timer = null;

	db = null;
	streamId = null;
	streamData = null;

	currency = null;
	hasCurrencySystem = false;

	dictionary = null;
	userTracker = null;
	docs = null;

	forceDebug = false;
	debugList = [];

	version = VERSION;
	instanceVersion = DEFAULT_INSTANCE_VERSION;

	/**
	 * @param  Object
	 * @param  Object
	 * @return void
	 */
	constructor(options)
	{
		/* options */

		this.options = { ...TWITCH_BOT_DEFAULT_OPTIONS, ...(options || {}) };

		if (typeof options.credentials !== "object") {
			this.error(ERROR_CONSTRUCTOR_NO_BOT_CREDENTIALS);

			return;
		}

		/* credentials */

		if (typeof options.credentials.username !== "string" ||
			options.credentials.username.length === 0) {
			this.error(ERROR_CONSTRUCTOR_NO_USERNAME);

			return;
		}

		if (typeof options.credentials.oauth !== "string" ||
			options.credentials.oauth.length === 0) {
			this.error(ERROR_CONSTRUCTOR_NO_OAUTH);

			return;
		}

		if (typeof options.credentials.channel !== "string" ||
			options.credentials.channel.length < TWITCH_USERNAME_MIN_LENGTH ||
			options.credentials.channel.length > TWITCH_USERNAME_MAX_LENGTH) {
			this.error(ERROR_CONSTRUCTOR_NO_CHANNELS);

			return;
		}

		/* store credentials */

		this.username = options.credentials.username;
		this.#oauth = options.credentials.oauth;
		this.channel = options.credentials.channel;

		this.#valid = true;

		/** personalization and defaults **/

		if (typeof this.options.personalization !== "object") {
			this.options.personalization = {
				displayName: DEFAULT_DISPLAY_NAME,
				version: DEFAULT_INSTANCE_VERSION,
			};
		}

		if (typeof this.options.personalization.displayName === "string" &&
			this.options.personalization.displayName.length > 0) {
			this.displayName = this.options.personalization.displayName.trim();
		}

		if (typeof this.options.personalization.version === "string" &&
			this.options.personalization.version.length > 0) {
			this.instanceVersion = this.options.personalization.version.trim();
		}

		/** moderation **/

		if (typeof this.options.moderation !== "object") {
			this.options.moderation = {
				globalCooldown: COOLDOWN_COMMAND_USAGE_GLOBAL,

				warningsTillBlock: COOLDOWN_WARNINGS_TILL_BLOCK,
				warningsTillTimeout: COOLDOWN_WARNINGS_TILL_TIMEOUT,
				warningsTillBan: COOLDOWN_WARNINGS_TILL_BAN,

				cooldownBlockMatrix: COOLDOWN_BLOCK_MATRIX,
				cooldownTimeoutMatrix: COOLDOWN_TIMEOUT_MATRIX,

				permissions: BOT_MOD_PERMISSION_NOTIFY,
			};
		}

		if (typeof this.options.moderation.globalCooldown !== "number" ||
			this.options.moderation.globalCooldown < 0) {
			this.options.moderation.globalCooldown = COOLDOWN_COMMAND_USAGE_GLOBAL;
		}

		if (typeof this.options.moderation.warningsTillBlock !== "number" ||
			this.options.moderation.warningsTillBlock < 0) {
			this.options.moderation.warningsTillBlock = COOLDOWN_WARNINGS_TILL_BLOCK;
		}

		if (typeof this.options.moderation.warningsTillTimeout !== "number" ||
			this.options.moderation.warningsTillTimeout < 0) {
			this.options.moderation.warningsTillTimeout = COOLDOWN_WARNINGS_TILL_TIMEOUT;
		}

		if (typeof this.options.moderation.warningsTillBan !== "number" ||
			this.options.moderation.warningsTillBan < 0) {
			this.options.moderation.warningsTillBan = COOLDOWN_WARNINGS_TILL_BAN;
		}

		if (typeof this.options.moderation.permissions !== "number" ||
			this.options.moderation.permissions < 0) {
			this.options.moderation.permissions = BOT_MOD_PERMISSION_NOTIFY;
		}

		/** sub check options **/

		if (typeof this.options.subCheck !== "object") {
			this.options.subCheck = {
				delay: SUB_CHECK_DEFAULT_RETRY_DELAY,
				decay: SUB_CHECK_DEFAULT_DECAY,
				maxAttempts: SUB_CHECK_DEFAULT_MAX_ATTEMPTS,
			};
		}

		if (typeof this.options.subCheck.maxAttempts !== "number" ||
			this.options.subCheck.maxAttempts <= 1) {
			this.options.subCheck.maxAttempts = SUB_CHECK_DEFAULT_MAX_ATTEMPTS;
		}

		if (typeof this.options.subCheck.delay !== "number" ||
			this.options.subCheck.delay <= 1*seconds) {
			this.#subCheckWait = this.options.subCheck.delay = SUB_CHECK_DEFAULT_RETRY_DELAY;
		}

		if (typeof this.options.subCheck.decay !== "number" ||
			this.options.subCheck.decay <= 1) {
			this.options.subCheck.decay = SUB_CHECK_DEFAULT_DECAY;
		}

		/** debugging **/

		if (typeof this.options.forceDebug !== "undefined") {
			switch (typeof this.options.forceDebug) {
				case "boolean":
					this.forceDebug = this.options.forceDebug === true;

					break;
				case "object":
					if (Array.isArray(this.options.forceDebug)) {
						for (const k of this.options.forceDebug) {
							if (typeof k !== "string" ||
								k.length === 0) {
								continue;
							}

							this.debugList.push(k);
						}
					}

					break;
				case "string":
					this.debugList.push(this.options.forceDebug);
					break;
			}
		}

		/* currency */

		if (typeof this.options.currency !== "object") {
			this.options.currency = {
				type: null,
				implementation: null,
			};
		}

		switch (this.options.currency.type) {
			case "se":
			case "streamelements":
				this.currency = new StreamElements_CurrencySystem(this, this.options.currency.implementation);

				break;
		}

		if (typeof this.currency !== null) {
			this.hasCurrencySystem = true;
		}


		/* userTracker */
		if (typeof this.options.userTracker !== "object") {
			this.options.userTracker = {
				activeStatusCheckDelay: DELAY_ACTIVE_USERS_CHECK,
				activeStatusTimeout: DELAY_ACTIVE_TIMEOUT,
			};
		}

		if (typeof this.options.userTracker.activeStatusCheckDelay !== "number") {
			this.options.userTracker.activeStatusCheckDelay = DELAY_ACTIVE_USERS_CHECK;
		}

		if (this.options.userTracker.activeStatusCheckDelay < DELAY_ACTIVE_USERS_CHECK_MIN) {
			this.options.userTracker.activeStatusCheckDelay = DELAY_ACTIVE_USERS_CHECK_MIN;
		}

		if (typeof this.options.userTracker.activeStatusTimeout !== "number" ||
			this.options.userTracker.activeStatusTimeout <= 0) {
			this.options.userTracker.activeStatusTimeout = DELAY_ACTIVE_TIMEOUT;
		}

		/* messaging */
		if (typeof this.options.messaging !== "object") {
			this.options.messaging = {
				cooldown: MESSAGING_COOLDOWN,
			};
		}

		if (typeof this.options.messaging.cooldown !== "number" ||
			this.options.messaging.cooldown < 0) {
			this.options.messaging.cooldown = MESSAGING_COOLDOWN;
		}


		this.registerEvent("initialized", true);
		this.registerEvent("ready", true);
		this.registerEvent("disconnect");
		this.registerEvent("reconnect");


		// Database
		let dbClass = null;

		if (typeof this.options.database.type === "string" &&
			this.options.database.type.length > 0) {
			switch(this.options.database.type) {
				case "MYSQL":
					dbClass = DB_MYSQL_TwitchChatBotModule;

					break;
				case "JSON":
				default:
					dbClass = DB_JSON_TwitchChatBotModule;

					break;
			}
		}

		if (dbClass === null) {
			this.error(ERROR_DB_INVALID);

			return;
		}

		this.db = new dbClass(this, this.connectClient.bind(this));
	}

/* initialization */

	/**
	 * connect to Twitch IRC servers using tmi.js
	 *
	 * @return void
	 */
	connectClient()
	{
		this.client = new tmi.client({
			options: {
				debug: true,
			},
			connection: {
				cluster: "aws",
				reconnect: true,
			},
			identity: {
				username: this.username,
				password: "oauth:"+this.#oauth,
			},
			channels: [ this.channel ],
		});

		this.client.on("connected", this.#boundClientConnectEvent);
		this.client.connect();
	}

	/**
	 * tmi.js connect event handler
	 *
	 * @param  String
	 * @param  String
	 * @return void
	 */
	onClientConnect(address, port)
	{
		this.client.off("connected", this.#boundClientConnectEvent);

		this.#connected = true;
		this.log({
			msg: "Twitch chat client connected (tmi.js)", args: arguments
		});

		this.client.on("chat", this.#boundSubCheckEvent); // bound this.subCheck()

		let initMessage = "sub test";

		if (this.options.verboseLogin === true) {
			initMessage = `${this.displayName} version ${this.instanceVersion} (${DEFAULT_DISPLAY_NAME} version ${this.version}) — initializing...`;
		}

		this.client.say(this.channel, initMessage);
	}

	/**
	 * determine whether the bot is subbed to the connected channel, if possible
	 *
	 * @param  String
	 * @param  Object
	 * @param  String
	 * @param  Boolean
	 * @return void
	 */
	subCheck(channel, userstate, message, self)
	{
		if (!self) {
			return;
		}

		if (checkSub(userstate) === null) {
			if (this.#subChecks >= this.options.subCheck.maxAttempts) {
				this.log("Subscription test failed.");
				userstate.subscriber = false;
			} else {
				this.#subCheckWait *= this.options.subCheck.decay;

				setTimeout(() => {
					this.client.say(this.channel, `sub test #${++this.#subChecks}...`);
				}, this.#subCheckWait);

				return;
			}
		}

		this.client.off("chat", this.#boundSubCheckEvent);

		this.#subbed = checkSub(userstate) === true;

		this.client.on("connected", this.onReconnect.bind(this));
		this.client.on("disconnected", this.onDisconnect.bind(this));

		this.registerEvent("lostsub");
		this.registerEvent("gotsub");
		this.registerEvent("chat");

		this.registerInternalModule(BlockList_TwitchChatBotModule, "blockedList", EVENT_PRIORITY_HIGH+8);
		this.registerInternalModule(MessageQueue_TwitchChatBotModule, "messaging", EVENT_PRIORITY_HIGH+7);
		this.registerInternalModule(Permissions_TwitchChatBotModule, "permissions", EVENT_PRIORITY_HIGH+6);
		this.registerInternalModule(CommandCenter_TwitchChatBotModule, "commandCenter", EVENT_PRIORITY_HIGH+5);
		this.registerInternalModule(StreamTimer_TwitchChatBotModule, "timer", EVENT_PRIORITY_HIGH+4);
		this.registerInternalModule(UserTracker_TwitchChatBotModule, "userTracker", EVENT_PRIORITY_HIGH+3);
		this.registerInternalModule(Dictionary_TwitchChatBotModule, "dictionary", EVENT_PRIORITY_HIGH+2);
		this.registerInternalModule(Documentation_TwitchChatBotModule, "docs", EVENT_PRIORITY_HIGH+1);

		this.fireEvent("initialized");

		// initialize the DB
		this.db.init(this.ready.bind(this));
	}

/* internal events */

	/**
	 * register, attach, and fire events
	 *
	 * @return void
	 */
	ready()
	{
		this.fireEvent("ready");

		/* Command Permission Overrides */

		if (typeof this.options.permissionOverrides === "object" &&
			this.options.permissionOverrides !== null &&
			Object.keys(this.options.permissionOverrides).length > 0) {
			for (let [k, p] of Object.entries(this.options.permissionOverrides)) {
				if (typeof k !== "string" ||
					k.length === 0) {
					continue;
				}

				k = k.replace(/^!/, "").trim();

				if (k.length === 0 ||
					typeof p !== "number" ||
					p <= 0 ||
					this.commandCenter.commandList.includes(k) !== true) {
					continue;
				}

				this.commandCenter.commands[k].permissionLevel = p;
			}
		}

		this.client.on("chat", this.#boundChatEvent);
	}

/* modules */

	/**
	 * @param  TwitchChatBotModule
	 * @return void
	 */
	validateModule(module)
	{
		if (module.prototype instanceof TwitchChatBotModule !== true) {
			this.error(ERROR_MODULE_INVALID_CONSTRUCTOR);

			return false;
		}

		return true;
	}

	/**
	 * instance and configure an external TwitchChatBotModule
	 *
	 * @param  TwitchChatBotModule
	 * @param  Boolean
	 * @return void
	 */
	registerModule(module, debugMode = false, priority)
	{
		let p = EVENT_PRIORITY_DEFAULT;

		if (typeof priority === "number" &&
			priority >= 0) {
			p = parseInt(priority, 10);
		}

		if (p > EVENT_PRIORITY_EXTERNAL_MODULE_MAX) {
			p = EVENT_PRIORITY_EXTERNAL_MODULE_MAX;
		}

		if (this.validateModule(module) !== true) {
			this.error(ERROR_EXTERNAL_MODULE_INVALID);

			return;
		}

		let m = new module(this, priority, debugMode === true || this.forceDebug === true);

		this.log(`Registered External Module: ${m.id}`);
	}

	/**
	 * instance and configure an internal TwitchChatBotModule
	 *
	 * @param  TwitchChatBotModule
	 * @param  String
	 * @return void
	 */
	registerInternalModule(module, key = "", priority)
	{
		if (this.validateModule(module) !== true) {
			return;
		}

		if (typeof key !== "string" ||
			key.length === 0) {
			this.error(ERROR_INTERNAL_MODULE_NO_KEY);

			return;
		}

		if (key.length < 3) {
			this.error(ERROR_INTERNAL_MODULE_KEY_LENGTH_BELOW_MINIMUM);

			return;
		}

		if (typeof this[key] === "undefined") {
			this.error(ERROR_INTERNAL_MODULE_KEY_INVALID);

			return;
		}

		if (this.#internalModuleKeys.includes(key)) {
			this.error(ERROR_INTERNAL_MODULE_DUPLICATE_KEY);

			return;
		}

		this[key] = new module(this, priority || EVENT_PRIORITY_DEFAULT, this.debugList.includes(key) || this.forceDebug === true);
		this.#internalModuleKeys.push(key);

		this.log(`Registered Internal Module: ${key}`);
	}


/* event handlers */

	/**
	 * do a sub check; compile user data; and call chat events (tmi.js chat event)
	 *
	 * @param  String
	 * @param  Object
	 * @param  String
	 * @param  Boolean
	 * @return void
	 */
	onChat(channel, userstate, message, self)
	{
		const sender = userstate["display-name"];

		if (!sender || !message) {
			return;
		}

		if (self) {
			let subCheck = checkSub(userstate);

			if (subCheck === null) {
				this.log("bad sub check", userstate);

				return;
			}

			if (this.#subbed !== true &&
				subCheck) {
				this.fireEvent("gotsub");
			}

			if (this.#subbed === true &&
				!subCheck) {
				this.fireEvent("lostsub");
			}

			this.#subbed = subCheck;

			return;
		}

		// vip
		userstate.vip = false;

		if (typeof userstate !== "undefined" &&
			typeof userstate.badges !== "undefined" &&
			userstate.badges !== null &&
			typeof userstate.badges.vip !== "undefined" &&
			userstate.badges.vip === "1") {
			userstate.vip = true;
		}

		this.fireEvent("chat", arguments);
	}

	/**
	 * log disconnects (tmi.js disconnected event)
	 *
	 * @param  String
	 * @return void
	 */
	onDisconnect(reason)
	{
		this.log("Disconnected");
		this.log({ reason: reason });

		this.#connected = false;

		this.client.off("chat", this.#boundChatEvent);

		this.fireEvent("disconnect");
	}

	/**
	 * log reconnects (tmi.js connected event)
	 *
	 * @param  String
	 * @param  String
	 * @return void
	 */
	onReconnect(address, port)
	{
		this.log("Reconnected");

		this.#connected = true;

		this.client.on("chat", this.#boundChatEvent);

		this.fireEvent("reconnect");

		if (this.options.verboseLogin === true) {
			this.client.say(this.channel, "I'm back!");
		}
	}


/* event management */

	/**
	 * register stream event
	 *
	 * @param  String
	 * @param  Boolean
	 * @return void
	 */
	registerEvent(event, onetimeonly)
	{
		if (typeof event !== "string" ||
			event.length === 0) {
			this.error(ERROR_EVENT_REGISTER_BAD_INFO, { eventinfo: event } );

			return;
		}

		event = event.trim().toLowerCase();

		if (this.#eventList.includes(event) === true) {
			this.error(ERROR_EVENT_REGISTER_DUPLICATE, { event: event } );

			return;
		}

		this.#eventList.push(event);
		this.#eventHandlers[event] = [];

		if (onetimeonly === true) {
			this.#singularEvents.push(event);
		}
	}

	/**
	 * register an event handler
	 *
	 * @param  String
	 * @param  Function
	 * @return void
	 */
	on(event = "", handler, priority)
	{
		let handlerName = "anonymous function";

		if (typeof event !== "string" ||
			event.length === 0) {
			this.error(ERROR_EVENT_ON_BAD_INFO, { args: arguments } );

			return;
		}

		if (this.#eventList.includes(event) === false) {
			this.error(ERROR_EVENT_ON_INVALID_EVENT, { event: event } );

			return;
		}

		if (typeof handler !== "function") {
			this.error(ERROR_EVENT_ON_BAD_INFO, { event: event } );

			return;
		}

		if (typeof handler.name === "string" &&
			handler.name.length > 0) {
			handlerName = handler.name+"()";
		}

		if (typeof priority !== "number") {
			priority = EVENT_PRIORITY_DEFAULT;
		}

		if (this.#singularEvents.includes(event) === true &&
			this.#firedEvents.includes(event.trim().toLowerCase()) === true) {
			this.log(`handler attached to ${event} after firing "${handlerName}"`);

			return handler();
		}

		this.#eventHandlers[event].push({
			handler: handler,
			priority: priority,
		});

		this.log(`attached handler for ${event} "${handlerName}"`);
	}

	/**
	 * unregister an event handler
	 *
	 * @param  String
	 * @param  Function
	 * @return void
	 */
	off(event = "", handler)
	{
		if (typeof event !== "string" ||
			event.length === 0) {
			this.error(ERROR_EVENT_OFF_BAD_INFO, { args: arguments } );

			return;
		}

		if (this.#eventList.includes(event) === false) {
			this.error(ERROR_EVENT_OFF_INVALID_EVENT, { event: event } );

			return;
		}

		if (typeof handler !== "function") {
			this.error(ERROR_EVENT_OFF_BAD_HANDLER, { handler: handler } );

			return;
		}

		let handlers = [];

		for (const f of this.#eventHandlers[event]) {
			if (f.handler === handler) {
				continue;
			}

			handlers.push(f);
		}

		this.#eventHandlers[event] = handlers;

		this.log( { message: `detached handler for ${event}`, handler });
	}

	/**
	 * fire an event
	 *
	 * @param  String
	 * @param  Array-like
	 * @return void
	 */
	fireEvent(event, a)
	{
		if (typeof event !== "string" ||
			event.length === 0) {
			this.error(ERROR_EVENT_FIRE_BAD_INFO, { args: arguments } );

			return;
		}

		if (this.#eventList.includes(event) === false) {
			this.error(ERROR_EVENT_FIRE_INVALID_EVENT, { event: event } );

			return;
		}

		if (typeof a === "undefined") {
			a = [];
		}


		// sort events according to priority (high-to-low)
		this.#eventHandlers[event].sort((a, b) => {
			if (a.priority > b.priority) {
				return -1;
			}

			if (a.priority < b.priority) {
				return 1;
			}

			return 0;
		});


		this.log(`"${event}" event fired`);


		for (const f of this.#eventHandlers[event]) {
			if (typeof f.handler !== "function") {
				this.log(`TwitchChatBot fireEvent bad info for "${event}" event`, f.handler, typeof f.handler);

				continue;
			}

			this.log("event fired", {
				event: event,
				name: f.handler.name,
				function: f.handler,
				priority: f.priority,
			});

			f.handler.apply(this, a);
		}

		if (this.#firedEvents.includes(event) !== true) {
			this.#firedEvents.push(event);
		}

		this.log(`"${event}" event complete`);
	}


/* globals */

	/**
	 * register a global value
	 *
	 * @param  Object
	 * @return void
	 */
	registerGlobal(g)
	{
		if (Array.isArray(g) !== true) {
			g = [ g ];
		}

		for (const globalVar of g) {
			let handlerName = "anonymous function";

			if (typeof globalVar !== "object" ||
				typeof globalVar.key !== "string" ||
				globalVar.key.length === 0 ||
				typeof globalVar.get !== "function") {
				this.log("Global Variable: no data sent", globalVar);

				continue;
			}

			let k = globalVar.key.toLowerCase().trim();
			let handler = globalVar.get;

			if (this.#globalKeys.includes(k) === true) {
				this.log(`duplicate global "${k}"`);

				continue;
			}

			if (typeof handler !== "function") {
				this.log(`bad global handler: non-function`);

				continue;
			}

			if (typeof handler.name === "string" &&
				handler.name.length > 0) {
				handlerName = handler.name+"()";
			}

			this.#globalKeys.push(k);
			this.#globals[k] = {
				key: k,
				get: handler,
			};

			this.log(`Registered Global "${k}" w/handler: ${handlerName}`);
		}
	}

	/**
	 * register event handler
	 *
	 * @param  String
	 * @return void
	 */
	getGlobal(k)
	{
		if (typeof k !== "string" ||
			k.length === 0) {
			this.log(`getGlobal: Bad key info passed.`, k || typeof k);
		}

		if (this.#globalKeys.includes(k.toLowerCase()) === false) {
			this.log(`getGlobal: Unknown global key passed.`, k || typeof k);
		}

		return this.#globals[k.toLowerCase()].get();
	}


/* services */

	/**
	 * shortcut to send a message to chat via the message queue
	 *
	 * @param  String
	 * @param  Object
	 * @return void
	 */
	sendMessage(text, options)
	{
		this.messaging.queueMessage(text, options);
	}


/* getters */

	/**
	 * getter for this.#valid
	 *
	 * @return Boolean
	 */
	isValid()
	{
		return this.#valid === true;
	}

	/**
	 * getter for this.#connected
	 *
	 * @return Boolean
	 */
	isConnected()
	{
		return this.#connected === true;
	}

	/**
	 * getter for this.#subbed
	 *
	 * @return Boolean
	 */
	isSubbed()
	{
		return this.#subbed === true;
	}


/* error handling & reporting */

	/**
	 * log runtime data
	 *
	 * @param  ...args
	 * @return void
	 */
	log()
	{
		if (this.options.verboseLogging !== true ||
			typeof arguments === "undefined" ||
			arguments.length === 0) {
			return;
		}

		for (const a of arguments) {
			console.log(a);
		}
	}

	/**
	 * report an error
	 *
	 * @param  Number
	 * @param  Object
	 * @return Boolean
	 */
	error(errorCode, info)
	{
		let errorMessage;

		if (typeof errorCode !== "number") {
			errorCode = parseInt(errorCode, 10);
		}

		if (errorCode <= 0) {
			return false;
		}

		if (typeof errorMessages[errorCode] !== "string" ||
			errorMessages[errorCode].length === 0) {
			this.log("Error thrown incorrectly.", errorCode, info);

			return false;
		}

		this.log({ ERROR: errorMessages[errorCode], info: info });
	}
};


module.exports = TwitchChatBot;

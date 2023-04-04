/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const ERROR_INVALID_CREDENTIALS = 1000;

const ERROR_CONSTRUCTOR_NO_BOT_CREDENTIALS = 2000;
const ERROR_CONSTRUCTOR_NO_USERNAME = 2001;
const ERROR_CONSTRUCTOR_NO_OAUTH = 2002;
const ERROR_CONSTRUCTOR_NO_CHANNELS = 2003;

const ERROR_EVENT_ON_BAD_INFO = 3000;
const ERROR_EVENT_ON_BAD_HANDLER = 3001;
const ERROR_EVENT_ON_INVALID_EVENT = 3002;

const ERROR_EVENT_REGISTER_BAD_INFO = 4000;
const ERROR_EVENT_REGISTER_DUPLICATE = 4001;

const ERROR_EVENT_OFF_BAD_INFO = 5000;
const ERROR_EVENT_OFF_INVALID_EVENT = 5001;
const ERROR_EVENT_OFF_BAD_HANDLER = 5002;

const ERROR_EVENT_FIRE_BAD_INFO = 6000;
const ERROR_EVENT_FIRE_INVALID_EVENT = 6001;

const ERROR_EXTERNAL_MODULE_INVALID = 7000;

const ERROR_INTERNAL_MODULE_NO_KEY = 8000;
const ERROR_INTERNAL_MODULE_KEY_LENGTH_BELOW_MINIMUM = 8001;
const ERROR_INTERNAL_MODULE_KEY_INVALID = 8002;
const ERROR_INTERNAL_MODULE_DUPLICATE_KEY = 8003;

const ERROR_DB_INVALID = 9000;
const ERROR_DB_MYSQL_CONNECT_FAIL = 9001;
const ERROR_DB_MYSQL_INSTALL_TABLE_FAIL = 9002;
const ERROR_DB_MYSQL_READ_DATA_FAIL = 9003;
const ERROR_DB_MYSQL_INSERT_DATA_FAIL = 9004;
const ERROR_DB_MYSQL_READ_ID_FAIL = 9005;
const ERROR_DB_MYSQL_READ_TABLES_FAIL = 9006;
const ERROR_DB_MYSQL_STORE_TABLES_FAIL = 9007;
const ERROR_DB_MYSQL_STORE_FIELDS_FAIL = 9008;
const ERROR_DB_MYSQL_READ_FIELDS_FAIL = 9009;
const ERROR_DB_MYSQL_INSTALL_FIELD_FAIL = 9010;

const ERROR_CURRENCY_NO_SYSTEM = 10000;
const ERROR_CURRENCY_ADD_BAD_INFO_NO_USERNAME = 10001;
const ERROR_CURRENCY_ADD_BAD_INFO_BAD_AMOUNT = 10002;
const ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME = 10003;
const ERROR_CURRENCY_SUBTRACT_BAD_INFO_BAD_AMOUNT = 10004;

const ERROR_MODULE_INVALID_CONSTRUCTOR = 11000;


const errorMessages = {
	1000: "Invalid or missing credentials.",

	2000: "constructor: no options passed",
	2001: "constructor: no username passed",
	2002: "constructor: no OAuth passed",
	2003: "constructor: no channels passed",

	3000: "Event Error - bad info passed to bob.on()",
	3001: "Event Error - bad handler passed to bob.on()",
	3002: "Event Error - invalid event passed to bob.on()",

	4000: "Event Error - bad info passed to bob.registerEvent()",
	4001: "Event Error - duplicate event sent to bob.registerEvent()",

	5000: "Event Error - bad info passed to bob.off()",
	5001: "Event Error - bad event passed to bob.off()",
	5002: "Event Error - bad handler passed to bob.off()",

	6000: "Event Error - bad info passed to bob.fireEvent()",
	6001: "Event Error - invalid event passed to bob.fireEvent()",

	7000: "Modules: External - Module Invalid",

	8000: "Modules: Internal - missing key",
	8001: "Modules: Internal - key too short (minimum = 3 characters)",
	8002: "Modules: Internal - invalid key",
	8003: "Modules: Internal - duplicate key",

	9000: "Database Error: Invalid Database Module",
	9001: "Database Error: Couldn't connect to MySQL",
	9002: "Database Error: Installation - couldn't install table",
	9003: "Database Error: Access - couldn't read from database",
	9004: "Database Error: Access - Couldn't insert stream record",
	9005: "Database Error: Access - failed to obtain insert ID",
	9006: "Database Error: Installation - failed to obtain a list of database tables",
	9007: "Database Error: Access - failed to store table list",
	9008: "Database Error: Access - failed to store field list",
	9009: "Database Error: Access - failed to read stored field list",
	9010: "Database Error: Installation - failed to install field",

	10000: "Currency Error: No currency system exists to load or loading failed",
	10001: "Currency Error: Add Points - no username passed",
	10002: "Currency Error: Add Points - no amount passed",
	10003: "Currency Error: Subtract Points - no username passed",

	11000: "Module Error: Passed invalid module (not instance of TwitchChatBotModule)",
};


module.exports = {
	ERROR_INVALID_CREDENTIALS,

	ERROR_CONSTRUCTOR_NO_BOT_CREDENTIALS,
	ERROR_CONSTRUCTOR_NO_USERNAME,
	ERROR_CONSTRUCTOR_NO_OAUTH,
	ERROR_CONSTRUCTOR_NO_CHANNELS,

	ERROR_EVENT_ON_BAD_INFO,
	ERROR_EVENT_ON_BAD_HANDLER,
	ERROR_EVENT_ON_INVALID_EVENT,

	ERROR_EVENT_REGISTER_BAD_INFO,
	ERROR_EVENT_REGISTER_DUPLICATE,

	ERROR_EVENT_OFF_BAD_INFO,
	ERROR_EVENT_OFF_INVALID_EVENT,
	ERROR_EVENT_OFF_BAD_HANDLER,

	ERROR_EVENT_FIRE_BAD_INFO,
	ERROR_EVENT_FIRE_INVALID_EVENT,

	ERROR_MODULE_INVALID_CONSTRUCTOR,

	ERROR_INTERNAL_MODULE_NO_KEY,
	ERROR_INTERNAL_MODULE_KEY_LENGTH_BELOW_MINIMUM,
	ERROR_INTERNAL_MODULE_KEY_INVALID,
	ERROR_INTERNAL_MODULE_DUPLICATE_KEY,

	ERROR_EXTERNAL_MODULE_INVALID,

	ERROR_DB_INVALID,
	ERROR_DB_MYSQL_CONNECT_FAIL,
	ERROR_DB_MYSQL_INSTALL_TABLE_FAIL,
	ERROR_DB_MYSQL_READ_DATA_FAIL,
	ERROR_DB_MYSQL_INSERT_DATA_FAIL,
	ERROR_DB_MYSQL_READ_ID_FAIL,
	ERROR_DB_MYSQL_READ_TABLES_FAIL,
	ERROR_DB_MYSQL_STORE_TABLES_FAIL,
	ERROR_DB_MYSQL_STORE_FIELDS_FAIL,
	ERROR_DB_MYSQL_READ_FIELDS_FAIL,
	ERROR_DB_MYSQL_INSTALL_FIELD_FAIL,

	ERROR_CURRENCY_NO_SYSTEM,
	ERROR_CURRENCY_ADD_BAD_INFO_NO_USERNAME,
	ERROR_CURRENCY_ADD_BAD_INFO_BAD_AMOUNT,

	ERROR_CURRENCY_SUBTRACT_BAD_INFO_NO_USERNAME,
	ERROR_CURRENCY_SUBTRACT_BAD_INFO_BAD_AMOUNT,

	errorMessages,
};

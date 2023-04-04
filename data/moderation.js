/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const {
	milliseconds, seconds, minutes, hours, days, weeks, months, years, decades, centuries,
} = require("./time.js");


const COOLDOWN_COMMAND_USAGE_GLOBAL = 5*seconds;

const COOLDOWN_WARNINGS_TILL_BLOCK = 3;
const COOLDOWN_WARNINGS_TILL_TIMEOUT = 5;
const COOLDOWN_WARNINGS_TILL_BAN = 7;

const COOLDOWN_BLOCK_MATRIX = {
	3: 300,
	4: 900,
	5: false,
};

const COOLDOWN_TIMEOUT_MATRIX = {
	4: 60,
	5: 300,
	6: 900,
	7: false,
};


const BOT_MOD_PERMISSION_NOTIFY = 0;
const BOT_MOD_PERMISSION_ACT = 1;


module.exports = {
	COOLDOWN_COMMAND_USAGE_GLOBAL,

	COOLDOWN_WARNINGS_TILL_BLOCK,
	COOLDOWN_WARNINGS_TILL_TIMEOUT,
	COOLDOWN_WARNINGS_TILL_BAN,

	COOLDOWN_BLOCK_MATRIX,
	COOLDOWN_TIMEOUT_MATRIX,

	BOT_MOD_PERMISSION_NOTIFY,
	BOT_MOD_PERMISSION_ACT,
};

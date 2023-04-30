/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [{
	key: "message-queue",
	title: "Message Queue",
}];

const errorCodes = [];

const warningCodes = [{
	key: "ERROR_MESSAGE_QUEUE_QUEUE_MESSAGE_EMPTY_MESSAGE",
	message: "failed to queue message; empty message",
	category: "message-queue",
}, {
	key: "ERROR_MESSAGE_QUEUE_SEND_NEXT_EMPTY_MESSAGE",
	message: "failed to send message; empty message from queue",
	category: "message-queue",
}];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
	warningCodes: warningCodes,
};

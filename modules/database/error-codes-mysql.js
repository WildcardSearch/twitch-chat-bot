/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const errorCategories = [];

const errorCodes = [
	{
		key: "ERROR_DB_MYSQL_CONNECT_FAIL",
		message: "Couldn't connect to MySQL",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_INSTALL_TABLE_FAIL",
		message: "Installation - couldn't install table",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_READ_DATA_FAIL",
		message: "Access - couldn't read from database",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_INSERT_DATA_FAIL",
		message: "Access - Couldn't insert stream record",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_READ_ID_FAIL",
		message: "Access - failed to obtain insert ID",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_READ_TABLES_FAIL",
		message: "Installation - failed to obtain a list of database tables",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_STORE_TABLES_FAIL",
		message: "Access - failed to store table list",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_STORE_FIELDS_FAIL",
		message: "Access - failed to store field list",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_READ_FIELDS_FAIL",
		message: "Access - failed to read stored field list",
		category: "database",
	}, {
		key: "ERROR_DB_MYSQL_INSTALL_FIELD_FAIL",
		message: "Installation - failed to install field",
		category: "database",
	},
];


module.exports = {
	errorCategories: errorCategories,
	errorCodes: errorCodes,
};

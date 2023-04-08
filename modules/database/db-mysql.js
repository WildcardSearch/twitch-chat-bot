/**
 * twitch-chat-bot
 *
 * Copyright (c) 2020 WildcardSearch
 */


const mysql = require('mysql');

const {
	ERROR_DB_MYSQL_CONNECT_FAIL, ERROR_DB_MYSQL_INSTALL_TABLE_FAIL,
	ERROR_DB_MYSQL_READ_DATA_FAIL, ERROR_DB_MYSQL_INSERT_DATA_FAIL, ERROR_DB_MYSQL_READ_ID_FAIL,
	ERROR_DB_MYSQL_READ_TABLES_FAIL, ERROR_DB_MYSQL_STORE_TABLES_FAIL, ERROR_DB_MYSQL_STORE_FIELDS_FAIL,
	ERROR_DB_MYSQL_READ_FIELDS_FAIL, ERROR_DB_MYSQL_INSTALL_FIELD_FAIL,
} = require("../../data/error-codes.js");

const DB_Base_TwitchChatBotModule = require("./db-base.js");


class DB_MYSQL_TwitchChatBotModule extends DB_Base_TwitchChatBotModule
{
	id = "MYSQL";
	valid = false;


	/* connect */

	/**
	 * connect to the db
	 *
	 * @return void
	 */
	connect()
	{
		this.fields = {};
		this.fieldList = [];

		if (typeof this.options.database !== "object" ||
			typeof this.options.database.table !== "string" &&
			this.options.database.table.length === 0) {
			return;
		}

		if (typeof this.options.database.credentials !== "object" ||
			Object.keys(this.options.database.credentials).length < 4) {
			return;
		}

		this.credentials = this.options.database.credentials;
		this.table = this.options.database.table;
		this.connection = mysql.createConnection(this.credentials);
		this.connection.connect(this.checkConnection.bind(this));
	}

	/**
	 * check in with MySQL
	 *
	 * @param  String
	 * @return void
	 */
	checkConnection(error)
	{
		if (error) {
			this.bot.error(ERROR_DB_MYSQL_CONNECT_FAIL, "Couldn't connect to MySQL", error);
			this.onConnectionFail(error);

			return;
		}

		this.bot.log("Connected to MYSQL database");
		this.valid = true;

		this.getAllTables(this.checkTableInstall.bind(this));

	}

	/**
	 * start checking component install
	 *
	 * @param  String
	 * @param  Object
	 * @return void
	 */
	checkTableInstall(err, result)
	{
		if (err) {
			this.bot.error(ERROR_DB_MYSQL_INSTALL_TABLE_FAIL, err);

			return;
		}

		if (this.tableExists(this.table) !== true) {
			this.install(this.checkFieldInstall.bind(this));
		} else {
			this.checkFieldInstall();
		}
	}

	/* install */

	/**
	 * continue with component installation
	 *
	 * @return void
	 */
	checkFieldInstall()
	{
		this.getAllFields(this.finalizeInstall.bind(this));
	}

	/**
	 * finish up install
	 *
	 * @return void
	 */
	finalizeInstall()
	{
		this.installField({
			key: "id",
			type: "id",
		});

		this.registerField({
			key: "timestamp",
			type: "number",
		});

		this.bot.log("MySQL Database Installation: 100%", "connected");

		this.onConnect();
	}


	/* initialize */

	/**
	 * initialize the db; grab the last stream; and call the TwitchChatBotModule ready event
	 *
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	init(onSuccess, onFail)
	{
		var n = Date.now() - this.options.newStreamMaxDelay;

		if (typeof onSuccess !== "function") {
			onSuccess = () => {};
		}

		if (typeof onFail !== "function") {
			onFail = () => {};
		}

		this.simpleSelect("*", `lastlive > ${n}`, { callback: function checkForCrash(err, result) {
			if (err) {
				this.bot.error(ERROR_DB_MYSQL_READ_DATA_FAIL, err);

				return;
			}

			if (typeof result !== "object" ||
				Array.isArray(result) !== true ||
				result.length === 0) {
				this.bot.log("new stream");
				this.insertStreamRecord(onSuccess, onFail);

				return;
			}

			this.bot.log("recovering from crash");
			this.bot.log(result);

			this.bot.streamId = result[0].id;
			this.bot.streamData = this.buildStreamData(result[0]);

			onSuccess();
		}.bind(this)});
	}


	/* database access */

	/**
	 * start a fresh stream record
	 *
	 * @param  Function
	 * @param  Function
	 * @return void
	 */
	insertStreamRecord(onSuccess, onFail)
	{
		let fields = this.buildFieldListSQL();

		this.bot.log(`INSERT INTO ${this.table} ${fields};`);

		this.connection.query(`INSERT INTO ${this.table} ${fields};`, function (err, result) {
			if (err) {
				this.bot.error(ERROR_DB_MYSQL_INSERT_DATA_FAIL, err);

				onFail(err);

				return;
			}

			this.bot.log(result);

			if (typeof result !== "object" ||
				typeof result.insertId !== "number" ||
				result.insertId <= 0) {
				this.bot.error(ERROR_DB_MYSQL_READ_ID_FAIL, result);

				onFail(err);

				return;
			}

			this.bot.streamId = result.insertId;
			this.bot.streamData = this.buildFieldListObject();
			onSuccess();
		}.bind(this));
	}

	/**
	 * store information from internal/external modules
	 *
	 * @param  Object
	 * @return void
	 */
	updateStreamInfo(fields)
	{
		fields.timestamp = Date.now();

		this.updateQuery(fields, `id = ${this.bot.streamId}`);
	}

	/**
	 * perform a query using passed info
	 *
	 * @param  Array
	 * @param  String
	 * @param  Object
	 * @return void
	 */
	simpleSelect(fields, where, options)
	{
		let whereClause = "",
			orderBy = "",
			fieldClause = "*",
			sep = "",
			queryString = "";

		if (typeof fields === "object" &&
			Array.isArray(fields) === true &&
			fields.length > 0) {
			fieldClause = "";
			for (const field of fields) {
				fieldClause += `${sep}${field}`;
				sep = ", ";
			}
		}

		if (typeof where === "string" &&
			where.length > 0) {
			whereClause = ` WHERE ${where}`;
		}

		if (typeof options === "object") {
			if (typeof options.callback !== "function") {
				options.callback = () => {};
			}

			if (typeof options.orderBy === "string" &&
				options.orderBy.length > 0) {
				orderBy = ` ORDER ${options.orderBy}`;

				if (typeof options.orderDir === "string" &&
					options.orderDir.length > 0 &&
					["asc", "desc"].includes(options.orderDir.toLowerCase()) === true) {
					orderBy += ` ${options.orderDir.toUpperCase()}`;
				}
			}
		} else {
			return false;
		}

		queryString = `SELECT ${fieldClause} FROM ${this.table}${whereClause}${orderBy}`;

		this.connection.query(queryString, options.callback);
	}

	/**
	 * perform an update query using passed info
	 *
	 * @param  Object
	 * @param  String
	 * @param  Object
	 * @return void
	 */
	updateQuery(fields, where, options)
	{
		let queryString = "",
			fieldList = "",
			sep = "";

		fieldList = this.buildFieldList(fields);

		if (fieldList === false ||
			fieldList.length === 0) {
			return false;
		}

		if (typeof options !== "object") {
			options = {};
		}

		if (typeof options.callback !== "function") {
			options.callback = ()=>{};
		}

		queryString = `UPDATE ${this.table} SET ${fieldList} WHERE ${where}`;

		this.connection.query(queryString, options.callback);
	}

	/**
	 * retrieve a list of all database tables
	 *
	 * @param  Function
	 * @return void
	 */
	getAllTables(callback)
	{
		this.dbTableList = [];

		this.connection.query("SHOW TABLES", (err, result) => {
			if (err) {
				this.bot.error(ERROR_DB_MYSQL_READ_TABLES_FAIL, err);

				return;
			}

			this.storeTables(result);

			if (typeof callback === "function") {
				callback(err, result);
			}
		});
	}

	/**
	 * retrieve a list of all database columns
	 *
	 * @param  Function
	 * @return void
	 */
	getAllFields(callback)
	{
		this.dbFieldList = [];
		this.dbFields = {};

		this.connection.query("SHOW COLUMNS FROM `"+this.table+"`", (err, result) => {
			this.storeFields(err, result);

			if (typeof callback === "function") {
				callback(err, result);
			}
		});
	}

	/**
	 * store database tables
	 *
	 * @param  Object
	 * @return void
	 */
	storeTables(result)
	{
		if (typeof result !== "object" ||
			Array.isArray(result) !== true ||
			result.length === 0) {
			this.bot.error(result);
			return;
		}

		this.bot.log("MySQL Database Table List");
		this.bot.log(result);

		for (const t of result) {
			for (const [k, r] of Object.entries(t)) {
				this.dbTableList.push(r);
			}
		}
	}

	/**
	 * store database columns
	 *
	 * @param  Object
	 * @return void
	 */
	storeFields(err, result)
	{
		if (err) {
			this.bot.error(ERROR_DB_MYSQL_STORE_FIELDS_FAIL, err);

			return;
		}

		if (typeof result !== "object" ||
			Array.isArray(result) !== true ||
			result.length === 0) {
			this.bot.error(ERROR_DB_MYSQL_READ_FIELDS_FAIL, result);

			return;
		}

		this.bot.log("MySQL Database Field List");
		this.bot.log(result);

		for (const f of result) {
			this.dbFieldList.push(f.Field);
			this.dbFields
		}
	}


	/* installation */

	/**
	 * install the table and default columns
	 *
	 * @param  Function
	 * @return void
	 */
	install(callback)
	{
		this.connection.query("CREATE TABLE `"+this.table+"` (`id` int(10) NOT NULL AUTO_INCREMENT, `timestamp` bigint(20) DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;", (err, result) => {
			if (err) {
				this.bot.error(ERROR_DB_MYSQL_INSTALL_TABLE_FAIL, {
					message: `error adding table '${this.table}' to '${this.options.database.credentials.database}'`,
					error: err,
				});

				return false;
			}

			this.bot.log(`added MySQL table '${this.table}' to '${this.options.database.credentials.database}'`, result);

			if (typeof callback === "function") {
				callback(err, result);
			}
		});
	}

	/**
	 * install multiple fields
	 *
	 * @param  Object
	 * @return void
	 */
	installFields(f)
	{
		if (typeof f === "undefined") {
			return false;
		}

		if (Array.isArray(f) !== true) {
			f = [ f ];
		}

		for (const field of f) {
			this.installField(field);
		}
	}

	/**
	 * install a single database column
	 *
	 * @param  Object
	 * @return void
	 */
	installField(f)
	{
		if (typeof f !== "object" ||
			typeof f.key !== "string" ||
			f.key.length === 0 ||
			typeof f.type !== "string" ||
			f.type.length === 0) {
			return false
		}

		let name = f.key,
			type = f.type;

		if (this.fieldExists(name)) {
			return true;
		}

		let def = "text",
			defaultValue = "";

		switch (type) {
			case "boolean":
				def = "tinyint(1) NOT NULL";
				defaultValue = " DEFAULT '0'";
				break;
			case "number":
				def = "bigint(20)";
				defaultValue = " DEFAULT NULL";
				break;
			case "id":
				def = "int(10) NOT NULL AUTO_INCREMENT";
				defaultValue = "";
				break;
		}

		if (typeof f.default !== "undefined" &&
			typeof f.default.toString === "function") {
			defaultValue = ` DEFAULT '${f.default.toString()}'`;
		}

		this.connection.query(`ALTER TABLE ${this.table} ADD COLUMN ${name} ${def}${defaultValue}`, (err, result) => {
			if (err) {
				this.bot.error(ERROR_DB_MYSQL_INSTALL_FIELD_FAIL, {
					message: `error adding column '${name}' to '${this.table}'`,
					err,
				});

				return false;
			}

			this.bot.log(`added MySQL DB column '${name}' to '${this.table}'`, result);
		});
	}


	/* functions */

	/**
	 * vet and clean up any stream data available
	 *
	 * @param  Object
	 * @return void
	 */
	buildStreamData(data)
	{
		let streamData = {},
			val = "";

		for (const k of this.fieldList) {
			if (typeof this.fields[k] === "undefined") {
				continue;
			}

			let f = this.fields[k];
			let d = data[k];

			switch (f.type) {
				case "boolean":
					val = parseInt(d, 2);
					break;
				case "number":
					if (f.key === "timestamp") {
						val = Date.now();
						break;
					}
				case "id":
					val = parseInt(d, 10);
					break;
				case "json":
				case "json_a":
					if (typeof d === "string" &&
						d.length > 0) {
						val = JSON.parse(d);
					}
					break;
			}

			streamData[k] = val;
		}

		return streamData;
	}

	/**
	 * build MYSQL column/value string with appropraite default values for column types
	 *
	 * @return void
	 */
	buildFieldListSQL()
	{
		let fields = "",
			values = "",
			sep = "",
			defVal = null;

		for (const k of this.fieldList) {
			if (typeof this.fields[k] === "undefined") {
				continue;
			}

			let f = this.fields[k];

			defVal = this.buildDefaultValue(f);

			if (defVal === false) {
				continue;
			}

			fields += `${sep}${f.key}`;
			values += `${sep}'${defVal}'`;
			sep = ", ";
		}

		return `(${fields}) VALUES (${values})`;
	}

	/**
	 * retrieve an appropriate default value for the field type
	 *
	 * @param  Object
	 * @return void
	 */
	buildDefaultValue(f)
	{
		let type = f.type || "json";
		let defaultValue = "{}";

		switch (type) {
			case "boolean":
				defaultValue = "0";
				break;
			case "number":
				defaultValue = false;
				break;
			case "id":
				defaultValue = false;
				break;
			case "json":
				defaultValue = "{}";
				break;
			case "json_a":
				defaultValue = "[]";
				break;
		}

		return defaultValue;
	}

	/**
	 * compile the stream data into an object
	 *
	 * @return void
	 */
	buildFieldListObject()
	{
		let object = {},
			defVal = null;

		for (const k of this.fieldList) {
			if (typeof this.fields[k] === "undefined") {
				continue;
			}

			let f = this.fields[k];

			defVal = this.buildDefaultValueRaw(f);

			object[k] = defVal;
		}

		return object;
	}

	/**
	 * retrieve an appropriate default value for the field type (not encoded)
	 *
	 * @param  Object
	 * @return void
	 */
	buildDefaultValueRaw(f)
	{
		let type = f.type || "json";
		let defaultValue = {};

		switch (type) {
			case "boolean":
				defaultValue = 0;
				break;
			case "number":
				defaultValue = 0;
				break;
			case "id":
				defaultValue = 0;
				break;
			case "json":
				defaultValue = {};
				break;
			case "json_a":
				defaultValue = [];
				break;
		}

		return defaultValue;
	}

	/**
	 * build a field list using passed info
	 *
	 * @param  Object
	 * @return String|Boolean
	 */
	buildFieldList(fields)
	{
		let fieldList = "",
			sep = "";

		if (typeof fields !== "object" ||
			Object.keys(fields).length === 0) {
			return false;
		}

		for (let [k, v] of Object.entries(fields)) {
			let val = this.buildFieldListValue(v, this.fields[k]);

			fieldList += `${sep}${k} = '${val}'`;
			sep = ", ";
		}

		return fieldList;
	}

	/**
	 * return a clean value for the field type
	 *
	 * @param  Boolean|Number|Object
	 * @param  Object
	 * @return String|Boolean
	 */
	buildFieldListValue(v, f)
	{
		let val = "";

		switch (f.type) {
			case "boolean":
				val = v === true ? "1" : "0";
				break;
			case "number":
				val = parseInt(v, 10);
				break;
			default:
				if (typeof v === "object") {
					val = JSON.stringify(v);
				}
		}

		return val;
	}

	/**
	 * getter for field existence
	 *
	 * @param  String
	 * @return void
	 */
	fieldExists(field)
	{
		return this.dbFieldList.includes(field) === true;
	}

	/**
	 * getter for table existence
	 *
	 * @param  String
	 * @return void
	 */
	tableExists(table)
	{
		return this.dbTableList.includes(table.toLowerCase()) === true;
	}
}


module.exports = DB_MYSQL_TwitchChatBotModule;

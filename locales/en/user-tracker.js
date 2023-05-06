module.exports = {
	"user_tracker": {
		"commands": {
			"list_chatters": {
				"description": "Get a list of all the people that have chatted in the current stream.",
				"chatter_list": "There %{verb} %{count} %{description} %{chatter_count_description}: ",
				"chatters": "chatter |||| chatters",
				"chatters_verb": "is |||| are",
				"separator": ", ",
			},
			"list_actives": {
				"description": "Get a list of all the people that are currently chatting in this stream.",
			},
			"list_inactives": {
				"description": "Get a list of all the people that were chatting in the stream earlier, but have gone quiet.",
			},
		},
	},
};
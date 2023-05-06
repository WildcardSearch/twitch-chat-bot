module.exports = {
	"core": {
		"initial_sub_test": "sub test",
		"sub_test": "sub test #%{count}...",
		"init_message": "%{implementation_name} version %{implementation_version} (%{core_name} version %{core_version}) — initializing...",
		"format_time_stamp": {
			"centuries": "century |||| centuries",
			"decades": "decade |||| decades",
			"years": "year |||| years",
			"months": "month |||| months",
			"weeks": "week |||| weeks",
			"days": "day |||| days",
			"hours": "hour |||| hours",
			"minutes": "minute |||| minutes",
			"seconds": "second |||| seconds",
			"milliseconds": "millisecond |||| milliseconds",
		},
	},
};

// \$\{([[\+]{2}|[\-]{2}])?(.*)([[\+]{2}|[\-]{2}])?\}

/*

	${test}
	${test.test}
	${test_test}
	${++test}
	${test++}
	${--test}
	${test--}

*/
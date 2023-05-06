module.exports = {
	"core": {
		"initial_sub_test": "sub test",
		"sub_test": "sub test #%{count}...",
		"init_message": "%{implementation_name} version %{implementation_version} (%{core_name} version %{core_version}) — initializing...",
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
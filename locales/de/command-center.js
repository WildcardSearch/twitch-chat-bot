module.exports = {
	"command_center": {
		"command_enable": {
			"description": "Aktivieren Sie einen Chat-Befehl.",
			"input_error_message": "!enable {Chat-Befehl} eg. !enable hug",
		},
		"command_disable": {
			"description": "Deaktivieren Sie einen Chat-Befehl.",
			"input_error_message": "!disable {Chat-Befehl} eg. !disable hug",
		},
		"command_already_disabled": "Der Befehl %{command_name} ist bereits deaktiviert.",
		"command_disabled": "Der Befehl %{command_name} ist jetzt deaktiviert.",
		"command_not_disabled": "Der Befehl %{command_name} ist derzeit nicht deaktiviert.",
		"command_enabled": "Der Befehl %{command_name} ist jetzt aktiviert.",
		"command_currently_disabled": "Der Befehl \"%{command_name}\" ist derzeit deaktiviert.",
		"command_currently_enabled": "Der Befehl \"%{command_name}\" ist derzeit aktiviert.",
		"input_required": "Eingabe erforderlich",
		"input_required_message": "Verwendung: %{usage}",
		"moderation": {
			"user_blocked": "%{username}, Sie werden daran gehindert, Befehle zu verwenden, weil Sie Befehle zu schnell verwenden. Bitte fahren Sie langsamer.",
			"user_blocked_for": "%{username} Sie wurden %{seconds} Sekunden lang für die Verwendung von Befehlen gesperrt, weil Sie Befehle zu schnell verwendet haben. Bitte spielen Sie nett.",
			"timeout_reason_generic": "wiederholte Regelverstöße",
			"timeout_length": "%{smart_count} Sekunde |||| %{smart_count} Sekunden",
			"timeout_recommendation": "Moderatorinnen: Ich empfehle eine Auszeit von %{timeout_length} für %{username}.",
			"ban_reason_generic": "wiederholte Regelverstöße",
			"ban_recommendation": "Moderatorinnen: Ich empfehle, dass %{username} aus %{reason} dauerhaft vom Chat ausgeschlossen wird.",
		},
	},
};

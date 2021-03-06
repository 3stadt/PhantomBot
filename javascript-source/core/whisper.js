(function() {
    var whisperMode = $.getSetIniDbBoolean('settings', 'whisperMode', false),
        ScriptEventManager = Packages.tv.phantombot.script.ScriptEventManager,
        CommandEvent = Packages.tv.phantombot.event.command.CommandEvent;

    /** 
     * @function hasKey
     *
     * @param {array} list
     * @param {string} value
     * @param {int} subIndex
     * @returns {boolean}
     */
    function hasKey(list, value, subIndex) {
        var i;

        for (i in list) {
            if (list[i][subIndex].equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @function whisperPrefix
     *
     * @export $
     * @param {string} username
     * @param {boolean} force
     * @returns {string}
     */
    function whisperPrefix(username, force) {
        if (whisperMode || force) {
            return '/w ' + username + ' ';
        }
        return '@' + $.username.resolve(username) + ', ';
    }

    /**
     * @function getBotWhisperMode
     *
     * @export $
     * @returns {boolean}
     */
    function getBotWhisperMode() {
        return whisperMode;
    }

    /**
     * @event ircPrivateMessage
     */
    $.bind('ircPrivateMessage', function(event) {
        var sender = event.getSender(),
            message = event.getMessage(),
            arguments = '',
            split,
            command;

        if (sender.equalsIgnoreCase('jtv') || sender.equalsIgnoreCase('twitchnotify')) {
            return;
        }

        if (message.startsWith('!') && $.isMod(sender) && hasKey($.users, sender, 0)) {
            message = message.substring(1);
            if (message.includes(' ')) {
                split = message.indexOf(' ');
                command = message.substring(0, split).toLowerCase();
                arguments = message.substring(split + 1);
            } else {
                command = message;
            }

            ScriptEventManager.instance().runDirect(new CommandEvent(sender, command, arguments));            
            $.log.file('whispers', '' + sender + ': ' + message);
        }
    });

    /**
     * @event command
     */
    $.bind('command', function(event) {
        var sender = event.getSender(),
            command = event.getCommand();

        /**
         * @commandpath togglewhispermode - Toggle whisper mode
         */
        if (command.equalsIgnoreCase('togglewhispermode')) {
            whisperMode = !whisperMode;
            $.setIniDbBoolean('settings', 'whisperMode', whisperMode);
            $.say(whisperPrefix(sender) + (whisperMode ? $.lang.get('whisper.whispers.enabled') : $.lang.get('whisper.whispers.disabled')));
        }
    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        $.registerChatCommand('./core/whisper.js', 'togglewhispermode', 1);
    });

    /** Export functions to API */
    $.whisperPrefix = whisperPrefix;
    $.getBotWhisperMode = getBotWhisperMode;
})();

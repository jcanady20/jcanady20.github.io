/*jshint bitwise: false, strict: false, browser: true, jquery: true, -W069*/
/*global $, jQuery, alert, ko, console, moment, Backbone, _*/
window.enums = {
    logLevel: { debug: 1, trace: 2, info: 3, warn: 4, error: 5 }
};
_.mixin({
    log: function (obj, logLevel) {
        if (logLevel === undefined || logLevel === null) {
            logLevel = window.enums.logLevel.info;
        } else {

        }
        var debug = function  (obj) {
            if (window.console) {
                if (window.console.debug) {
                    window.console.debug(obj);
                } else {
                    window.console.log(obj);
                }
            }
        };
        var trace = function (obj) {
            if (window.console) {
                window.console.log(obj);
            }
        };
        var info = function (obj) {
            if (window.console) {
                if (window.console.info) {
                    window.console.info(obj);
                } else {
                    window.console.log(obj);
                }
            }
        };
        var warn = function (obj) {
            if (window.console) {
                if (window.console.warn) {
                    window.console.warn(obj);
                } else {
                    window.console.log(obj);
                }
            }
        };
        var error = function (obj) {
            if (window.console) {
                if (window.console.error) {
                    window.console.error(obj);
                } else {
                    window.console.log(obj);
                }
            }
        };
    }
});

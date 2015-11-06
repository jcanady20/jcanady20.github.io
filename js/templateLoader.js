/*jshint bitwise: false, strict: false, browser: true, jquery: true, -W069*/
/*global $, jQuery, alert, ko, console, moment, Backbone, _*/
(function () {
    var templateLoader = function () {
        this.cache = {};
        this.prefix = "/";
        this.suffix = ".tmpl";
        this.initialize.apply(this, arguments);
    };

    _.extend(templateLoader.prototype, {}, {
        initialize: function() {
        },
        config: function (options) {
            this.prefix = _.pick(options, 'prefix');
            this.suffix = _.pick(options, 'suffix');
        },
        loadList: function (templateList, options) {
            var _slf = this;
            var unloadedTemplates = templateList;
            _.forEach(templateList, function (tmplName) {
                var _url = _slf.prefix + tmplName + _slf.suffix;
                var resp = $.ajax({
                    url: _url,
                    method: "GET",
                    dataType: "text",
                    cache: false,
                    contentType: "text/plain"
                });
                resp.success(function (result) {
                    _slf.cache[tmplName] = _.template(result);
                    unloadedTemplates = _.without(unloadedTemplates, tmplName);
                    if (unloadedTemplates.length === 0 && _slf.complete) {
                        _slf.complete.call(_slf);
                    }
                });
            });
        },
        load: function (tmplName, options) {
            var _slf = this;
            var _url = _slf.prefix + tmplName + _slf.suffix;
            _.extend(_slf, _.pick(options, "complete"));
            var resp = $.ajax({
                url: _url,
                method: "GET",
                dataType: "text",
                cache: false,
                contentType: "text/plain"
            });
            resp.success(function (result) {
                _slf.cache[tmplName] = _.template(result);
                if (_slf.complete) {
                    _slf.complete.call(_slf);
                }
            });
            return resp;
        },
        get: function(templateName) {
            return this.cache[templateName];
        },
        compile: function (templateName, context) {
            return this.cache[templateName](context);
        }
    });
    Backbone.TemplateLoader = templateLoader;
}());

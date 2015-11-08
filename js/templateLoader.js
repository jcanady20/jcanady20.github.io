/*jshint bitwise: false, strict: false, browser: true, jquery: true, -W069*/
/*global $, jQuery, alert, ko, console, moment, Backbone, _*/
(function () {
    var templateLoader = function () {
        this.cache = {};
        this.prefix = "/tmpls/";
        this.suffix = ".tmpl";
        this.initialize.apply(this, arguments);
    };

    _.extend(templateLoader.prototype, {}, {
        initialize: function() { },
        config: function (options) {
            this.prefix = _.pick(options, 'prefix');
            this.suffix = _.pick(options, 'suffix');
        },
        loadList: function (templateList) {
            var _slf = this;
            var  dfd = $.Deferred();
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
                resp.done(function (result) {
                    _slf.cache[tmplName] = _.template(result);
                    unloadedTemplates = _.without(unloadedTemplates, tmplName);
                    if (unloadedTemplates.length === 0) {
                        dfd.resolve();
                    }
                });
            });
            return dfd.promise();
        },
        load: function (tmplName) {
            var _slf = this;
            var dfd = $.Deferred();
            var _url = _slf.prefix + tmplName + _slf.suffix;
            var resp = $.ajax({
                url: _url,
                method: "GET",
                dataType: "text",
                cache: false,
                contentType: "text/plain"
            });
            resp.done(function (result) {
                _slf.cache[tmplName] = _.template(result);
                dfd.resolve();
            });
            return dfd.promise();
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

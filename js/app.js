/*jshint bitwise: false, strict: false, browser: true, jquery: true, -W069*/
/*global $, jQuery, alert, ko, console, moment, Backbone, _*/
//    Returns the A/P Meridian indication for the Time
//    AM/PM
window.app = (function (window, $, ko, _, Backbone) {
    "use strict";
    var m_self = {};
    var m_debug = true;
    var m_router = null;
    var m_currentView = null;
    var m_templates = [];
    var m_tmplManager = new Backbone.TemplateLoader();

    var _log = function (obj) {
        if (m_debug === true && window.console !== undefined) {
            console.log(obj);
        }
    };
    m_self.log = function (obj) {
        _log(obj);
    };

    var Models = {};
    var Collections = {};
    var Views = {};
    var ViewModels = {};

    //    Models
    Models.Error = Backbone.Model.extend();

    //    Views
    Views.Empty = Backbone.View.extend({
        viewName: "Empty",
        tagName: "div",
        className: "",
        template: _.template($("#").html()),
        initialize: function () {
            _log("Initializing " + this.viewName);
        },
        render: function () {
            this.$el.empty().append(this.template(this.model.toJSON()));
            return this;
        },
        events: {}
    });

    Views.Error = Backbone.View.extend({
        viewName: "ErrorView",
        className: "modal fade",
        templateName: "error",
        template: null,
        initialize: function () {
            _log("Initializing " + this.viewName);
            this.fetchTemplate();
        },
        fetchTemplate: function () {
            var _slf = this;
            if (_slf.template === null) {
                var resp = m_tmplManager.load(_slf.templateName);
                resp.success(function (result) {
                    _slf.template = m_tmplManager.cache[_slf.templateName];
                    _slf.render();
                });
            }
        },
        render: function () {
            this.$el.empty();
            if (this.model !== null && this.template !== null) {
                var jm = this.model.toJSON();
                this.$el.append(this.template(jm));
            }
            return this;
        },
        showDialog: function () {
            this.$el.modal({
                backdrop: false,
                keyboard: false,
                show: true
            });
        },
        OnClose: function (e) {
            e.preventDefault();
            this.$el.modal('hide');
        },
        remove: function () {
            Backbone.View.prototype.remove.call(this);
        },
        events: {
            "hidden.bs.modal": "remove",
            "click .btn-close": "OnClose"
        }
    });

    Views.MainView = Backbone.View.extend({
        viewName: "MainView",
        elName: "#main-content",
        templateName: "main",
        template: null,
        initialize: function () {
            _log("Initializing " + this.viewName);
            this.render();
        },
        render: function () {
            this.$el.empty();
            if (this.template !== null) {
                this.$el.append(this.template());
                $(this.elName).append(this.$el);
            }
            return this;
        },
        fetchTemplate: function () {
            var _slf = this;
            if (_slf.template === null) {
                var resp = m_tmplManager.load(_slf.templateName);
                resp.success(function (result) {
                    _slf.template = m_tmplManager.cache[_slf.templateName];
                    _slf.render();
                });
            }
        }
    });

    var Router = Backbone.Router.extend({
        routes: {
            "": "defaultRoute"
        },
        defaultRoute: function () {
            _log("Default Route");
            if (m_currentView !== null) {
                m_currentView.remove();
            }
            m_currentView = new Views.MainView();
        }
    });

    var initialize = (function () {
        _log("Initializing Scheduler Application");
        m_router = new Router();
        //    Start the Backbone history a necessary step for bookmark-able URL's
        Backbone.history.start();
    }());

    m_self.showError = (function (title, description, status, xhr) {
        var error = buildError(title, description, status, xhr);
        var mdl = new Models.Error(error);
        var errView = new Views.Error({ model: mdl });
        errView.render().$el.appendTo("body");
        errView.showDialog();
    });

    var buildError = (function (title, description, status, xhr) {
        var errorModel = { title: title, statusText: description, status: status, data: null };
        try {
            if (xhr !== null) {
                var mr = JSON.parse(xhr.responseText);
                errorModel.data = mr;
            }
        } catch (err) {
            _log("Caught Error Parsing response");
            _log(err);
        }
        return errorModel;
    });

    return m_self;

}(window, $, ko, _, Backbone));

$(function () {
    //    Disable caching for ajax requests
    $.ajaxSetup({ cache: false });
    $(document).delegate('a[href$="#"]', "click", function (e) {
        e.preventDefault();
    });
    $(document).ajaxError(function (evenet, jqXHR, ajaxSettings, throwError) {
        var title = "";
        var statusErrorMap = {
            400: "Server understood the request but request content was invalid",
            404: "Not Found",
            401: "Unauthorized access",
            403: "Forbidden resource can not be accessed",
            500: "Internal Server Error",
            503: "Service Unavailable"
        };
        if (jqXHR.status) {
            title = statusErrorMap[jqXHR.status];
            if (!title) {
                title = "Unknown Error";
            }
        } else if (event == "parsererror") {
            title = "Failed to Parse JSON Response";
        } else if (event == "timeout") {
            title = "Request Time out";
        } else if (event == 'abort') {
            title = "Request was aborted by the server";
        } else {
            title = "Unknown Error";
        }
        window.app.showError(title, jqXHR.statusText, jqXHR.status, jqXHR);
    });
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
        window.app.showError("JavaScript Error", errorMsg, "JavaScript Error", null);
        //    Return true to tell the browser you've handled the error yourself
        //    or Return false to let the browser run its error handler as well
        return false;
    };
});
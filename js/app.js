/*jshint bitwise: false, strict: false, browser: true, jquery: true, -W069*/
/*global $, jQuery, alert, console, moment, Backbone, _*/
window.app = (function (window, $, _, Backbone) {
    "use strict";
    var m_self = {};
    var m_userName = "jcanady20";
    var m_debug = true;
    var m_router = null;
    var m_currentView = null;
    var m_header = null;
    var m_templateList = ["error", "header", "blogs", "repositories", "blog-entry", "repo-entry"];
    var m_tmplManager = null;

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
    Models.Profile = Backbone.Model.extend({
        defaults: {
            name: "",
            avatar_url: "",
            html_url: "",
            public_repos: 0,
            email: "",
            company: "",
        },
        url: "https://api.github.com/users/" + m_userName
    });
    Models.Repo = Backbone.Model.extend();
    Models.Blog = Backbone.Model.extend();
    Models.BlogCommit = Backbone.Model.extend();

    //    Collections
    Collections.Repositories = Backbone.Collection.extend({
        model: Models.Project,
        url: "https://api.github.com/users/jcanady20/repos"
    });
    Collections.Blogs = Backbone.Collection.extend({
        model: Models.Blog,
        url: "/data/blogEntries.json"
    });
    Collections.BlogCommits = Backbone.Collection.extend({
        model: Models.BlogCommit,
        url: "https://api.github.com/repos/jcanady20/jcanady20.github.io/contents/data"
    });

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
        remove: function () {
            Backbone.View.prototype.remove.call(this);
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
            this.render();
        },
        fetchTemplate: function () {
            var _slf = this;
            if (_slf.template === null) {
                var resp = m_tmplManager.load(_slf.templateName);
                resp.done(function (result) {
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
                this.$el.appendTo("body");
                this.showDialog();
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
        templateName: "blogs",
        childTemplateName: "blog-entry",
        childTemplate: null,
        childContainer: ".blog-entries",
        template: null,
        initialize: function () {
            _log("Initializing " + this.viewName);
            this.collection = new Collections.Blogs();
            this.listenTo(this.collection, "sync", this.renderChildren);
            this.listenTo(this.collection, "request", this.renderLoading);
            this.fetchTemplate();
            this.fetchChildTemplate();
            this.collection.fetch();
        },
        renderChildren: function () {
            if (this.collection === null || this.collection.length === 0) {
                _log("Thier is no collection or the collection is empty.");
                return;
            }
            if (this.childTemplate === null) {
                _log("The blog template is null, fetching the template now.");
                this.fetchChildTemplate();
                return;
            }
            this.collection.forEach(function (item) {
                var mdl = item.toJSON();
                var r = this.childTemplate(mdl);
                $(this.childContainer).append(r);
            }, this);
        },
        renderLoading: function () {
            _log("fetching blog entries");
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
            var resp = m_tmplManager.load(_slf.templateName);
            resp.done(function (result) {
                _slf.template = m_tmplManager.cache[_slf.templateName];
                _slf.render();
            });

        },
        fetchChildTemplate: function () {
            var _slf = this;
            if (_slf.childTemplate === null) {
                var resp = m_tmplManager.load(_slf.childTemplateName);
                resp.done(function (result) {
                    _slf.childTemplate = m_tmplManager.cache[_slf.childTemplateName];
                    _slf.renderChildren();
                });
            }
        },
        removeChildren: function () {
            $(this.childContainer).empty();
        },
        remove: function () {
            this.removeChildren();
            Backbone.View.prototype.remove.call(this);
        }
    });

    Views.RepositoryView = Backbone.View.extend({
        viewName: "RepositoryView",
        elName: "#main-content",
        templateName: "repositories",
        template: null,
        childTemplateName: "repo-details",
        childTemplate: null,
        initialize: function () {
            _log("Initializing " + this.viewName);
            this.collection = new Collections.Repositories();
            this.listenTo(this.collection, "sync", this.renderChildren);
            this.collection.fetch();
        },
        renderLoading: function () { },
        renderChildren: function () {
            this.collection.forEach(function (item) {
                var mdl = item.toJSON();
                _log(mdl);
            });
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
            var resp = m_tmplManager.load(_slf.templateName);
            resp.done(function (result) {
                _slf.template = m_tmplManager.cache[_slf.templateName];
                _slf.render();
            });

        },
        removeChildren: function () {
            $(this.childContainer).empty();
        },
        remove: function () {
            this.removeChildren();
            Backbone.View.prototype.remove.call(this);
        }
    });

    Views.HeaderView = Backbone.View.extend({
        viewName: "HeaderView",
        elName: "#main-header",
        className: "navbar navbar-default navbar-fixed-top",
        tagName: "nav",
        templateName: "header",
        template: null,
        initialize: function () {
            _log("Initializing " + this.viewName);
            this.model = new Models.Profile();
            this.listenTo(this.model, "sync", this.render);
            this.fetchTemplate();
            this.model.fetch();
        },
        renderChildren: function () {
            var _slf = this;
            if (this.collection === null || this.collection.length === 0) {
                _log("Thier is no collection or the collection is empty.");
                return;
            }
            var el = this.$("#project-list");
            var  tmpl = _.template('<li><a href="<%= html_url %>" title="<%= name %>"><%= name %></a></li>');
            this.collection.forEach(function (item) {
                var mdl = item.toJSON();
                var r = tmpl(mdl);
                el.append(r);
            });
        },
        render: function () {
            this.$el.empty();
            var mdl = this.model.toJSON();
            this.$el.append(this.template(mdl));
            $(this.elName).append(this.$el);
            //    Set the Document Title
            document.title = mdl.name;
            return this;
        },
        fetchTemplate: function () {
            var _slf = this;
            var resp = m_tmplManager.load(_slf.templateName);
            resp.done(function () {
                _slf.template = m_tmplManager.cache[_slf.templateName];
                _slf.render();
            });
        },
        setActiveLink: function (className) {
            this.$el.find(className)
            .addClass('active')
            .siblings()
            .removeClass('active');
        }
    });

    var Router = Backbone.Router.extend({
        routes: {
            "": "defaultRoute",
            "news(/)": "defaultRoute",
            "repos(/)":"reposRoute"
        },
        defaultRoute: function () {
            _log("Default Route");
            this.setCurrentView(new Views.MainView(), '.menu-news');
        },
        reposRoute: function () {
            _log("Project Route");
            this.setCurrentView(new Views.RepositoryView(), '.menu-repos');
        },
        removeCurrentView: function () {
            if (m_currentView !== null) {
                m_currentView.remove();
            }
        },
        setCurrentView: function (view, linkName) {
            this.removeCurrentView();
            if (linkName) {
                m_header.setActiveLink(linkName);
            }
            m_currentView = view;
        }
    });

    var initialize = (function () {
        _log("Initializing Application");
        m_tmplManager = new Backbone.TemplateLoader();
        var resp = m_tmplManager.loadList(m_templateList);
        resp.done(function () {
            m_header = new Views.HeaderView();
            m_router = new Router();
            Backbone.history.start();
        });
    }());

    m_self.showError = function (title, description, status, xhr) {
        var error = buildError(title, description, status, xhr);
        var mdl = new Models.Error(error);
        new Views.Error({ model: mdl });
    };

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

    m_self.header = function () {
        return m_header;
    };

    return m_self;

}(window, $, _, Backbone));

$(function () {
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

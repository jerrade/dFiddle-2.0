define(['plugins/router'], function (router) {
    var visibleTabs = ko.computed({
            read: function () {
                /* shell.authorizedTabs contains a list of tabs and whether they are visible or not.*/
                var tabIsVisible = true;                
                return ko.utils.arrayFilter(router.navigationModel(), function (item) {
                        ko.utils.arrayForEach(shell.tabs(), function (tab) {
                            if (item.title == tab.TabName())
                                tabIsVisible = tab.Visible();
                        });
                    if(shell.selectedImpersonateEmployee() != undefined)
                        item.hash = '#' + shell.selectedImpersonateEmployee().Username + item.hash.substr(item.hash.indexOf('/'));
                    return tabIsVisible;
                })
            },
            owner: this,
            deferEvaluation: true
        });

    var pageDetail = {};

    var shell = {
            activate: activate,
            router: router,
            waitMessage: system.waitMessage,
            tabs: ko.observableArray(),
            visibleTabs: visibleTabs,
            loggedInUsername: $('#LoggedInUsername').val(),
            impersonateUsername: undefined,
            fullName: ko.observable(),
            pageDetail: pageDetail,
            impersonableEmployees: ko.observableArray(),
            canImpersonate: ko.observable(),
            selectedImpersonateEmployee: ko.observable(),
            includeInactiveEmployees: ko.observable(false)
        };
        
    return shell;

    function activate(context) {            
        router.guardRoute = function (routeInfo, params, instance) {
            /* Default to the dashboard if nothing else is specified. */
            if (params.config.route == ':username') {
                return params.fragment + '/dashboard';
            }
            /* The login view will set a cookie with the hash part of the route. */
            var hash = $.cookie('hash');
            if (hash != null) {
                $.removeCookie('hash', { path: '/' });
                $.removeCookie('username', { path: '/' });
                return hash;
            }
            return true;
        };

        return boot();
    }

    function boot() {
        log('Electronic Time Sheets Loaded!', null, true);          

        /* Need to set the impersonateUsername before getting the page details for when a user
        enters a url with a username that isn't their own.  I hate having to extract the username
        from window.location, but there doesn't seem to be any way to access it via the router object.  */
        if(shell.impersonateUsername == undefined)
            shell.impersonateUsername = getUsernameFromWindowLocation();
        if (shell.impersonateUsername == '')
            shell.impersonateUsername = $.cookie('username');

        nav.activate();

        var routes = [
                { route: '', moduleId: 'dashboard', title: 'Dashboard', nav: false },
                { route: ':username', moduleId: 'dashboard', title: 'Dashboard', nav: false },
                { route: ':username/dashboard', moduleId: 'dashboard', title: 'Dashboard', nav: true },
                { route: ':username/myhourly', moduleId: 'myhourly', title: 'My Hourly Timesheet', nav: true },
                { route: ':username/myhourly/:date', moduleId: 'myhourly', title: 'My Hourly Timesheet', nav: false }
        ];

        return router.makeRelative({ moduleId: 'viewmodels' })
            .map(routes)
            .buildNavigationModel()
            .activate();
    }
});
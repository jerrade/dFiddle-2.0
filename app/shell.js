define(['knockout', 'durandal/system', 'plugins/router', 'dataservice', 'viewmodels/nav'], function (ko, system, router, dataservice, nav) {
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

    // gerrod: Convenience property for binding
    shell.hasEmployee = ko.computed(function() {
        return !!shell.selectedImpersonateEmployee();
    })
        
    return shell;

    function activate(context) {            
        router.guardRoute = function (routeInfo, params, instance) {
            /* Default to the dashboard if nothing else is specified. */
            if (params.config.route == ':username') {
                return params.fragment + '/dashboard';
            }
            
            return true;
        };

        return boot();
    }

    function boot() {
        console.log('Shell Loading');          

        /* Need to set the impersonateUsername before getting the page details for when a user
        enters a url with a username that isn't their own.  I hate having to extract the username
        from window.location, but there doesn't seem to be any way to access it via the router object.  */

        if(shell.impersonateUsername == undefined)
            shell.impersonateUsername = getUsernameFromWindowLocation();

        nav.activate();

        var routes = [
                { route: '', moduleId: 'dashboard', title: 'Dashboard', nav: false },
                { route: ':username', moduleId: 'dashboard', title: 'Dashboard', nav: false },
                { route: ':username/dashboard', moduleId: 'dashboard', title: 'Dashboard', nav: true },
                { route: ':username/myhourly', moduleId: 'myhourly', title: 'My Hourly Timesheet', nav: true },
                { route: ':username/myhourly/:date', moduleId: 'myhourly', title: 'My Hourly Timesheet', nav: false }
        ];

        // gerrod: OK, your problem is actually here. Since you're telling the router about your routes, it's going to ACTIVATE
        // the dashboard VM since that's what the route resolves (this has nothing to do with the router binding, though). You
        // can only defer this from happening in one of two ways - 1) Don't tell the router about the routes until your employee
        // is loaded (which is what I'm doing here), and/or 2) blocking your activate methods until the employee is loaded (which)
        // is what I'm doing in the dashboard's activate method. It's a double-whammy solution.
        return $.Deferred(function(deferred) {
            nav.hasEmployee.done(function() {
                router.makeRelative({ moduleId: 'viewmodels' })
                    .map(routes)
                    .buildNavigationModel();

                $.when(router.activate()).then(deferred.resolve, deferred.reject);
            });
        }).promise();
    }

    function getUsernameFromWindowLocation() {
        // gerrod: You can pull the activeRoute and activeInstruction from the router - not sure if that will help you... ??

        var username;

        if (window.location.hash.indexOf('/') > -1)
            username = window.location.hash.substr(window.location.hash.indexOf('#') + 1, window.location.hash.indexOf('/') - 1);
        else
            username = window.location.hash.substr(window.location.hash.indexOf('#') + 1);

        return username;
    }
});
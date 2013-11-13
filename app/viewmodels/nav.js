define(['knockout', 'plugins/router', 'dataservice'], function (ko, router, dataservice) {
    var visibleTabs = ko.computed({
        read: function () {
            /* router.navigationModel contains a list of tabs and whether they are visible or not.*/
            var tabIsVisible = true;
            return ko.utils.arrayFilter(router.navigationModel(), function (item) {
                ko.utils.arrayForEach(vm.tabs(), function (tab) {
                    if (item.title == tab.TabName())
                        tabIsVisible = tab.Visible();
                });
                if (vm.selectedImpersonateEmployee() != undefined)
                    item.hash = '#' + vm.selectedImpersonateEmployee().Username + item.hash.substr(item.hash.indexOf('/'));
                return tabIsVisible;
            })
        },
        owner: this,
        deferEvaluation: true
    });

    var vm = {
        activate: activate,
        router: router,
        title: 'nav',        
        tabs: ko.observableArray(),
        visibleTabs: visibleTabs,
        fullName: ko.observable(),
        loggedInUsername: $('#LoggedInUsername').val(),
        impersonateUsername: undefined,
        impersonableEmployees: ko.observableArray(),
        canImpersonate: ko.observable(),
        selectedImpersonateEmployee: ko.observable(),
        includeInactiveEmployees: ko.observable(false)
    };

    return vm;

    //#region Internal Methods
    function activate(context) {
        console.log('Nav View Activated');
        if (vm.impersonateUsername == undefined)
            vm.impersonateUsername = getUsernameFromWindowLocation();
        
        return dataservice.getPageDetailForEmployee(vm.loggedInUsername, vm).then(function () {
            console.log("Page details retrieved");

            ko.utils.arrayForEach(vm.impersonableEmployees(), function (item) {
                if (item.Username == vm.impersonateUsername) {
                    vm.selectedImpersonateEmployee(item);
                    return;
                }
            });

            vm.selectedImpersonateEmployee.subscribe(function (newValue) {
                dataservice.getTabsForEmployee(newValue.Username, vm.tabs).then(function () {
                    vm.impersonateUsername = newValue.Username;
                    vm.fullName(newValue.FullName);
                    router.navigate(newValue.Username);
                });
            });
        });
        console.log('Nav View Activation Complete');
    }

    function getUsernameFromWindowLocation() {
        var username;

        if (window.location.hash.indexOf('/') > -1)
            username = window.location.hash.substr(window.location.hash.indexOf('#') + 1, window.location.hash.indexOf('/') - 1);
        else
            username = window.location.hash.substr(window.location.hash.indexOf('#') + 1);

        return username;
    }
    //#endregion
});
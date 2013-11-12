define(['knockout','services/logger', 'dataservice', 'viewmodels/nav'], function (ko,logger, dataservice, nav) {
    var dashboard = {
        fullName: ko.observable(),
        hourlyUnsubmitted: ko.observableArray()
    };

    var vm = {
        activate: activate,
        dashboard: dashboard,
        title: 'Dashboard',
        refresh: refresh,
        selectedEmployee: nav.selectedImpersonateEmployee
    };

    return vm;

    function activate(username) {
        logger.log('Dashboard View Activated', null, 'dashboard', true);
        //vm.username = nav.selectedImpersonateEmployee().Username;        
        return refresh(username);
    }

    function refresh(username) {
        var d = dataservice.getDashboard(nav.impersonateUsername, dashboard).then(function () {
            if (ko.dataFor(document.getElementById("mainHeader")) == undefined) {
                ko.applyBindings(dashboard, document.getElementById("mainHeader"));
            }
        });        
        return d;
    }
});
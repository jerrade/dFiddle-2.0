define(['knockout', 'dataservice', 'viewmodels/nav'], function (ko, dataservice, nav) {
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
        console.log('Dashboard View Activated - START');

        return $.Deferred(function(deferred) {
            // gerrod: In theory we now don't actually have to wait for nav.hasEmployee, since the shell isn't resolving
            // the route until hasEmploye is done. However, you could alternatively let the shell add the route straight
            // away and just prevent activate from completing here instead...
            nav.hasEmployee.done(function(employee) {
                console.log('Dashboard View Activated - CONTINUE. Employee: ' + employee.FullName);

                //vm.username = nav.selectedImpersonateEmployee().Username;        
                $.when(refresh(username)).then(deferred.resolve, deferred.reject);
            });
        }).promise();
    }

    function refresh(username) {
        var d = dataservice.getDashboard(nav.impersonateUsername, dashboard).then(function () {
        });        
        return d;
    }
});
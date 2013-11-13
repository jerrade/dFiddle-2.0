define(['durandal/system', 'models/model'], function (system, model) {    
    var getTabsForEmployee = function (username, listObservable) {
        var options = {
            url: '/api/timesheetapi/tabs?username=' + username,
            type: 'GET',
            dataType: 'json'
        };

        system.waitMessage("Getting tabs...");

        return $.ajax(options)
            .then(querySucceeded)
            .fail(queryFailed);

        function querySucceeded(data) {
            var items = [];
            data.forEach(function (item) {
                var h = new model.ImpersonableEmployee(item);
                items.push(h);
            });
            listObservable(items);
        }

        function queryFailed(jqXHR, textStatus) {
            var msg = 'Error getting data. ' + textStatus;
            console.log(msg);
        }
    };

    var getPageDetailForEmployee = function (username, detailObservable) {      
        var options = {
            url: '/api/timesheetapi/pagedetail?username=' + username,
            type: 'GET',
            dataType: 'json'
        };

        system.waitMessage("Getting employees...");

        return $.ajax(options)
            .then(querySucceeded)
            .fail(queryFailed);

        function querySucceeded(data) {
            //var tabs = [];
            //data.Tabs.forEach(function (item) {
            //    var h = new model.MainTab(item);
            //    tabs.push(h);
            //});
            var pd = new model.PageDetail(data);
            detailObservable.impersonableEmployees = pd.ImpersonableEmployees;
            detailObservable.canImpersonate = pd.CanImpersonate;

            //detailObservable.pageDetail = new model.PageDetail(data);
            //detailObservable.canImpersonate(data.CanImpersonate);
        }

        function queryFailed(jqXHR, textStatus) {
            var msg = 'Error getting data. ' + textStatus;
            console.log(msg);
        }
    };

    var getDashboard = function (username, dashboardObservable) {      
        var options = {
            url: '/api/timesheetapi/dashboard?username=' + username,
            type: 'GET',
            dataType: 'json'
        };

        system.waitMessage("Getting dashboard...");

        return $.ajax(options)
            .then(querySucceeded)
            .fail(queryFailed);

        function querySucceeded(data) {
            var items = [];
            data.HourlyUnsubmitted.forEach(function (item) {
                var h = new model.HourlyUnsubmitted(item);
                items.push(h);
            });
            dashboardObservable.fullName(data.FullName);
            dashboardObservable.hourlyUnsubmitted(items);
        }

        function queryFailed(jqXHR, textStatus) {
            var msg = 'Error getting data. ' + textStatus;
            console.log(msg);
        }
    };

    var dataservice = {
        getTabsForEmployee: getTabsForEmployee,
        getPageDetailForEmployee: getPageDetailForEmployee,
        getDashboard: getDashboard
    };

    return dataservice;
});
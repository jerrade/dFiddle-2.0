define(['durandal/system', 'models/model'], function (system, model) {
    var getImpersonableEmployees = function (listObservable) {
        var options = {
            url: '/api/timesheetapi/impersonableemployees',
            type: 'GET',
            dataType: 'json'
        };

        system.waitMessage("Getting employees...");

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
        //dashboardObservable.hourlyUnsubmitted = ko.observableArray();        

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

    var getHourlyListForEmployee = function (username, listObservable) {       
        var options = {
            url: '/api/timesheetapi/hourlylistforemployee?username=' + username,
            type: 'GET',
            dataType: 'json'
        };

        system.waitMessage("Getting time sheets...");

        return $.ajax(options)
            .then(querySucceeded)
            .fail(queryFailed);

        function querySucceeded(data) {
            //var dashboard = {};

            var items = [];
            data.forEach(function (item) {
                var h = new model.HourlyPartialForDropdown(item);
                items.push(h);
            });
            listObservable(items);
        }

        function queryFailed(jqXHR, textStatus) {
            var msg = 'Error getting data. ' + textStatus;
            console.log(msg);
        }
    };

    var getHourlyTimesheet = function (username, dateHash, timesheetObservable) {
        var options = {
            url: '/api/timesheetapi/hourlytimesheet?username=' + username + '&dateHash=' + dateHash,
            type: 'GET',
            dataType: 'json'
        };

        system.waitMessage("Getting time sheet...");

        return $.ajax(options)
            .then(querySucceeded)
            .fail(queryFailed);

        function querySucceeded(data) {
            timesheetObservable.hourlyTimesheet(new model.HourlyTimesheet(data));
        }

        function queryFailed(jqXHR, textStatus) {
            var msg = 'Error getting data. ' + textStatus;
            console.log(msg);
        }
    };

    var dataservice = {
        getImpersonableEmployees: getImpersonableEmployees,
        getTabsForEmployee: getTabsForEmployee,
        getPageDetailForEmployee: getPageDetailForEmployee,
        getDashboard: getDashboard,
        getHourlyListForEmployee: getHourlyListForEmployee,
        getHourlyTimesheet: getHourlyTimesheet,
    };

    return dataservice;
});
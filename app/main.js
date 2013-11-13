requirejs.config({
    paths: {
        'text': '../lib/require/text',
        'durandal': '../lib/durandal/js',
        'plugins': '../lib/durandal/js/plugins',
        'transitions': '../lib/durandal/js/transitions',
        'knockout': [
            '//cdnjs.cloudflare.com/ajax/libs/knockout/2.3.0/knockout-debug',
            '../lib/knockout/knockout-2.3.0'
        ],
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
            '../lib/jquery/jquery-1.9.1.min'
        ],
        'jquery.mockjax': '//cdnjs.cloudflare.com/ajax/libs/jquery-mockjax/1.5.2/jquery.mockjax',
        'knockout.mapping': '//cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.3.5/knockout.mapping'
    },
    shim:{
        'jquery.mockjax': {
            deps: ['jquery'],
            exports: 'jQuery.fn.mockjax'
        } ,
        'knockout.mapping': {
            deps: ['knockout'],
            exports: 'knockout.fn.mapping'
        }           
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'knockout', 'jquery.mockjax', 'knockout.mapping'], function( system, app, viewLocator, ko, mockjax, mapping) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'Durandal Samples';

    //specify which plugins to install and their configuration
    app.configurePlugins({
        router: true,
        dialog: true,
        widget: {
            kinds: ['expander']
        }
    });

    $.mockjax({        
        url: '/api/timesheetapi/pagedetail?username=test',
        responseTime: 750,
        responseText: {
            "CanImpersonate":true,
            "ImpersonableEmployees":[{"ID":123456,"Username":"test","FullName":"test, test"},
                                    {"ID":123457,"Username":"boba","FullName":"Anderson, Bob"},
                                    {"ID":123458,"Username":"chrisc","FullName":"Cooper, Chris"}]
        }
    });

    $.mockjax({
        url: '/api/timesheetapi/dashboard?username=test',
        responseTime: 750,
        responseText: {
            "HourlyUnsubmitted":[],
            "FullName":"Test Test"
        }
    });

    app.start().then(function() {
        system.waitMessage = ko.observable();

        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application.
        app.setRoot('shell');
    });
});
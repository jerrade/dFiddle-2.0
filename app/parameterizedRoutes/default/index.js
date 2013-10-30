define(['durandal/app', 'durandal/system', 'knockout'], function( app, system, ko ) {

    return {
        name: ko.observable(),
        users: ko.observableArray([{username: 'alice', fullName: 'Alice Cooper'}, 
            {username: 'bob', fullName: 'Bob Gates'},
            {username: 'charlie', fullName: 'Charlie Sheen'}
            ]),
        selectedUser: ko.observable(),

        activate: function() {
            system.log('Lifecycle : activate : parameterized-routes');
        },
        binding: function() {
            system.log('Lifecycle : binding : parameterized-routes');
            return { cacheViews: false }; //cancels view caching for this module, allowing the triggering of the detached callback
        },
        bindingComplete: function() {
            system.log('Lifecycle : bindingComplete : parameterized-routes');
        },
        attached: function( view, parent ) {
            system.log('Lifecycle : attached : parameterized-routes');
        },
        compositionComplete: function( view ) {
            system.log('Lifecycle : compositionComplete : parameterized-routes');
        },
        detached: function( view ) {
            system.log('Lifecycle : detached : parameterized-routes');
        }
    };
});
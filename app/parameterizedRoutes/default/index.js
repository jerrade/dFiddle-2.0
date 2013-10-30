define(['durandal/app', 'durandal/system', 'knockout'], function( app, system, ko ) {

    return {
        name: ko.observable(),
        users: ko.observableArray([{username: 'alice', fullName: 'Alice Cooper'}, 
            {username: 'bob', fullName: 'Bob Gates'},
            {username: 'charlie', fullName: 'Charlie Sheen'}
            ]),
        selectedUser: ko.observable(),

        activate: function() {
            system.log('Lifecycle : activate : hello');
        },
        binding: function() {
            system.log('Lifecycle : binding : hello');
            return { cacheViews: false }; //cancels view caching for this module, allowing the triggering of the detached callback
        },
        bindingComplete: function() {
            system.log('Lifecycle : bindingComplete : hello');
        },
        attached: function( view, parent ) {
            system.log('Lifecycle : attached : hello');
        },
        compositionComplete: function( view ) {
            system.log('Lifecycle : compositionComplete : hello');
        },
        detached: function( view ) {
            system.log('Lifecycle : detached : hello');
        }
    };
});
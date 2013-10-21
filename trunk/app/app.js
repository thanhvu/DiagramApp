var app = angular.module('app', ['ui.bootstrap','mongolabResource','wijmo']);

//declare DBName && API key for mongolab API
app.constant('API_KEY', 'IwSa5arjX44ZDRAQXdI8sV2weKfGfe4E');
app.constant('DB_NAME', 'diagram');




//route configuration

//app.config(function($routeProvider){
//    $routeProvider.
//        when('/editor',{
//            controller: 'DiagramCtrl',
//            templateUrl: 'views/Editor.html'
//        }).
//        when('/history',{
//            templateUrl:'views/History.html'
//        });
//})









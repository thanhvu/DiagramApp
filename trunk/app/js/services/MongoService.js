app.factory('mongoService', function($http) {
    var API_KEY = 'IwSa5arjX44ZDRAQXdI8sV2weKfGfe4E'
    var DB_NAME = 'diagram'

    return{
        getEIPPalette: function(){
            var collectionName = "nodes"
            //var url='https://api.mongolab.com/api/1/databases/diagram/collections/Nodes?apiKey=IwSa5arjX44ZDRAQXdI8sV2weKfGfe4E'
            //var url ='https://api.mongolab.com/api/1/databases/' + DB_NAME + '/collections/' + collectionName + '?apiKey='+API_KEY
            var url = "https://api.mongolab.com/api/1/databases/diagram/collections/Nodes?apiKey=IwSa5arjX44ZDRAQXdI8sV2weKfGfe4E";
            return $http.get(url);
        },
        getTemplate: function(){
            var url = "https://api.mongolab.com/api/1/databases/diagram/collections/Template?apiKey=IwSa5arjX44ZDRAQXdI8sV2weKfGfe4E";
            return $http.get(url);

        }

    }

})

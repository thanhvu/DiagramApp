app.service("RuntimeService",function(){

    flagLinkEnter =0

    return{
        flagLinkEnter :0,
        TempLocLinkEnter: null,
        GlobfromNode :null,
        GlobtoNode :null,
        LinkFromHold :null,
        LinkHoldTo :null,
        minx : 9999999999,
        miny : 9999999999,
        tempLinkArray : new Array(),
        tempExternalLinkArray : new Array()
    }
})

app.factory('Data',function(){
    return {message:"hello there"}
})
app.controller('firstCtrl',function($scope,Data){
    $scope.data = Data;

})
app.filter('reverse',function(){
    return function(text){
        return text.split("").reverse().join("");
    }
})
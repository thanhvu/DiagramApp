//
// test/unit/controllersSpec.js
//
describe('DiagramCtrl function',function(){

    var scope;

    beforeEach(inject(function($rootScope,$controller){
        scope = $rootScope.$new();
        var ctrl = $controller(DiagramCtrl,{$scope:scope});
    }))

    if('should set the default value of Pattern list',function(){
        expect(scope.list.length).toBe(11);

    });
})


describe('directives LayoutSelector', function () {

    var elm, scope, $compile , mockService;

    //load module app before each test
    beforeEach(module('app'))

    //inject services before each it function
    beforeEach(inject(function ($rootScope, _$compile_,DiagramService) {
        mockService = DiagramService

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;


        scope.LayoutList =[
            {value:"normal",name:"normal Layout"},
            {value:"grid",name:"Grid Layout"},
            {value:"tree",name:"Tree Layout"},
            {value:"Digraph",name:"Layered Digraph"},
            {value:"Circular",name:"Circular Layour"}
        ]
        //set html element then run the compiled view
        html ='<layoutholder></layoutholder><div id="myDiagram">hello</div>'
        element = $compile(html)(scope);


        scope.$apply();
    }));

    afterEach(inject(function($rootElement){
        $rootElement.remove();
    }))


      var triggerClickOn = function(elm) {
        var event = document.createEvent('MouseEvents');
        // https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent
        event.initMouseEvent('click', true, true, window);
        elm.dispatchEvent(event);
    };

    //spec
    it('should display all the option correctly',function(){
        elm = element.find('option')

        expect(elm.eq(0).text()).toEqual(scope.LayoutList[0].name)
        expect(elm.eq(1).text()).toEqual(scope.LayoutList[1].name)
        expect(elm.eq(2).text()).toEqual(scope.LayoutList[2].name)
        expect(elm.eq(3).text()).toEqual(scope.LayoutList[3].name)
        expect(elm.eq(4).text()).toEqual(scope.LayoutList[4].name)


    })

    //spec
    it('should update the view on model change', function() {
        scope.$apply(function() {
            scope.LayoutType = {value:"tree",name:"Tree Layout"}
           // scope.LayoutType.name = "Grid Layout"

        });
        //alert(element.eq(1).html())
        mockService.InitDiagram()
        myDiagram= mockService.getDiagram();
        alert(myDiagram)

          //alert(elm.eq(1).html())
        //alert(elm.eq(1).prop('selected'))
      // expect(elm.eq(1).prop('selected')).toBe(true);


    });


    //spec
    it('should update the model on view change', function() {

        //elm.eq(1)[0].click();
      //  expect(scope.LayoutType.value).toBe("grid")
        //triggerClickOn(elm.eq(2)[0])
        // alert(scope.LayoutType.name)
//        expect(scope.LayoutType.name).toEqual('Tree Layout')
//
//       // triggerClickOn(elm.eq(0)[0]); // check normal
//        elm.eq(0)[0].click()       ;
//        expect(scope.LayoutType).toEqual('normal');
//
//        triggerClickOn(elm.eq(2)[0]); // check
//        expect(scope.LayoutType).toEqual(['a', 'c']);
//
//        triggerClickOn(elm.eq(0)[0]); // uncheck a
//        expect(scope.LayoutType).toEqual(['c']);
    });







})
//describe('directives DefaultPattern Selector',function(){
//    var elm, scope;
//
//    beforeEach(inject(function ($rootElement, $compile, $rootScope){
//        //create a scope
//        scope = $rootScope;
//        scope.DPType={}
//        scope.DPList =[
//            {value:"aggregator"},
//            {value:"delay"},
//            {value:"messagefilter"},
//            {value:"router"},
//            {value:"when"},
//            {value:"recipientlist"},
//            {value:"messagetranslator"},
//            {value:"resequencer"}
//
//        ]
//
//        //set html element
//        $rootElement.html(
//            '<!--Default Pattern selector-->' +
//                '<div id="DPholder" style="float:right">' +
//                '<b> Default Pattern</b>' +
//                '<select id="defaultPattern" ng-options="item.value for item in DPList"ng-model="DPType" ng-change="changeDefaultPattern()">' +
//                '</select>' +
//                '</div> '
//        )
//
//        angular.element(document.body).append($rootElement);
//
//        //compile the element into function to process the view
//        $compile($rootElement)(scope)
//
//        //then run the compiled view
//        scope.$apply();
//
//        elm = $rootElement.find('option');
//
//    }))
//
//    afterEach(inject(function($rootElement){
//        $rootElement.remove();
//    }))
//
//    var triggerClickOn = function(elm) {
//        var event = document.createEvent('MouseEvents');
//        // https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent
//        event.initMouseEvent('click', true, true, window);
//        elm.dispatchEvent(event);
//    };
//
//    //spec
//    it('should display all the option correctly',function(){
//        expect(elm.eq(1).text()).toEqual(scope.DPList[0].value)
//        expect(elm.eq(2).text()).toEqual(scope.DPList[1].value)
//        expect(elm.eq(3).text()).toEqual(scope.DPList[2].value)
//        expect(elm.eq(4).text()).toEqual(scope.DPList[3].value)
//        expect(elm.eq(5).text()).toEqual(scope.DPList[4].value)
//        expect(elm.eq(6).text()).toEqual(scope.DPList[5].value)
//        expect(elm.eq(7).text()).toEqual(scope.DPList[6].value)
//        expect(elm.eq(8).text()).toEqual(scope.DPList[7].value)
//
//    })
//
//    //spec
//    it('should update the view on model change', function() {
//        scope.$apply(function() {
//            scope.DPType = [{value:"aggregator"}];
//        });
//
//        expect(elm.eq(1).prop('selected')).toBe('true');
//
//    });
//
//
//    //spec
//    it('should update the model on view change', function() {
//
//
//        (elm.eq(2)[0]).click();
//        triggerClickOn(elm.eq(1)[0])
//        // alert(scope.LayoutType.name)
//        expect(scope.DPType.value).toEqual('normal layout')
//
//        // triggerClickOn(elm.eq(0)[0]); // check normal
//        elm.eq(0)[0].click()       ;
//        expect(scope.DPType.value).toEqual('normal');
//
//        triggerClickOn(elm.eq(2)[0]); // check
//        expect(scope.DPType.value).toEqual(['a', 'c']);
//
//        triggerClickOn(elm.eq(0)[0]); // uncheck a
//        expect(scope.DPType.value).toEqual(['c']);
//    });
//
//})




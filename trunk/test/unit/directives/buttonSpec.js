describe('Testing Zoom out button directive', function () {

    var elm, scope, $compile , mockService;

    //load module app before each test
    beforeEach(module('app'))



    //inject services
    beforeEach(inject(function ($rootScope, _$compile_,DiagramService) {
            mockService = DiagramService

            $compile = _$compile_
            //store references to $rootScope
            scope = $rootScope;
        }));

        it('should create button contains the template content', function () {

            //set html element
            //compile the element into function to process the view
            //then run the compiled view
            element = $compile("<ZoomOut></ZoomOut>")(scope);

            //call digest on the scope which fired all the watchers
            scope.$digest();

            //check that the compiled element contains the template content
            expect(element.html()).toContain("Zoom Out");

//            expect(angular.isFunction(mockService.Init)).toBe(true);
//            expect(angular.isFunction(mockService.Init1)).toBe(true);
//            mockService.Init()
//            alert(mockService.getDiagram());

        });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing Zoom in button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        //compile the element into function to process the view
        //then run the compiled view
        element = $compile("<ZoomIn></ZoomIn>")(scope);


         //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Zoom In");

    });

})
describe('Testing Cut button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        //compile the element into function to process the view
        //then run the compiled view
        element = $compile("<Cut></Cut>")(scope);



        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Cut");

    });







})
describe('Testing Copy button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<Copy></Copy>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Copy");





    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing Paste button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<Paste></Paste>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Paste");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing Delete button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<Delete></Delete>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Delete");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing Group button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<Group></Group>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Group");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing UnGroup button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<UnGroup></UnGroup>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Ungroup");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing undo button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<Undo></Undo>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Undo");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing Redo button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<Redo></Redo>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Redo");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing ZoomToFit button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<ZoomtoFit></ZoomtoFit>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("Zoom to Fit");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})
describe('Testing SelectAll button directive', function () {

    var elm, scope, $compile;

    //load module app before each test
    beforeEach(module('app'))

    //inject services
    beforeEach(inject(function ($rootScope, _$compile_) {

        $compile = _$compile_
        //store references to $rootScope
        scope = $rootScope;
    }));

    it('should create button contains the template content', function () {

        //set html element
        element = $compile("<SelectAll></SelectAll>")(scope);
        //compile the element into function to process the view
        //then run the compiled view


        //call digest on the scope which fired all the watchers
        scope.$digest();

        //check that the compiled element contains the template content
        expect(element.html()).toContain("SelectAll");




    });

//        it('should get called on a click', inject(function () {
//
//            scale = DiagramService.getDiagram().scale
//            // click the element
//            elm[0].click();
//
//
//            expect(DiagramService.getDiagram().model.addChangedListener(function (e) {
//
//                if (e.change == go.ChangedEvent.Transaction && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
//                    return 1
//
//                }
//
//            })).ToBe(1);
//
//            //check if the scale is decreased or not
//            expect(DiagramService.getDiagram().scale).toBeLessThan(scale)
//        }))





})

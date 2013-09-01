describe('DiagramService unit test',function(){
    var mockSvc;

    //excuted before each "it" is run
    beforeEach(function(){

        // load the module
        module('app')

        //inject DiagramService
        inject(function(DiagramService){
            mockSvc =  DiagramService
        })

    })


    //check to see if it has the expected function
    it('should have an Init function',function(){
        expect(angular.isFunction(mockSvc.Init)).toBe(true);
        expect(angular.isFunction(mockSvc.LoadNodeTemplate)).toBe(true);

    })

    //check to see if it does what it's supposed to do
    it('should initialize important variables',function(){
        var myDiagram;
        mockSvc.Init();

    })

})

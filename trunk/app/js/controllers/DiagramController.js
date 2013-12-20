app.controller("DiagramCtrl",['$scope','DiagramService','RuntimeService','mongoService',function ($scope,DiagramService,RuntimeService,mongoService){

//    $scope.nodes = Node.query();
    mongoService.getEIPPalette().success(function(EIPNodes){
        $scope.nodes = EIPNodes
        DiagramService.Init($scope.nodes);
        myDiagram = DiagramService.getDiagram();
        myDiagram.isModified = false;
        $$ = DiagramService.getGoMake();
        Init();
    });



    function Init()
    {
        DiagramService.newDocument()
        DiagramService.LocalStorage()
//        DiagramService.DefineUndoDiagram($$)
        DiagramService.LoadNodeTemplate($$)
        DiagramService.LoadLinkTemplate()
        DiagramService.LoadGroupTemlate()
        DiagramService.ContextMenu()
        DiagramService.LoadPalette()
        DiagramService.LoadBasicShapePalette()
        DiagramService.LoadFlowPalette()
        DiagramService.LoadpFlowPalette()
        DiagramService.LoadFurPalette()
        DiagramService.LoadSettings()
        DiagramService.ChangedSelection()
        DiagramService.SelectionMoved()
      //  undoDisplay = DiagramService.getUndoDisplay();
        DiagramService.ExternalObjectsDroppedListener(RuntimeService, myDiagram)
        DiagramService.addChangedListener(myDiagram)
        DiagramService.mouseDrop(RuntimeService,myDiagram)
        DiagramService.mouseDragOver(RuntimeService,myDiagram)

        DiagramService.SetCustomLinkingTool()
        DiagramService.SetCustomPanningTool()
        DiagramService.LinkDraw()
    }
    $scope.ReLoad = function(){
        DiagramService.getBSPalette().requestUpdate();
        DiagramService.getFlowPalette().requestUpdate();
        DiagramService.getPflowPalette().requestUpdate();
        DiagramService.getFurPalette().requestUpdate();
    }


    $scope.list = DiagramService.getNodeArray();
//    $scope.type=""
//    $scope.selection = DiagramService.getDiagram().selection.first();
//
//    $scope.$watch('type', function() { alert('change') });
//    //$scope.type = DiagramService.getDiagram().selection.first().data.type;


}])
app.controller("DiagramCtrl",['$scope','DiagramService','RuntimeService','Node',function ($scope,DiagramService,RuntimeService,Node){

    $scope.nodes = Node.query();

    DiagramService.Init($scope.nodes);
    myDiagram = DiagramService.getDiagram();
    myDiagram.isModified = false;

    $$ = DiagramService.getGoMake();
    Init();

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
      //  undoDisplay = DiagramService.getUndoDisplay();
        DiagramService.ExternalObjectsDroppedListener(RuntimeService, myDiagram)
        //DiagramService.addChangedListener(myDiagram)
        DiagramService.mouseDrop(RuntimeService,myDiagram)
        DiagramService.mouseDragOver(RuntimeService,myDiagram)

        DiagramService.SetCustomLinkingTool()
        DiagramService.SetCustomPanningTool()

    }

    $scope.list = DiagramService.getNodeArray();
//    $scope.type=""
//    $scope.selection = DiagramService.getDiagram().selection.first();
//
//    $scope.$watch('type', function() { alert('change') });
//    //$scope.type = DiagramService.getDiagram().selection.first().data.type;


}])
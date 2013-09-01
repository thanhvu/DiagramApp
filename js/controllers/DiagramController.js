app.controller("DiagramCtrl",['$scope','DiagramService','RuntimeService',function ($scope,DiagramService,RuntimeService){

    DiagramService.Init();
    myDiagram = DiagramService.getDiagram();
    $$ = DiagramService.getGoMake();
    Init();



    function Init()
    {

        DiagramService.LoadNodeTemplate($$)
        DiagramService.LoadLinkTemplate()
        DiagramService.LoadGroupTemlate()
        DiagramService.ContextMenu()
        DiagramService.LoadPalette()
        DiagramService.LoadSettings()
        DiagramService.ExternalObjectsDroppedListener(RuntimeService, myDiagram)
        DiagramService.addChangedListener(myDiagram)
        DiagramService.mouseDrop(RuntimeService,myDiagram)
        DiagramService.mouseDragOver(RuntimeService,myDiagram)
        DiagramService.SetCustomLinkingTool()
        DiagramService.SetCustomPanningTool()
        DiagramService.DefineUndoDiagram($$)
    }

    $scope.list = DiagramService.getNodeArray();

}])


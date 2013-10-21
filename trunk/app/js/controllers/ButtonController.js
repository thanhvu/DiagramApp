app.controller("buttonCtrl",function ($scope,DiagramService){

    $scope.Diagram = DiagramService.myDiagram;
    $scope.threshold = DiagramService.threshold;

    $scope.ZoomIn = function(){
        $scope.Diagram.commandHandler.increaseZoom();
    }
    $scope.SelectAll = function(){
        $scope.Diagram.commandHandler.selectAll();
    }
    $scope.Cut = function(){
        $scope.Diagram.commandHandler.cutSelection();
    }
    $scope.Copy = function(){
        $scope.Diagram.commandHandler.copySelection();
    }
    $scope.Paste = function(){
        $scope.Diagram.commandHandler.pasteSelection();
    }
    $scope.Delete = function(){
        $scope.Diagram.commandHandler.deleteSelection();
    }
    $scope.Group = function(){
        $scope.Diagram.commandHandler.groupSelection();
    }
    $scope.Ungroup = function(){
        $scope.Diagram.commandHandler.ungroupSelection() ;
    }
    $scope.Undo = function(){
        $scope.Diagram.commandHandler.undo();
    }
    $scope.Redo = function(){
        $scope.Diagram.commandHandler.redo();
    }
    $scope.ZoomtoFit = function(){
        $scope.Diagram.zoomToFit();
    }
    $scope.textManipulation = function(feature){
        DiagramService.textManipulation(feature)
    }

})

//searc Controller
app.controller("SearchCtrl",function($scope,DiagramService){
    NodeArray = DiagramService.ListNode

    $scope.list = [
        {category:'aggregator', description:NodeArray[0].des},
        {category:'delay', description:NodeArray[1].des},
        {category:'messagefilter', description:NodeArray[2].des},
        {category:'router', description:NodeArray[3].des},
        {category:'when', description:NodeArray[4].des},
        {category:'recipient list', description:NodeArray[5].des},
        {category:'messagetranslator', description:NodeArray[6].des},
        {category:'resequencer', description:NodeArray[7].des},
        {category:'comment', description:NodeArray[8].des},
        {category:'queue', description:NodeArray[9].des},
        {category:'CXF', description:NodeArray[10].des}
    ];

    $scope.display = function(e){
        $scope.DisplayList = [];
        var NDarray = myPalette.model.nodeDataArray;
        for (var i=0; i<=NDarray.length-1;i++)
            $scope.DisplayList.push(NDarray[i]);

    }


})

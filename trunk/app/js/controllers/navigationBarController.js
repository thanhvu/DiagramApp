app.controller('NavBarCtrl',['$scope','DiagramService',function($scope,DiagramService){

    $scope.myDiagram = DiagramService.getDiagram();
    $scope.ZoomIn = function(){
        DiagramService.getDiagram().commandHandler.increaseZoom();
    }
    $scope.SelectAll = function(){
        DiagramService.getDiagram().commandHandler.selectAll();
    }
    $scope.Cut = function(){
        DiagramService.getDiagram().commandHandler.cutSelection();
    }
    $scope.Copy = function(){
        DiagramService.getDiagram().commandHandler.copySelection();
    }
    $scope.Paste = function(){
        DiagramService.getDiagram().commandHandler.pasteSelection();
    }
    $scope.Delete = function(){
        DiagramService.getDiagram().commandHandler.deleteSelection();
    }
    $scope.Group = function(){
        DiagramService.getDiagram().commandHandler.groupSelection();
    }
    $scope.Ungroup = function(){
        DiagramService.getDiagram().commandHandler.ungroupSelection() ;
    }
    $scope.Undo = function(){
        DiagramService.getDiagram().commandHandler.undo();

    }
    $scope.Redo = function(){
        DiagramService.getDiagram().commandHandler.redo();
    }
    $scope.ZoomtoFit = function(){
        DiagramService.getDiagram().zoomToFit();
    }
    $scope.Exclude = function(){
        DiagramService.getDiagram().startTransaction("exclude a node");
        if (obj.part.adornedPart.containingGroup.memberParts.count==1)
        {
            EmptyGroup =obj.part.adornedPart.containingGroup;
            obj.part.adornedPart.containingGroup=null;
            DiagramService.getDiagram().remove(EmptyGroup);
        }
        else
            obj.part.adornedPart.containingGroup=null;


        DiagramService.getDiagram().commitTransaction("exclude a node");
    }
    $scope.GridLayout = function(){
       DiagramService.getDiagram().layout =$$(go.GridLayout,
        { comparer: go.GridLayout.smartComparer });
    }

    $scope.NormalLayout = function(){
        DiagramService.getDiagram().layout = new go.Layout()
    }
    $scope.TreeLayout = function(){
        DiagramService.getDiagram().layout = $$(go.TreeLayout, {
            comparer: go.LayoutVertex.smartComparer  // have the comparer sort by numbers as well as letters
            // other properties are set by the layout function, defined below
        });
    }
    $scope.DigraphLayout = function(){
        DiagramService.getDiagram().layout = $$(go.LayeredDigraphLayout, { isOngoing: false, layerSpacing: 50 });

    }
    $scope.CircularLayout = function(){
        DiagramService.getDiagram().layout = new go.CircularLayout()

    }
    $scope.relayout = function (){
        DiagramService.getDiagram().layoutDiagram(true);
    }

}])

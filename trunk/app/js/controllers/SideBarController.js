app.controller("sidebarCtrl",function ($scope,DiagramService){
    $scope.corx=0;
    $scope.cory=0;
    $scope.nodewidth =0;
    $scope.nodeheight=0;
    $scope.angle=0;
    $scope.scale=0;

    $scope.list = [];
    $scope.text = '';
    $scope.id=0;
    $scope.submit = function() {
        if (this.text) {
            $scope.id+=1;
            this.list.push({text:this.text,id:$scope.id});
            this.text = '';
        }
    };
    $scope.ChangeXcor = function(val){

        if (val==="x"){
            DiagramService.changeCor(val,$scope.corx)
        }
        else
        {
            DiagramService.changeCor(val,$scope.cory)

        }


    }
    $scope.update = function(){
        DiagramService.getBSPalette().requestUpdate();
        //alert("in")
    }
    $scope.ChangeWidth = function(width){
        DiagramService.changeWidth(width)

    }

    $scope.ChangeHeight = function(height){
        DiagramService.changeHeight(height)

    }
})

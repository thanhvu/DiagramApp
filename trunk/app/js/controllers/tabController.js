var TabsController = function($scope, $element) {
    var panes = $scope.panes = [];

    $scope.select = function(pane) {
        angular.forEach(panes, function(pane) {
            pane.selected = false;
        });
        pane.selected = true;
    };

    this.addPane = function(pane) {
        if (!panes.length) $scope.select(pane);
        panes.push(pane);
    };
};

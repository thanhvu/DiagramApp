app.controller('NavBarCtrl',['$scope','DiagramService','$modal','$log',function($scope,DiagramService,$modal,$log){

    $scope.myDiagram = DiagramService.getDiagram();
    myDiagram = DiagramService.getDiagram();
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
    $scope.AlignLeft = function(){
        DiagramService.getDiagram().commandHandler.alignLeft();
    }
    $scope.AlignRight = function(){
        DiagramService.getDiagram().commandHandler.alignRight();
    }
    $scope.AlignTop = function(){
        DiagramService.getDiagram().commandHandler.alignTop();
    }
    $scope.AlignBottom = function(){
        DiagramService.getDiagram().commandHandler.alignBottom();
    }
    $scope.AlignCenterX = function(){
        DiagramService.getDiagram().commandHandler.alignCenterX();
    }
    $scope.AlignCenterY = function(){
        DiagramService.getDiagram().commandHandler.alignCenterY();
    }
    $scope.Rotate = function(angel){
        DiagramService.getDiagram().commandHandler.rotate(angel);
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

    $scope.mode = function(draw){
        DiagramService.FreeHandMode(draw);
    }
    $scope.PolyMode = function(draw,Poly){
        DiagramService.PolylineMode(draw,Poly)
    }



    $scope.items = ['item1', 'item2', 'item3'];

    $scope.open = function () {

//        var modalInstance = $modal.open({
//            templateUrl: 'myModalContent.html',
//            controller: ModalInstanceCtrl,
//            resolve: {
//                items: function () {
//                    return $scope.items;
//                }
//            }
//        });
//
//        modalInstance.result.then(function (selectedItem) {
//            $scope.selected = selectedItem;
//        }, function () {
//            $log.info('Modal dismissed at: ' + new Date());
//        });


        if (checkLocalStorage()) {
            if (myDiagram.isModified) {
                var fileName = document.getElementById("currentFile").textContent;
                var save = confirm("Would you like to save changes to " + fileName + "?");
                if (save) {
                    if (fileName == UnsavedFileName) {
                        saveDocumentAs();
                    } else {
                        saveDocument();
                    }
                }
            }
//            var openDocument = document.getElementById("openDocument");
//            openDocument.style.visibility = "visible";
        }

        $('.ui.modal.open')
            .modal('setting', 'closable', false)
            .modal('show')
        ;

    };
    window.onbeforeunload = function() {
        if (myDiagram.isModified)
            return 'You have unsaved changes!';
    }
    $scope.saveDocument = function(){
        if (checkLocalStorage()) {
            var currentFile = document.getElementById("currentFile");
            var str = myDiagram.model.toJson();
            localStorage.setItem(currentFile.textContent, str);
            myDiagram.isModified = false;
        }

    }

    function checkLocalStorage() {
        if (typeof(Storage) == "undefined" || navigator.appName == "Microsoft Internet Explorer") {
            alert("Sorry! No web storage support. \n If you're using Internet Explorer, you must load the page from a server for local storage to work.");
            return false;
        }
        return true;
    }

    $scope.saveDocumentAs = function(){
        if (checkLocalStorage()) {
            var saveName = prompt("Save file as...");
            if (saveName) {
                var str = myDiagram.model.toJson();
                localStorage.setItem(saveName, str);
                myDiagram.isModified = false;
                var listbox = document.getElementById("mySavedFiles");
                // adds saved floor plan to listbox if it isn't there already
                var exists = false;
                for (var i = 0; i < listbox.options.length; i++) {
                    if (listbox.options[i].value === saveName) {
                        exists = true;
                        break;
                    }
                }
                if (exists === false) {
                    var option = document.createElement('option');
                    option.value = saveName;
                    option.text = saveName;
                    listbox.add(option, null);
                }
                var currentFile = document.getElementById("currentFile");
                currentFile.innerHTML = saveName;
            }
        }


    }
    $scope.load = function(){
        var sel = document.getElementById('mySavedFiles');
        // gets selected option
        var str = null;
        for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].selected) str = localStorage.getItem(sel.options[i].text);
        }
        if (str !== null) {
            myDiagram.model = go.Model.fromJson(str);
            myDiagram.model.undoManager.isEnabled = true;
            myDiagram.isModified = false;
        }

        // changes the text of "currentFile" to be the same as the floor plan now loaded
        var name = null;
        for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].selected) name = sel.options[i].text;
        }
        var currentFile = document.getElementById("currentFile");
        currentFile.innerHTML = name;

        // hides open HTML Element
        var openDocument = document.getElementById("openDocument");
        openDocument.style.visibility = "hidden";


    }
    $scope.closeElement = function(){
        var removeDocument = document.getElementById("removeDocument");
        if (removeDocument.style.visibility === "visible") removeDocument.style.visibility = "hidden";
        var openDocument = document.getElementById("openDocument");
        if (openDocument.style.visibility === "visible") openDocument.style.visibility = "hidden";
        var openDocument = document.getElementById("importDocument");
        if (openDocument.style.visibility === "visible") openDocument.style.visibility = "hidden";


    }
    $scope.saveTextAsFile = function()
    {
        var textToWrite = document.getElementById("mySavedModel").value;
        var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
        var fileNameToSaveAs = "Diagram1"

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null)
        {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else
        {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    }
    $scope.removeDocument = function(){
        if (checkLocalStorage()) {
            // makes the HTML element visible
//            var removeDocument = document.getElementById("removeDocument");
//            removeDocument.style.visibility = "visible";
            $('.ui.modal.remove')
                .modal('setting', 'closable', false)
                .modal('show')
            ;
        }
    }
    $scope.ImportDocument = function(){
        // makes the HTML element visible
//        var removeDocument = document.getElementById("importDocument");
//        removeDocument.style.visibility = "visible";
        $('.ui.modal.import')
            .modal('setting', 'closable', false)
            .modal('show')
        ;

    }
    $scope.loadFileAsText = function(){
        var fileToLoad = document.getElementById("fileToLoad").files[0];

        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent)
        {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            document.getElementById("mySavedModel").value = textFromFileLoaded;
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
        load()
        // hides import HTML Element
        var openDocument = document.getElementById("importDocument");
        openDocument.style.visibility = "hidden";

    }
    function load() {
        str = document.getElementById("mySavedModel").value;
        myDiagram.model = go.Model.fromJson(str);
        myDiagram.undoManager.isEnabled = true;
    }

}])


var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
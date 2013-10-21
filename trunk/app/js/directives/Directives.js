app.directive("zoomout",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
          scope.ZoomOut=function(){

             DiagramService.getDiagram().commandHandler.decreaseZoom();


          }
        },
        template:
            '<div class="btn" type="button"   ng-click="ZoomOut()"><i class="icon-zoom-out"></i></div>'


    }
})
app.directive("zoomin",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.ZoomIn=function(){
                DiagramService.getDiagram().commandHandler.increaseZoom();
            }
        },
        template:
            '<div class="btn" type="button"   ng-click="ZoomIn()"><i class="icon-zoom-in"></i></div>'
    }
})
app.directive("cut",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Cut=function(){
                DiagramService.getDiagram().commandHandler.cutSelection();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Cut()">Cut</div>'
    }
})
app.directive("copy",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Copy=function(){
                DiagramService.getDiagram().commandHandler.copySelection();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Copy()">Copy</div>'
    }
})
app.directive("paste",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Paste=function(){
                DiagramService.getDiagram().commandHandler.pasteSelection();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Paste()">Paste</div>'
    }
})
app.directive("delete",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Delete=function(){
                DiagramService.getDiagram().commandHandler.deleteSelection();
            }
        },
        template:
            '<div class="btn" type="button"   ng-click="Delete()"><i class="icon-trash"></i></div>'
    }
})
app.directive("group",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Group=function(){
                DiagramService.getDiagram().commandHandler.groupSelection();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Group()">Group</div>'
    }
})
app.directive("ungroup",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Ungroup=function(){
                DiagramService.getDiagram().commandHandler.ungroupSelection();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Ungroup()">Ungroup</div>'
    }
})
app.directive("undo",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Undo=function(){
                DiagramService.getDiagram().commandHandler.undo();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Undo()">Undo</div>'
    }
})
app.directive("redo",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.Redo=function(){
                DiagramService.getDiagram().commandHandler.redo();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="Redo()">Redo</div>'
    }
})
app.directive("zoomtofit",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.ZoomtoFit=function(){
                DiagramService.getDiagram().commandHandler.zoomToFit();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="ZoomtoFit()">Zoom to Fit</div>'
    }
})
app.directive("selectall",function(DiagramService){
    return {
        restrict: "E",
        link: function(scope){
            scope.SelectAll=function(){
                DiagramService.getDiagram().commandHandler.selectAll();
            }
        },
        template:
            '<div  class="btn btn-primary" ng-click="SelectAll()">SelectAll</div>'
    }
})

app.directive("zippy",function(){
    return {
        restrict: "E",
        link: function(scope){
            scope.isContentVisible = false;
            scope.toggleContent = function(){
                scope.isContentVisible=!scope.isContentVisible;
            }
        }

    }
})
app.directive("search",function(DiagramService){
    return{
        restrict: "E",
        link: function(scope){
            scope.search = function($event){

                myDiagram = DiagramService.getDiagram();
                myPalette = DiagramService.getPalette()
                myDiagram.startTransaction("Add State");
                searchtext=scope.searchText;

                len=0;
                indicator=0;

//                searchtext = document.getElementById("searchtext").value;
//                if (searchtext==="")
//                {
//                    searchtext= document.getElementById("infobar").value;
//
//
//                }
                //init
                myPalette.model= new go.GraphLinksModel();



                minInd=50;
                minIdx=-1;

                NodeArray = DiagramService.getNodeArray();
                if (searchtext.trim()!="")
                {
                    for ( i=0; i<=NodeArray.length-1;i++)
                    {

                        indicator =NodeArray[i].text.indexOf(searchtext.toLowerCase());

                        if (indicator>=0)
                        {
                            if (indicator<=minInd)
                            {
                                minInd=indicator;
                                minIdx=i;
                            }
                            myPalette.model.addNodeData(NodeArray[i]);

                        }
                    }
                }
                else
                {
                    for ( i=0; i<=NodeArray.length-1;i++)
                    {
                        myPalette.model.addNodeData(NodeArray[i]);

                    }
                }

                if (event.keyCode==13 )
                {


                    if (minInd>=0 && minIdx >=0)
                    {
                        nodeArray=myDiagram.model.nodeDataArray;


                        //there are nodes in the diagram
                        if (nodeArray.length!=0)
                        {
                            it = myDiagram.nodes;

                            maxx= -999999999;
                            maxy= -999999999;
                            Bottom = null;

                            for ( i=0;i<=nodeArray.length-1;i++)
                            {
                                if (nodeArray[i].loc.y>=maxy)
                                {
                                    maxx=nodeArray[i].loc.x;
                                    maxy=nodeArray[i].loc.y;
                                    Bottom=i;
                                }

                            }

                            // nodeData= {category: "pic",text: NodeArray[minIdx].text,img: NodeArray[minIdx].img};
                            if (NodeArray[minIdx].category=="pic")
                            {
                                nodeData= {category: NodeArray[minIdx].category,text: NodeArray[minIdx].text,img: NodeArray[minIdx].img};

                            }
                            else if(NodeArray[minIdx].category=="Comment")
                            {
                                nodeData= {category: NodeArray[minIdx].category,text: NodeArray[minIdx].text};

                            }

                            nodeData.loc = new go.Point(maxx,maxy+200);
                            myDiagram.model.addNodeData(nodeData);
                            //alert(myDiagram.position);
                            myDiagram.position = new go.Point(maxx,maxy+600);
                            // select the new Node
                            newnode = myDiagram.findNodeForData(nodeData);
                            newlink = { from: nodeArray[Bottom].key, to: newnode.data.key};
                            myDiagram.model.addLinkData(newlink);


                        }

                        else
                        {
                            myDiagram.model.addNodeData(NodeArray[minIdx]);
                        }
                    }
                }

                myDiagram.commitTransaction("Add State");


            }
        },
        template:
            '<input id="searchtext"  ng-keyup="search($event)" ng-model="searchText"  ' +
            'placeholder="Search for items" autocomplete="on" > </input>'
    }
})

app.directive("dpholder",function(DiagramService){
    return{
        restrict: "E",
        link: function(scope){
            scope.changeDefaultPattern = function(){
                type= scope.DPType.value
                NodeArray = DiagramService.getNodeArray()
                switch (type) {
                    case "aggregator": DefaultPattern =NodeArray[0]; break;
                    case "delay": DefaultPattern =NodeArray[1]; break;
                    case "messagefilter":DefaultPattern =NodeArray[2]; break;
                    case "router": DefaultPattern =NodeArray[3]; break;
                    case "when": DefaultPattern =NodeArray[4]; break;
                    case "recipientlist":DefaultPattern=NodeArray[5]; break;
                    case "messagetranslator": DefaultPattern =NodeArray[6]; break;
                    case "resequencer": DefaultPattern =	  NodeArray[7]; break;

                }

               DiagramService.getDiagram().toolManager.clickCreatingTool.archetypeNodeData =DefaultPattern;
            }
            scope.DPList =[
                {value:"aggregator"},
                {value:"delay"},
                {value:"messagefilter"},
                {value:"router"},
                {value:"when"},
                {value:"recipientlist"},
                {value:"messagetranslator"},
                {value:"resequencer"}

            ]
            scope.DPType = scope.DPList[0] ;//aggregator

        },
        template:
            '<!--Default Pattern selector-->' +
            '<div id="DPholder" style="float:right">' +
            '<b> Default Pattern</b>' +
            '<select id="defaultPattern" ng-options="item.value for item in DPList"ng-model="DPType" ng-change="changeDefaultPattern()">' +
            '</select>' +
            '</div> '
    }
})
app.directive("layoutholder",function(DiagramService){
    return{
        restrict:"E",
        link: function(scope){
            scope.changeLayout = function(){
                myDiagram = DiagramService.getDiagram()
                myDiagram.startTransaction("Change Layout")
                type= scope.LayoutType.value
                switch (type) {
                    case "normal": myDiagram.layout = new go.Layout();break;
                    case "grid": myDiagram.layout =$$(go.GridLayout,
                        { comparer: go.GridLayout.smartComparer });
                        break;
                    case "tree": myDiagram.layout = $$(go.TreeLayout, {
                        comparer: go.LayoutVertex.smartComparer  // have the comparer sort by numbers as well as letters
                        // other properties are set by the layout function, defined below
                    }); break;
                    case "Digraph": myDiagram.layout = $$(go.LayeredDigraphLayout, { isOngoing: false, layerSpacing: 50 });
                        break;
                    case "Circular":   myDiagram.layout = new go.CircularLayout(); break;

                }

                myDiagram.commitTransaction("Add Link");

            }
            scope.LayoutList =[
                {value:"normal",name:"normal Layout"},
                {value:"grid",name:"Grid Layout"},
                {value:"tree",name:"Tree Layout"},
                {value:"Digraph",name:"Layered Digraph"},
                {value:"Circular",name:"Circular Layour"}
            ]
            scope.LayoutType = scope.LayoutList[0];//normal

        },
        template:
            ' <!--Layout selector-->'+
            '<div id="LayoutHolder" style="float:left">'+
            '<b>Layout</b>'+
            '<select ng-model="LayoutType" ng-options ="item.name for item in LayoutList"  ng-change="changeLayout()">'+
            '</select>'+
            '</div>'


    }
})
app.directive("saveboard",function(DiagramService){
    return{
        restrict:"E",
        link:function(scope){
            scope.relayout = function (){
                DiagramService.getDiagram().layoutDiagram(true);
            }
            scope.save = function () {
                str =  DiagramService.getDiagram().model.toJson();
                document.getElementById("mySavedModel").value = str;
            }
            scope.load = function () {
                str = document.getElementById("mySavedModel").value;
                DiagramService.getDiagram().model = go.Model.fromJson(str);
                DiagramService.getDiagram().undoManager.isEnabled = true;
            }


        },
        template:
            '<div id="SaveBoard">'+
//            '<div type="button" class="btn btn-primary" ng-click="relayout()">Re-layout Diagram</div>'+
//            '<div type="button" class="btn btn-primary" ng-click="save()">Save</div>'+
//            '<div type="button" class="btn btn-primary" ng-click="load()">Load</div>Diagram Model saved in JSON format:'+
            '<br />'+
            '<textarea id="mySavedModel" style="width:100%;height:70%"></textarea>'+
            '</div>'
    }
})
app.directive("navButton",function(){
    return{
        restrict:"E",
        template: '<div  class="btn btn-primary" ng-click="Redo()">Redo</div>'

    }


})

app.directive('tabs', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: TabsController,
        templateUrl: 'views/tabs.html',
        replace: true
    };
});


app.directive('pane', function() {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: { title: '@' },
        link: function(scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        templateUrl: 'views/pane.html',
        replace: true
    };
});





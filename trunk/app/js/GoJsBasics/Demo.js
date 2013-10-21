






/* 		myDiagram.linkTemplate=

    $$(go.Link,
      { routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5, toShortLength: 4,
          relinkableFrom: true, relinkableTo: true, reshapable:false ,
		   mouseDragEnter: domouseDragEnter,
		  selectionChanged: linkSelectionChanged
		  },

      $$(go.Shape,
		{name: "LINKSHAPE", toArrow: "standard",stroke: "black", strokeWidth: 2,fill: "whitesmoke" },new go.Binding("stroke", "color").makeTwoWay()),
	  { toolTip:
            $$(go.Adornment, go.Panel.Auto,
              $$(go.Shape, { fill: "#FFFFCC" }),
              $$(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling linkInfo(data)
                new go.Binding("text", "", linkInfo))),
          contextMenu: partContextMenu }); */

		// Define the appearance and behavior for Groups:












 /*
  myDiagram.commandHandler.doKeyDown = function () {
       e = myDiagram.lastInput;
       cmd = myDiagram.commandHandler;
      if (e.key === "T") {  // could also check for e.control or e.shift
        if (cmd.canCollapseSubGraph()) {
          cmd.collapseSubGraph();
        } else if (cmd.canExpandSubGraph()) {
          cmd.expandSubGraph();
        }
      } else {
        go.CommandHandler.doKeyDown.call(cmd);  // call base method
      }
    };
	*/


//	 myDiagram.addDiagramListener("ChangedSelection", function() { update(); } ); // whenever selection changes, run update







 /*
 myPalette.addDiagramListener("ObjectDoubleClicked",
    function(e)
	{
		 holdNode= myPalette.selection.first();

		myDiagram.startTransaction("Add State");
		if (maxx==0)
		{
			maxx=-400;
		}
		 nodeData =null;
		//alert(holdNode.category + " "+ holdNode.data.text+ " "+holdNode.data.img);
		if (holdNode.category=="pic")
				{
					nodeData= {category: holdNode.category,text: holdNode.data.text,img: holdNode.data.img};

				}
				else if(holdNode.category=="Comment")
				{
					nodeData= {category: holdNode.category,text:  holdNode.data.text};

				}

		//there are nodes in the diagram
		nodeArray=myDiagram.model.nodeDataArray;
			if (nodeArray.length!=0)
			{
				 it = myDiagram.nodes;


				 righti = null;

				for ( i=0;i<=nodeArray.length-1;i++)
				{
					if (nodeArray[i].loc.x>=maxx)
					{
						maxx=nodeArray[i].loc.x;
						maxy=nodeArray[i].loc.y;
						righti=i;
					}

				}
			}
			maxx=maxx+200;
		nodeData.loc = new go.Point(maxx,maxy);

		myDiagram.model.addNodeData(nodeData);
		 newnode = myDiagram.findNodeForData(nodeData);

		if (nodeArray.length!=1)
		{
			 newlink = { from: newnode.data.key, to: nodeArray[righti].key};
		}
		myDiagram.model.addLinkData(newlink);

		myDiagram.commitTransaction("Add State");
	}
	);   */







 // Auto make 2 "bridge" links to replace 1 old link when a node is dragged onto an existing link
 /* function domouseDragEnter(e,obj)
 {
	 link = obj.part;
    if (link !== null) {

     // myDiagram.select(link);  // the only selection

    }
	//alert("link");
	 fromNode= link.fromNode;
	 toNode = link.toNode;
	//alert(fromNode.data.key+" "+toNode.data.key);
	 holdNode= myDiagram.selection.first();
	if (fromNode.data.key==toNode.data.key || holdNode.data.key==fromNode.data.key
	|| holdNode.data.key==toNode.data.key)
		return;

	if (myDiagram.selection.count==1)
	{

		//remove that link
		myDiagram.startTransaction("make bridge");
		myDiagram.model.removeLinkData(link.data);
		//add new links fromNode -> holdNode
		 newlink = { from: fromNode.data.key, to: holdNode.data.key ,  color: "lightgray"};
		LinkFromHold = newlink;
		myDiagram.model.addLinkData(newlink);
		tempExternalLinkArray.push(newlink);
		//add new links holdNode -> toNode
		newlink = { from: holdNode.data.key, to: toNode.data.key, color: "lightgray" };
		LinkHoldTo =newlink;
		myDiagram.model.addLinkData(newlink);
		tempExternalLinkArray.push(newlink);
		myDiagram.commitTransaction("make bridge");
		//set flag
		flagLinkEnter =1;
		TempLocLinkEnter=holdNode.data.loc;
		GlobfromNode = fromNode;
		GlobtoNode= toNode;


	}
	else
	{
		 holdfirstNode= myDiagram.selection.first();
		 it = myDiagram.selection.iterator;
		 holdLastNode=null;
		 count=0;



	}

 } */

 highlightColor = "blue"; // color parameterization
// When a Link is selected, highlight it and both connected Nodes.
function linkSelectionChanged(link) {
    if (link.isSelected) {

        highlightLink(link, highlightColor);
        // highlightNode(link.fromNode, highlightColor);
        // highlightNode(link.toNode, highlightColor);
    } else {

        highlightLink(link);
        //  highlightNode(link.fromNode);
        // highlightNode(link.toNode);
    }
}

// Highlight a Link by changing its Shape.stroke and strokeWidth.
function highlightLink(link, color) {
    if (link === null) return;
     shape = link.findObject("LINKSHAPE");
    if (shape === null) return;
    if (color !== undefined) {
        if (!shape.previousStroke) shape.previousStroke = shape.stroke;
        shape.strokeWidth = 3;
        shape.stroke = color;
    } else { // restore previous color
        shape.strokeWidth = 2;
        shape.stroke = shape.previousStroke;
    }
}






  function changeCanvasType()
  {
	 type = getRadioValue("canvastype");
    if (type === "type1") {
       myDiagram.toolManager.dragSelectingTool.delay = 0;
    } else {
	  myDiagram.toolManager.dragSelectingTool.delay = 175;
    }

  }

  function getRadioValue(name) {
     radio = document.getElementsByName(name);
    for ( i = 0; i < radio.length; i++) {
      if (radio[i].checked) return radio[i].value;
    }
  }

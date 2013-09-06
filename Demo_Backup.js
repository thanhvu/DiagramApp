//Initialize global variable
maxx =0
maxy=0;


flagLinkEnter =0;
TempLocLinkEnter= null;
GlobfromNode =null;
GlobtoNode =null;
LinkFromHold =null;
LinkHoldTo =null;
minx = 9999999999;
miny = 9999999999;
tempLinkArray = new Array();
tempExternalLinkArray = new Array();


 DefaultPattern = {category: "pic", text: "aggregator",img: "img/aggregator.png",des:"Used to combine a number of messages together into a single message"};
//-----------------------------------------------------------------------------------------------------------------
//constant
THRESHOLD = 12500
//-----------------
 myDiagram = new go.Diagram("mytest");
 $$ = go.GraphObject.make;



//---------------------
  // define the shared context menu for all Nodes, Links, and Groups
     partContextMenu =
      $$(go.Adornment, go.Panel.Horizontal,
        $$(go.Panel, go.Panel.Vertical,
		 $$("ContextMenuButton",
            $$(go.TextBlock, "Insert a new block here"),
            { click: function(e, obj) { MakeBridge(e,obj); } },
            new go.Binding("visible", "", function(o) { return !o.diagram.commandHandler.canGroupSelection(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Cut"),
            { click: function(e, obj) { e.diagram.commandHandler.cutSelection(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canCutSelection(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Copy"),
            { click: function(e, obj) { e.diagram.commandHandler.copySelection(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canCopySelection(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Paste"),
            { click: function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canPasteSelection(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Delete"),
            { click: function(e, obj) { e.diagram.commandHandler.deleteSelection(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canDeleteSelection(); }).ofObject()),

           $$("ContextMenuButton",
            $$(go.TextBlock, "Undo"),
            { click: function(e, obj) { e.diagram.commandHandler.undo(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canUndo(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Redo"),
            { click: function(e, obj) { e.diagram.commandHandler.redo(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canRedo(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Group"),
            { click: function(e, obj) { e.diagram.commandHandler.groupSelection(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canGroupSelection(); }).ofObject()),
          $$("ContextMenuButton",
            $$(go.TextBlock, "Ungroup"),
            { click: function(e, obj) { e.diagram.commandHandler.ungroupSelection(); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canUngroupSelection(); }).ofObject()) ,

		  $$("ContextMenuButton",
            $$(go.TextBlock, "exclude"),
            { click: function(e, obj)
					{
						myDiagram.startTransaction("exclude a node");

						 if (obj.part.adornedPart.containingGroup.memberParts.count==1)
						 {
							 EmptyGroup =obj.part.adornedPart.containingGroup;
							obj.part.adornedPart.containingGroup=null;
							myDiagram.remove(EmptyGroup);
						 }
						 else
						 obj.part.adornedPart.containingGroup=null;


						  myDiagram.commitTransaction("exclude a node");

					}
			},
			new go.Binding("visible", "", function(o) { return o.part.adornedPart.containingGroup!=null; }).ofObject()) ,

		  $$("ContextMenuButton",
            $$(go.TextBlock, "Save as use case"),
            { click: function(e, obj)
					{
                        CreateUsecase(e,obj);
					}
			},new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canGroupSelection(); }).ofObject()) ,

           $$("ContextMenuButton",
            $$(go.TextBlock, "Add"),
            { click: function(e, obj) { addNodeAndLink(e,obj); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canGroupSelection(); }).ofObject()),

		   $$("ContextMenuButton",
            $$(go.TextBlock, "split a flow"),
            { click: function(e, obj) { SplitFlowy(e,obj); } },
            new go.Binding("visible", "", function(o) { return !o.diagram.commandHandler.canGroupSelection(); }).ofObject()),

		   $$("ContextMenuButton",
            $$(go.TextBlock, "change type"),
            { click: function(e, obj) { ChangeType(e,obj); } },
            new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canGroupSelection(); }).ofObject())


			));

    function CreateUsecase(e,obj)
    {
        myDiagram.startTransaction("save as use case");
        //obj.part.adornedPart.containingGroup.collapseSubGraph();
        e.diagram.commandHandler.deleteSelection();
        //add a new node
         newnode = NodeArray[9];
        newnode.loc = new go.Point(e.documentPoint.x,e.documentPoint.y);
        myDiagram.model.addNodeData(newnode);
         newnode = myDiagram.findNodeForData(newnode);

        myDiagram.commitTransaction("save as use case");

    }
	function ChangeType(e,obj)
	{
		myDiagram.startTransaction("Change Type");
		 holdNode = obj.part.adornedPart;
		if (holdNode!=undefined && holdNode!=null)
		{
			myDiagram.model.setDataProperty(holdNode.data, "category", DefaultPattern.category);
			myDiagram.model.setDataProperty(holdNode.data,"img", DefaultPattern.img);
			myDiagram.model.setDataProperty(holdNode.data,"text", DefaultPattern.text);
		}
		myDiagram.commitTransaction("Change Type");

	}
	function LeftiNode(Tree)
	{

		if (Tree==null || Tree==undefined)
			return null;
		if (Tree instanceof go.Link) { LeftiNode(Tree.toNode); }
          else {
             nodes = Tree.findNodesConnected();
            while (nodes.next()) {
			/* alert("minx: "+ minx + " x: " + nodes.value.location.x); */
              if (nodes.value.location.x<=minx) {

                minx=nodes.value.location.x; LeftiNode(nodes.value);
              }
            }
          }
		  return true;
	}
    function UpperNode(Tree)
    {

        if (Tree===null || Tree===undefined)
            return null;
        if (Tree instanceof go.Link) { UpperNode(Tree.fromNode); }
        else {
             nodes = Tree.findNodesConnected();

            if (nodes!==null && nodes.count>0)
            {
                while (nodes.next()) {

                    if (nodes.value.location.y<=miny) {

                        miny=nodes.value.location.y; UpperNode(nodes.value);

                    }
                }

            }
            else
            {
                return null;
            }

        }
        return true;
    }

	function SplitFlowx(e,obj)
	{
		myDiagram.startTransaction("Split flow");
		 Link = myDiagram.selection.first();
		 toNode = Link.toNode;
		 fromNode = Link.fromNode;
		 MoveSet = toNode.findTreeParts();
		myDiagram.model.removeLinkData(Link.data);


		 offsetx =null;
//		if (LeftiNode(fromNode)!=null)
//		{
//			offsetx = minx-toNode.data.loc.x;
//		}
//		else
		{
			offsetx = fromNode.data.loc.x-toNode.data.loc.x;
		}
		minx = 99999999999999;


		myDiagram.moveParts(MoveSet,new go.Point(offsetx,200),true);
		myDiagram.commitTransaction("Split flow");
	}
    function SplitFlowy(e,obj)
    {
        myDiagram.startTransaction("Split flow");
         Link = myDiagram.selection.first();
         toNode = Link.toNode;
         fromNode = Link.fromNode;
         MoveSet = toNode.findTreeParts();
        myDiagram.model.removeLinkData(Link.data);


         offsety =null;
        if (UpperNode(fromNode)!=null)
        {
            offsety = miny-toNode.data.loc.y;

        }
        else
        {
            offsety = fromNode.data.loc.y-toNode.data.loc.y;
        }
        miny = 99999999999999;


        myDiagram.moveParts(MoveSet,new go.Point(200,offsety),true);
        myDiagram.commitTransaction("Split flow");
    }

	function MakeBridge(e,obj)
	{

		 Link = myDiagram.selection.first();
		 fromNode = Link.fromNode;
		 toNode = Link.toNode;
		//remove the Link
		myDiagram.startTransaction("make bridge");
		myDiagram.model.removeLinkData(Link.data);

		//add a new node
		 newnode = {category: DefaultPattern.category, text: DefaultPattern.text ,img: DefaultPattern.img};
		newnode.loc = new go.Point(e.documentPoint.x,e.documentPoint.y);
		myDiagram.model.addNodeData(newnode);
		 newnode = myDiagram.findNodeForData(newnode);

		//add new links fromNode -> a new node
		 newlink = { from: fromNode.data.key, to: newnode.data.key ,  color: "black"};
		myDiagram.model.addLinkData(newlink);

		//add new links newnode -> toNode
		newlink = { from: newnode.data.key, to: toNode.data.key, color: "black" };
		myDiagram.model.addLinkData(newlink);

		myDiagram.commitTransaction("make bridge");
		DefaultPattern = NodeArray[0];


	}
	function nodeInfo(d) {  // Tooltip info for a node data object
       str = "Node: " + d.text + "\n";
      if (d.group)
        str += "member of " + d.group;
      else
        str += "top-level node";
      return str;
    }

   function diagramInfo(model) {  // Tooltip info for the diagram's model
      return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
    }
function linkInfo(d) {  // Tooltip info for a link data object
      return "Link:\nfrom " + d.from + " to " + d.to;
    }
    // provide a tooltip for the background of the Diagram, when not over any Part
    myDiagram.toolTip =
      $$(go.Adornment, go.Panel.Auto,
        $$(go.Shape, { fill: "#FFFFCC" }),
        $$(go.TextBlock, { margin: 4 },
          new go.Binding("text", "", diagramInfo)));

   // define several shared Brushes
     graygrad = $$(go.Brush, go.Brush.Linear, { 0: "rgb(150, 150, 150)", 0.5: "rgb(86, 86, 86)", 1: "rgb(86, 86, 86)" });
     greengrad = $$(go.Brush, go.Brush.Linear, { 0: "rgb(98, 149, 79)", 1: "rgb(17, 51, 6)" });
     redgrad = $$(go.Brush, go.Brush.Linear, { 0: "rgb(156, 56, 50)", 1: "rgb(82, 6, 0)" });
     yellowgrad = $$(go.Brush, go.Brush.Linear, { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" });



   myDiagram.nodeTemplateMap.add("",
    $$(go.Node, go.Panel.Spot,new go.Binding("location", "loc").makeTwoWay(),

	{ locationSpot: go.Spot.Center, isShadowed: true },

         //{ resizable: true },{ rotatable: true},
        { mouseEnter: function(e, obj) { showPorts(obj.part, true); },
          mouseLeave: function(e, obj) { showPorts(obj.part, false); } },
        $$(go.Panel, go.Panel.Auto,
          $$(go.Shape,
            {name: "shape", fill:greengrad },new go.Binding("figure","figure").makeTwoWay()
			,new go.Binding("fill","fill")
			),
          $$(go.TextBlock,
            {  margin: 5, text: "text",
              font: "bold 9pt Helvetica, Arial, sans-serif", editable: true ,isMultiline: false,
              stroke: "rgb(190, 247, 112)" },new go.Binding("text","text")
			  )),


		  makePort("T", go.Spot.Top, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true),

		       { toolTip:
            $$(go.Adornment, go.Panel.Auto,
              $$(go.Shape, { fill: "#FFFFCC" }),
              $$(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                new go.Binding("text", "", nodeInfo))),
          contextMenu: partContextMenu }
        ));



		 myDiagram.nodeTemplateMap.add("pic",
      $$(go.Node,
		 go.Panel.Spot,{ locationSpot: go.Spot.Center, isShadowed: false},new go.Binding("location", "loc").makeTwoWay(),
         // { fromSpot: go.Spot.Right, toSpot: go.Spot.Left },
        { mouseEnter: function(e, obj) { showPorts(obj.part, true); },
          mouseLeave: function(e, obj) { showPorts(obj.part, false); } },
        $$(go.Panel, go.Panel.Table,
		  $$(go.Panel,go.Panel.Table,
		  $$(go.Shape,
            {name: "shape", fill:"white",stroke: "white",desiredSize: new go.Size(50, 50),
			portId: "C",fromLinkable: true, toLinkable: true
			}),
		  $$(go.Picture,
		    {row: 0, column: 0 },new go.Binding("source", "img"))
			,
			 makePort("T", go.Spot.Top, true, true),
			 //makePort("C", go.Spot.Center, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true)
		),
          $$(go.TextBlock,
            {column:0,row:1,editable: true,isMultiline: false, textAlign: "center",
              font: "bold 9pt Helvetica, Arial, sans-serif"},new go.Binding("text", "text").makeTwoWay()),
		  $$(go.TextBlock,
            {column:0,row:2,editable: true,isMultiline: true, textAlign: "center",
              font: "bold 9pt Helvetica, Arial, sans-serif"},new go.Binding("text", "text2").makeTwoWay())
		  ),

        // three named ports, one on each side except the top, all output only:


		 { toolTip:
            $$(go.Adornment, go.Panel.Auto,
              $$(go.Shape, { fill: "#FFFFCC" }),
              $$(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                new go.Binding("text", "", nodeInfo))),
          contextMenu: partContextMenu },

		  { selectionAdornmentTemplate:
        $$(go.Adornment, go.Panel.Spot,
          $$(go.Panel, go.Panel.Auto,
            // this Adornment has a rectangular blue Shape around the selected node
            $$(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
            $$(go.Placeholder))

          ) }
        ));

				 myDiagram.nodeTemplateMap.add("Comment",
      $$(go.Node, go.Panel.Spot,{ locationSpot: go.Spot.Center, isShadowed: false},
        new go.Binding("location", "loc").makeTwoWay(),
		{ mouseEnter: function(e, obj) { showPorts(obj.part, true); },
          mouseLeave: function(e, obj) { showPorts(obj.part, false); } },
        $$(go.Shape, "Ellipse",
          { fill: yellowgrad ,desiredSize: new go.Size(120, 50)},
          new go.Binding("figure", "figure")),
        $$(go.TextBlock,
          { margin: 4,
            maxSize: new go.Size(100, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true,
            font: "bold 9pt Helvetica, Arial, sans-serif" },
          new go.Binding("text", "text").makeTwoWay()),
         makePort("T", go.Spot.Top, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true),
		 { toolTip:
            $$(go.Adornment, go.Panel.Auto,
              $$(go.Shape, { fill: "#FFFFCC" }),
              $$(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                new go.Binding("text", "", nodeInfo))),
          contextMenu: partContextMenu }
        ));



myDiagram.allowDrop = true;  // handle drag-and-drop from the Palette
// initialize the Palette
myPalette = $$(go.Palette, "myPalette");



/*  //second palette
 Palette2 = $$(go.Palette, "Palette2");
Palette2.layout= $$(go.GridLayout,
    { comparer: go.GridLayout.smartComparer });
Palette2.layout.wrappingColumn = NaN;
Palette2.layout.wrappingWidth=NaN;
Palette2.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
Palette2.groupTemplate = myDiagram.groupTemplate;
Palette2.model = new go.GraphLinksModel(

 [ NodeArray[10] ]);

 //third palette
 Palette3 = $$(go.Palette, "Palette3");
Palette3.layout= $$(go.GridLayout,
    { comparer: go.GridLayout.smartComparer });
Palette3.layout.wrappingColumn = NaN;
Palette3.layout.wrappingWidth=NaN;
Palette3.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
Palette3.groupTemplate = myDiagram.groupTemplate;
Palette3.model = new go.GraphLinksModel(

 [ NodeArray[0] ]); */


 // define the link template
       myDiagram.linkTemplate =
        $$(go.Link,
         { selectionAdornmentTemplate:
          $$(go.Adornment,
            $$(go.Shape,
              { isPanelMain: true, stroke: "dodgerblue", strokeWidth: 3 }),
            $$(go.Shape,
              { toArrow: "Standard", fill: "dodgerblue", stroke: null, scale: 1 })),
            routing: go.Link.Normal,
            curve: go.Link.Bezier,
            toShortLength: 2 },

          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            toShortLength: 2,
			relinkableFrom: true,  corner: 5,
			relinkableTo: true, reshapable:true //resegmentable: true,
		   /* mouseDragEnter: domouseDragEnter */},
        $$(go.Shape,  //  the link shape
          { name: "LINKSHAPE", isPanelMain: true,stroke: "black", strokeWidth: 2,fill: "whitesmoke" },new go.Binding("stroke", "color").makeTwoWay()),
        $$(go.Shape,  //  the arrowhead
          { name: "LINKSHAPE", toArrow: "Standard" },new go.Binding("stroke", "color").makeTwoWay()),
        { toolTip:  //  define a tooltip for each link that displays its information
            $$(go.Adornment, go.Panel.Auto,
              $$(go.Shape, { fill: "#EFEFCC" }),
              $$(go.TextBlock, { margin: 4 },
                new go.Binding("text",  "" ,linkInfo))),
				contextMenu: partContextMenu });

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
    function groupInfo(tt) {  // takes the tooltip, not a group node data object
       g = tt.adornedPart;  // get the Group that the tooltip adorns
       mems = g.memberParts.count;
       links = 0;
       it = g.memberParts;
      while (it.next()) {
        if (it.value instanceof go.Link) links++;
      }
      return "Group: " + g.data.text + "\n" + mems + " members including " + links + " links";
    }
		  groupFill = "rgba(128,128,128,0.2)";
     groupStroke = "gray";
     dropFill = "pink";
     dropStroke = "red";
    // Groups consist of a title in the color given by the group node data
    // above a translucent gray rectangle surrounding the member parts

    myDiagram.groupTemplateMap.add("",
      $$(go.Group, go.Panel.Vertical, new go.Binding("location", "loc").makeTwoWay(),
        { selectionObjectName: "PANEL",
		  locationObjectName:"PANEL",		// selection handle goes around shape, not label
          ungroupable: true ,  isSubGraphExpanded: true ,
		  subGraphExpandedChanged: function(g) {      /* g.category = "Collapsed"; */      }},
	  $$("SubGraphExpanderButton"), // enable Ctrl-Shift-G to ungroup a selected Group

		  { // what to do when a drag-over or a drag-drop occurs on a Group
          mouseDragEnter: function(e, grp, prev) {
            highlightGroup(grp, grp.canAddMembers(grp.diagram.selection));
          },
          mouseDragLeave: function(e, grp, next) {
            highlightGroup(grp, false);
          },
          mouseDrop: function(e, grp) {
             ok = grp.addMembers(grp.diagram.selection, true);
            if (!ok) grp.diagram.currentTool.doCancel();
          }
        },

        $$(go.Panel, go.Panel.Auto,
          { name: "PANEL" },
          $$(go.Shape, "Rectangle",
			// the rectangular shape around the members
            { name: "SHAPE",fill: groupFill, stroke: "gray", strokeWidth: 3 }),
          $$(go.Placeholder, { padding: 10 })),
$$(go.TextBlock,
          { font: "bold 12pt sans-serif",
            isMultiline: false,  // don't allow newlines in text
            editable: true,text: "group" },  // allow in-place editing by user
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("stroke", "color")),		  // represents where the members are
        { toolTip:
            $$(go.Adornment, go.Panel.Auto,
              $$(go.Shape, { fill: "#FFFFCC" }),
              $$(go.TextBlock, { margin: 4 },
                // bind to tooltip, not to Group.data, to allow access to Group properties
                new go.Binding("text", "", groupInfo).ofObject())),
          contextMenu: partContextMenu }));


 myDiagram.groupTemplateMap.add("Collapsed",
  $$(go.Group,go.Panel.Vertical, new go.Binding("location", "loc").makeTwoWay(),
    { selectionObjectName: "PANEL",isSubGraphExpanded: false,
	  locationObjectName:"PANEL",
      subGraphExpandedChanged: function(g) { g.category = ""; }
     },$$("SubGraphExpanderButton"),

		  $$(go.Shape,
            {name: "shape", fill:"white",stroke: "white",desiredSize: new go.Size(50, 50)}),
		  $$(go.Picture,
		    {row: 0, column: 0 ,source: "queue.png"}),
		  $$(go.TextBlock,
            { font: "bold 12pt sans-serif",
              isMultiline: false,  // don't allow newlines in text
              editable: true })
   ));


    function highlightGroup(grp, show) {
       shape = grp.findObject("SHAPE");
      if (shape) {
        shape.fill = show ? dropFill : groupFill;
        shape.stroke = show ? dropStroke : groupStroke;
      }
    }
	// provide a context menu for the background of the Diagram, when not over any Part
    myDiagram.contextMenu =
      $$(go.Adornment, go.Panel.Vertical,
        $$("ContextMenuButton",
          $$(go.TextBlock, "Paste"),
          { click: function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); } },
          new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canPasteSelection(); }).ofObject()),
        $$("ContextMenuButton",
          $$(go.TextBlock, "Undo"),
          { click: function(e, obj) { e.diagram.commandHandler.undo(); } },
          new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canUndo(); }).ofObject()),
		  $$("ContextMenuButton",
		  $$(go.TextBlock, "Select all"),
            { click: function(e, obj) { e.diagram.commandHandler.selectAll(); } }
            ),
        $$("ContextMenuButton",
          $$(go.TextBlock, "Redo"),
          { click: function(e, obj) { e.diagram.commandHandler.redo(); } },
          new go.Binding("visible", "", function(o) { return o.diagram.commandHandler.canRedo(); }).ofObject()) );





 myDiagram.nodeTemplate.selectionAdornmentTemplate =
      $$(go.Adornment, go.Panel.Spot,
        $$(go.Panel, go.Panel.Auto,
          $$(go.Shape, { fill: null, stroke: "blue", strokeWidth: 2 }),
          $$(go.Placeholder)),
        // the button to create a "next" node, at the top-right corner
        $$("Button",
          { alignment: go.Spot.TopRight,
            click: addNodeAndLink },  // this function is defined below
          $$(go.Shape, { figure: "PlusLine", desiredSize: new go.Size(6, 6) })
        ) // end button
      ); // end adornment

    // clicking the button inserts a new node to the right of the selected node,
    // and adds a link to that new node
    function addNodeAndLink(e, obj) {
       adorn = obj.part;
      if (adorn === null) return;
      e.handled = true;
       diagram = adorn.diagram;
	  diagram.startTransaction("Add State");
		// get the node data for which the user clicked the button
		 fromNode = adorn.adornedPart;
		 fromData = fromNode.data;
	  if( !(diagram instanceof go.Palette))
	  {


		// create a new "State" data object, positioned off to the right of the adorned Node
		 type= document.getElementById('defaultPattern').value;
		if (type!="")
		{
			 minInd=50;
			 minIdx=-1;
		 for ( i=0; i<=NodeArray.length-1;i++)
			{

				indicator =NodeArray[i].text.indexOf(type.toLowerCase());

				if (indicator>=0)
				{
					if (indicator<=minInd)
					{
						minInd=indicator;
						minIdx=i;
					}


				}
			}
			 toData;
		  if (NodeArray[minIdx].category=="pic")
					{
						toData= {category: NodeArray[minIdx].category,text: NodeArray[minIdx].text,img: NodeArray[minIdx].img};

					}
					else if(NodeArray[minIdx].category=="Comment")
					{
						toData= {category: NodeArray[minIdx].category,text: NodeArray[minIdx].text};

					}
		  }
		  else
		  {
		    toData = {text: "new"}

		  }

		   p = fromNode.location;
		  toData.loc = new go.Point(p.x,p.y+200);  // the "loc" property is a string, not a Point object
		  // add the new node data to the model
		   model = diagram.model;
		  model.addNodeData(toData);
		  // create a link data from the old node data to the new node data
		   linkdata = {};
		  linkdata[model.linkFromKeyProperty] = model.getKeyForNodeData(fromData);
		  linkdata[model.linkToKeyProperty] = model.getKeyForNodeData(toData);
		  // and add the link data to the model
		  model.addLinkData(linkdata);
		  // select the new Node
		   newnode = diagram.findNodeForData(toData);
		  diagram.select(newnode);
		  diagram.commitTransaction("Add State");

	  }
	  else
	  {
		myDiagram.startTransaction("Add State");
		fromNode.data.loc = new go.Point(maxx,maxy+400);
		maxx=maxx+400;
		myDiagram.model.addNodeData(fromNode.data);
		myDiagram.commitTransaction("Add State");
	  }

    }

 function makePort(name, spot, output, input) {
    // the port is basically just a small circle that has a white stroke when it is made visible
    return go.GraphObject.make(go.Shape,
            {
              figure: "Circle",
              fill: "transparent",
              stroke: null,  // this is changed to "white" in the showPorts function
              desiredSize: new go.Size(6, 6),
              alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
              portId: name,  // declare this object to be a "port"
              fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
              fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
              cursor: "pointer" ,// show a different cursor to indicate potential link point
			  // toMaxLinks: 1,fromMaxLinks:1,
			  fromLinkableDuplicates: false, toLinkableDuplicates: false
            });
  }



  // Make all ports on a node visible when the mouse is over the node
  function showPorts(node, show) {
     diagram = node.diagram;
    if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
     it = node.ports;
    while (it.next()) {
       port = it.value;
      port.stroke = (show ? "black" : null);
    }
  }
	  function addChild () {
     selnode = diagram.selection.first();
    if (!(selnode instanceof go.Node)) return;
    diagram.startTransaction("add node and link");

     newnode = { key: "N" };
    diagram.model.addNodeData(newnode);
     newlink = { from: selnode.data.key, to: newnode.key };
    diagram.model.addLinkData(newlink);
    diagram.commitTransaction("add node and link");
  };
 // Show the diagram's model in JSON format that the user may have edited
  function save() {
     str = myDiagram.model.toJson();
    document.getElementById("mySavedModel").value = str;
  }
  function load() {
     str = document.getElementById("mySavedModel").value;
    myDiagram.model = go.Model.fromJson(str);
    myDiagram.undoManager.isEnabled = true;
  }

  function search(event)
  {

            //alert (event.keyCode);

	  myDiagram.startTransaction("Add State");
	 searchtext="";

	 len=0;
	 indicator=0;

	searchtext = document.getElementById("searchtext").value;
      if (searchtext==="")
      {
          searchtext= document.getElementById("infobar").value;


      }
	//init
	myPalette.model= new go.GraphLinksModel();



	 minInd=50;
	 minIdx=-1;

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


				 newlink = { from: nodeArray[Bottom].key, to: newnode.data.key};
				myDiagram.model.addLinkData(newlink);
				//alert(myDiagram.position);

			}

			else
			{
				myDiagram.model.addNodeData(NodeArray[minIdx]);
			}
		}
	}

	myDiagram.commitTransaction("Add State");

  }
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

	 // create the model data that will be represented in both diagrams simultaneously
   model = $$(go.GraphLinksModel,
      { linkFromPortIdProperty: "fromPort",  // required information:
        linkToPortIdProperty: "toPort"      // identifies data property names
        });


 myDiagram.model=model;

function changeDefaultPattern()
{

	 type= document.getElementById('defaultPattern').value;
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

		 myDiagram.toolManager.clickCreatingTool.archetypeNodeData =DefaultPattern;
}

 // notice whenever a transaction or undo/redo has occurred
  myDiagram.model.addChangedListener(function(e) {

	if (e.change == go.ChangedEvent.Transaction
          && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {

        document.getElementById("mySavedModel").textContent = myDiagram.model.toJson();

      }
	// if (e.change == go.ChangedEvent.Transaction && e.propertyName
  });

  function relayout() {
    myDiagram.layoutDiagram(true);
  }

 myDiagram.autoScrollRegion= (100, 100, 100, 100);
function changeLayout()
{
	myDiagram.startTransaction("Change Layout");
	 type= document.getElementById('selectLayout').value;
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


	//when an external object dropped
	myDiagram.addDiagramListener("ExternalObjectsDropped",
    function(e)
	{
         JustAddedNode = e.subject.first();
		if (myDiagram.model.nodeDataArray!=null)
		{


			for ( i=0; i<=tempExternalLinkArray.length-1;i++)
			{

				 link = tempExternalLinkArray[i];
				 // alert(link.from+ " "+ link.to);
				if (IsExisted(link)==false && (link.from==JustAddedNode.data.key || link.to == JustAddedNode.data.key)
				&&(link.from!=link.to))
				{

					myDiagram.startTransaction("Add Link");
					myDiagram.model.addLinkData(link);
					myDiagram.commitTransaction("Add Link");
				}

			}
			tempExternalLinkArray.splice(0,tempExternalLinkArray.length);

		}
		 holdNode= myDiagram.selection.first();
		 list = myDiagram.nodes;
       itr = list.iterator;
	   count=0;

	  //connect the hold node with the nodes in the area within the THRESHOLD by the templinks
	   while (itr.next()) {
         val = itr.value;
         dist = (holdNode.data.loc.x-val.data.loc.x)*(holdNode.data.loc.x-val.data.loc.x)
		+(holdNode.data.loc.y-val.data.loc.y)*(holdNode.data.loc.y-val.data.loc.y);
		if (dist <= THRESHOLD && val!=holdNode && IsConnected(holdNode,val)==false &&
		!(holdNode instanceof go.Group)
		&& !(val instanceof go.Group) )
		{
			 newlink = { from: val.data.key, to: holdNode.data.key , color: "black"};
			 len= myDiagram.model.linkDataArray.length;


			//make sure it doesn't link to itself
			if (holdNode.data.key!=val.data.key )
			{
				/* if (holdNode.data.loc.x>=val.data.loc.x)
				{
					newlink.fromPort="L";
					newlink.toPort="R";
				}
				else
				{
					newlink.fromPort="R";
					newlink.toPort="L";
				} */
				myDiagram.startTransaction("Add Link");
				myDiagram.model.addLinkData(newlink);
				myDiagram.commitTransaction("Add Link");


			}
		}

      }

		//remove all the templinks for each pair of nodes whose distance is above THRESHOLD
	 list = myDiagram.nodes;
	 itr = list.iterator;
	 holdNode= myDiagram.selection.first();
	while (itr.next()) {
         val = itr.value;
          dist = (holdNode.data.loc.x-val.data.loc.x)*(holdNode.data.loc.x-val.data.loc.x)
		+(holdNode.data.loc.y-val.data.loc.y)*(holdNode.data.loc.y-val.data.loc.y);
	    if (dist >THRESHOLD && HaveTempLink(holdNode.data.key,val.data.key)==true)
		{
			link = GetLinkFromKeys(holdNode.data.key,val.data.key);
			if (link!=null)
			{
				//remove the link
				myDiagram.startTransaction("remove link");
				myDiagram.model.removeLinkData(link);
				myDiagram.commitTransaction("remove link");
				tempLinkArray.pop(link);
			}


		}

      }


		//turn the color of all the link to black
		 list = myDiagram.links;
		 itr = list.iterator;
		while (itr.next()) {

			 val = itr.value;
			 shape = val.findObject("LINKSHAPE");
			if (shape === null) return;
			shape.stroke = "black";

		}


	});

 function HaveExternalTempLink(FromKey,ToKey)
 {
	if (tempExternalLinkArray!=null)
	{
		 len = tempExternalLinkArray.length;
		for ( i=0; i<=len-1; i++)
		{
			if (tempExternalLinkArray[i].from==FromKey && tempExternalLinkArray[i].to==ToKey)
			{
				return true;
			}

		}
		return false;
	}
	return false;


 }
 function SquaredDistance(pointA,pointB)
 {
	return (pointA.x-pointB.x)*(pointA.x-pointB.x)+(pointA.y-pointB.y)*(pointA.y-pointB.y);

 }
 function ResetTempForBridge()
 {
	//flagLinkEnter=null;
	TempLocLinkEnter=null;
	GlobfromNode =null;
	GlobtoNode =null;
	LinkFromHold =null;
	LinkHoldTo =null;
 }
	myDiagram.mouseDrop= function (e){

	 // consider to undo the bridge
	/* if (flagLinkEnter ==1 && TempLocLinkEnter!= null && GlobfromNode!=null && GlobtoNode!=null)
	{
		 holdNode= myDiagram.selection.first();
		 dist = SquaredDistance(TempLocLinkEnter,holdNode.data.loc);
		if (dist>BridgeTHRESHOLD)
		{
			//undo the bridge
			myDiagram.startTransaction("undo bridge");
			myDiagram.model.removeLinkData(LinkFromHold);
			tempExternalLinkArray.pop(LinkFromHold);
			myDiagram.model.removeLinkData(LinkHoldTo);
			tempExternalLinkArray.pop(LinkHoldTo);
			//add new links fromNode -> holdNode
			 newlink = { from: GlobfromNode.data.key, to: GlobtoNode.data.key ,  color: "black"};
			myDiagram.model.addLinkData(newlink);
			myDiagram.commitTransaction("undo bridge");
		}
		//destroy temps and reset flag
		ResetTempForBridge();
		return;
	}  */
	if (tempLinkArray!=null)
	{

		tempLinkArray.splice(0,tempLinkArray.length);

	}

	//remove all the templinks for each pair of nodes whose distance is above THRESHOLD
	 list = myDiagram.nodes;
	 itr = list.iterator;
	 holdNode= myDiagram.selection.first();
	while (itr.next()) {
         val = itr.value;
		if (holdNode.data.loc!=null)
		{
			  dist = (holdNode.data.loc.x-val.data.loc.x)*(holdNode.data.loc.x-val.data.loc.x)
			+(holdNode.data.loc.y-val.data.loc.y)*(holdNode.data.loc.y-val.data.loc.y);
			if (dist >THRESHOLD && HaveTempLink(holdNode.data.key,val.data.key)==true)
			{
				link = GetLinkFromKeys(val.data.key,holdNode.data.key);
				if (link!=null)
				{
					//remove the link
					myDiagram.startTransaction("remove link");
					myDiagram.model.removeLinkData(link);
					myDiagram.commitTransaction("remove link");
					tempLinkArray.pop(link);
				}


			}
		}

      }
	//turn the color of all the link to black
     list = myDiagram.links;
	 itr = list.iterator;

	while (itr.next()) {

         val = itr.value;
		 shape = val.findObject("LINKSHAPE");
		if (shape === null) return;
		shape.stroke = "black";

	}

 }

 myDiagram.mouseDragOver=function(e){

	 doc = e.documentPoint;
	//node is being dragged
	 holdNode= myDiagram.selection.first();


	 list = myDiagram.nodes;
       itr = list.iterator;
	   count=0;
	  if (holdNode!=null && holdNode.data.loc!=null)
	  {

		  //connect the hold node with the nodes in the area within the THRESHOLD by the templinks
		  while (itr.next()) {
			 val = itr.value;
			if (holdNode.data.loc!=null)
		{
				  dist = (holdNode.data.loc.x-val.data.loc.x)*(holdNode.data.loc.x-val.data.loc.x)
				+(holdNode.data.loc.y-val.data.loc.y)*(holdNode.data.loc.y-val.data.loc.y);
				if (dist <= THRESHOLD && val!=holdNode && IsConnected(holdNode,val)==false &&
				!(holdNode instanceof go.Group)
				&& !(val instanceof go.Group) )
				{
					 newlink = { from: val.data.key, to: holdNode.data.key , color: "lightgray"};
					 len= myDiagram.model.linkDataArray.length;
					 flag =0;

					//make sure it doesn't link to itself
					if (holdNode.data.key!=val.data.key )
					{
						/* if (holdNode.data.loc.x>=val.data.loc.x)
						{
							newlink.fromPort="L";
							newlink.toPort="R";
						}
						else
						{
							newlink.fromPort="R";
							newlink.toPort="L";
						} */
						myDiagram.startTransaction("Add Link");
						myDiagram.model.addLinkData(newlink);
						myDiagram.commitTransaction("Add Link");
						//save to tempLink

						tempLinkArray.push(newlink);

					}
				}
			}
	    }
      }



	//remove all the templinks for each pair of nodes whose distance is above THRESHOLD
	 list = myDiagram.nodes;
	 itr = list.iterator;
	 holdNode= myDiagram.selection.first();
	while (itr.next()) {
         val = itr.value;
		if (holdNode.data.loc!=null)
		{
			 dist = (holdNode.data.loc.x-val.data.loc.x)*(holdNode.data.loc.x-val.data.loc.x)
					+(holdNode.data.loc.y-val.data.loc.y)*(holdNode.data.loc.y-val.data.loc.y);
			if (dist >THRESHOLD && HaveTempLink(holdNode.data.key,val.data.key)==true)
			{
				link = GetLinkFromKeys(val.data.key,holdNode.data.key);
				if (link!=null)
				{
					//remove the link
					myDiagram.startTransaction("remove link");
					myDiagram.model.removeLinkData(link);
					myDiagram.commitTransaction("remove link");
					tempLinkArray.pop(link);
				}


			}
		}
	}




	 // consider to undo the bridge
	/* if (flagLinkEnter ==1 && TempLocLinkEnter!= null && GlobfromNode!=null && GlobtoNode!=null)
	{
		 holdNode= myDiagram.selection.first();
		 dist = SquaredDistance(TempLocLinkEnter,holdNode.data.loc);
		if (dist>BridgeTHRESHOLD)
		{


			//undo the bridge
			myDiagram.startTransaction("undo bridge");
			myDiagram.model.removeLinkData(LinkFromHold);
			tempExternalLinkArray.pop(LinkFromHold);
			myDiagram.model.removeLinkData(LinkHoldTo);
			tempExternalLinkArray.pop(LinkHoldTo);
			//add new links fromNode -> holdNode
			 newlink = { from: GlobfromNode.data.key, to: GlobtoNode.data.key ,  color: "black"};
			myDiagram.model.addLinkData(newlink);
			myDiagram.commitTransaction("undo bridge");
			//destroy temps and reset flag
			ResetTempForBridge();
		}
	} */
		if (myDiagram.lastInput.up==true)
		{
			//turn the color of all the link to black
			 list = myDiagram.links;
			 itr = list.iterator;

			while (itr.next()) {

				 val = itr.value;
				 shape = val.findObject("LINKSHAPE");
				if (shape === null) return;
				shape.stroke = "black";

			}
		}



 }
 function IsExisted(link)
 {
	 model = myDiagram.model;
	 len = model.linkDataArray.length;
	for ( i=0; i<=len-1;i++)
	{

		if ((link.from===model.linkDataArray[i].from && link.to===model.linkDataArray[i].to)
		  || (link.from===model.linkDataArray[i].to && link.to===model.linkDataArray[i].from))
		{
			return true;

		}
	}

	return false;


 }
 function GetLinkFromKeys(FromKey,ToKey)
 {
	 model = myDiagram.model;
	 len = model.linkDataArray.length;
	for ( i=0; i<=len-1;i++)
	{
		if (model.linkDataArray[i].from==FromKey && model.linkDataArray[i].to==ToKey)
		{
			return model.linkDataArray[i];
		}
	}
	return null;
 }
 function HaveTempLink(FromKey,ToKey)
 {
	if (tempLinkArray!=null)
	{
		 len = tempLinkArray.length;
		for ( i=0; i<=len-1; i++)
		{
			if ((tempLinkArray[i].from==FromKey && tempLinkArray[i].to==ToKey)
			 || (tempLinkArray[i].from==ToKey && tempLinkArray[i].to==FromKey))
			{
				return true;
			}

		}
		return false;
	}
	return false;


 }

 function IsConnected(NodeA,NodeB)
 {
	if (NodeA instanceof go.Node)
	{
		 it = NodeA.findNodesConnected();
		while (it.next())
		{

			if (it.value==NodeB)
			{

				return true;
			}
		}
		return false;
	}
	return ;


 }

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


  navigator= new go.Overview("navigator");
  navigator.observed = myDiagram;



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

  function CustomPanningTool() {
  go.PanningTool.call(this);
}
go.Diagram.inherit(CustomPanningTool, go.PanningTool);

CustomPanningTool.prototype.canStart = function() {
  if (!this.isEnabled) return false;
   diagram = this.diagram;
  if (diagram === null) return false;
  if (!diagram.allowHorizontalScroll && !diagram.allowVerticalScroll) return false;
  // require right button & that it has moved far enough away from the mouse down point, so it isn't a click
  // CHANGED to check InputEvent.right INSTEAD OF InputEvent.left
  if (!diagram.lastInput.right) return false;
  // don't include the following check when this tool is running modally
  if (diagram.currentTool !== this) {
    // mouse needs to have moved from the mouse-down point
    if (!this.isBeyondDragSize()) return false;
  }
  return true;
};

myDiagram.toolManager.panningTool = new CustomPanningTool();

 //
 function CustomLinkingTool() {
  go.LinkingTool.call(this);
}
go.Diagram.inherit(CustomLinkingTool, go.LinkingTool);

myDiagram.toolManager.linkingTool = new CustomLinkingTool();

CustomLinkingTool.prototype.doMouseUp = function() {
  if (this.isActive && this.findTargetPort(this.isForwards) === null) {

	 Node = this.originalFromNode;
	 pos = new go.Point(this.diagram.lastInput.documentPoint.x,this.diagram.lastInput.documentPoint.y);
	this.doCancel();
	 CreateNode=CreateNewNode(Node.data.category,Node.data.img,Node.data.text,pos);
	 newnode = myDiagram.findNodeForData(CreateNode);
	ConnectTwoNodes(Node.data.key,newnode.data.key);

  } else {

    go.LinkingTool.prototype.doMouseUp.call(this);
	//  Node = this.originalFromNode;
	// test=this;
	// alert(this.temporaryToNode+ " "+this.findTargetPort(this.isForwards));
	//ConnectTwoNodes(Node.data.key,this.temporaryToNode.key);

  }
};

function CreateNewNode(Category,img,text,pos)
{
	if (Category!=null && img!=null && text!=null
	&&Category!=undefined && img!=undefined && text!=undefined)
	{
		myDiagram.startTransaction("add node");
		// newnode = {category: DefaultPattern.category, text: DefaultPattern.text ,img: DefaultPattern.img};
		 newnode = {category: Category, img: img , text: text};
		if (pos!=null && pos!=undefined)
		{
			newnode.loc = new go.Point(pos.x,pos.y);
		}
		myDiagram.model.addNodeData(newnode);
		myDiagram.commitTransaction("add node");
		return newnode;
	}
	return false;
}

function ConnectTwoNodes(keyNodeA,keyNodeB)
{
	if (keyNodeA!=null && keyNodeA!=undefined && keyNodeB!=null && keyNodeB!=undefined)
	{

	    newlink = { from : keyNodeA, to: keyNodeB, color: "black"};
		myDiagram.startTransaction("Add Link");
		myDiagram.model.addLinkData(newlink);
		myDiagram.commitTransaction("Add Link");
		return true;
	}
	return false;

}





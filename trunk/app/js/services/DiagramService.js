

app.service("DiagramService",function(RuntimeService){

    var myDiagram , $$,Palette,DefaultPattern,myPartContextMenu,navigator,undoDisplay,model,myNodes,
        BSPalette,FlowPalette,PflowPalette,FurPalette;
    var UnsavedFileName = "(Unsaved File)";
    // brushes for furniture structures


    var bigfont = "bold 13pt Helvetica, Arial, sans-serif";
    var smallfont = "bold 11pt Helvetica, Arial, sans-serif";
    THRESHOLD =12500;
    var undoModel;
    var changedLog = document.getElementById("modelChangedLog");
    var editToRedo = null; // a node in the undoDisplay

    var editList = [];
    //--------------------------------------------------------------APIs

    function diagramInfo(model) {  // Tooltip info for the diagram's model
        return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
    }
    function linkInfo(d) {  // Tooltip info for a link data object
        return "Link:\nfrom " + d.from + " to " + d.to;
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
    // Tooltip info for a node data object
    function nodeInfo(d) {
        str = "Node: " + d.text + "\n";
        if (d.group)
            str += "member of " + d.group;
        else
            str += "top-level node";
        return str;
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

        selnode = myDiagram.selection.first();
        if (!(selnode instanceof go.Node)) return;
        myDiagram.startTransaction("add node and link");

        newnode = { key: "N" };
        myDiagram.model.addNodeData(newnode);
        newlink = { from: selnode.data.key, to: newnode.key };
        myDiagram.model.addLinkData(newlink);
        myDiagram.commitTransaction("add node and link");
    };


    //return the left most Node of a input tree
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
    //return the top Node of a input tree
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

                    if (nodes.value.location.y<=RuntimeService.miny) {


                        RuntimeService.miny=nodes.value.location.y; UpperNode(nodes.value);

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

    //split a horizontal flow into 2 horizontal flows
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
    //split a vertical flow into 2 vertical flows
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
            offsety = RuntimeService.miny-toNode.data.loc.y;

        }
        else
        {
            offsety = fromNode.data.loc.y-toNode.data.loc.y;
        }
        RuntimeService.miny = 99999999999999;


        myDiagram.moveParts(MoveSet,new go.Point(200,offsety),true);
        myDiagram.commitTransaction("Split flow");
    }


    function groupInfo(tt)
    {  // takes the tooltip, not a group node data object
        g = tt.adornedPart;  // get the Group that the tooltip adorns
        mems = g.memberParts.count;
        links = 0;
        it = g.memberParts;
        while (it.next()) {
            if (it.value instanceof go.Link) links++;
        }
        return "Group: " + g.data.text + "\n" + mems + " members including " + links + " links";
    }
    function highlightGroup(grp, show) {
        shape = grp.findObject("SHAPE");
        if (shape) {
            shape.fill = show ? dropFill : groupFill;
            shape.stroke = show ? dropStroke : groupStroke;
        }
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

    // clicking the button inserts a new node to the right of the selected node and adds a link to that new node
    function addNodeAndLink(e, obj)
    {
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
    function nodeStyle() {
        return {
            // the Node.location is at the center of each node
            locationSpot: go.Spot.Center,
            //isShadowed: shadows,
            //shadowColor: "#242424",
            // handle mouse enter/leave events to show/hide the ports
            mouseEnter: function (e, obj) { showPorts(obj.part, true); },
            mouseLeave: function (e, obj) { showPorts(obj.part, false); }
        };
    }
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
    function relayout()
    {
        myDiagram.layoutDiagram(true);
    }
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
        if (RuntimeService.tempLinkArray!=null)
        {
            len = RuntimeService.tempLinkArray.length;
            for ( i=0; i<=len-1; i++)
            {
                if ((RuntimeService.tempLinkArray[i].from==FromKey && RuntimeService.tempLinkArray[i].to==ToKey)
                    || (RuntimeService.tempLinkArray[i].from==ToKey && RuntimeService.tempLinkArray[i].to==FromKey))
                {
                    return true;
                }

            }
            return false;
        }
        return false;


    }
    function CreateNewNode(myDiagram,Category,img,text,pos)
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
    function NodeArray()
    {
        NodeArr = new Array();
        NodeArr[0]={category: "pic", text: "aggregator",img: "img/aggregator.png",des:"Used to combine a number of messages together into a single message"};
        NodeArr[1]={category: "pic", text: "delay",img: "img/delay.png",des: "Allows delaying the delivery of messages to some destination"};
        NodeArr[2]={category: "pic", text: "messagefilter",img: "img/messagefilter.png",des: "A special kind of Message Router that eliminates undesired messages from a channel based on a set of criteria"};
        NodeArr[3]={category: "pic", text: "router",img: "img/router.png",des:"Allows you to route messages to a given destination based on the contents of the message exchanges"};
        NodeArr[4]={category: "pic", text: "when",img: "img/when.png",des:""};
        NodeArr[5]={category: "pic", text: "recipient list",img: "img/recipientlist.png",des:"The Recipient List allows to route messages to a number of dynamically specified recipients"};
        NodeArr[6]={category: "pic", text: "messagetranslator",img: "img/messagetranslator.png",des:"A special filter to translate one data format into another"};
        NodeArr[7]={category: "pic", text: "resequencer",img: "img/resequencer.png",des:"Allows you to reorganise messages based on some comparator"};
        NodeArr[8]={category: "Comment", text: "comment", img:"",des:""};
        NodeArr[9]={category: "pic", text: "queue",img: "img/queue.png",des:""};
        NodeArr[10]= {category: "pic", text: "CXF",img: "img/endpoint.png",des:"The cxf component provides integration with Apache CXF for connecting to JAX-WS services hosted in CXF"};
        return NodeArr;
    }
    function partContextMenu($, DefaultPattern)
    {
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


    }
    function CreateUsecase(e,obj,DiagramService)
    {


        myDiagram.startTransaction("save as use case");
        //obj.part.adornedPart.containingGroup.collapseSubGraph();
        e.diagram.commandHandler.deleteSelection();
        //add a new node
        newnode = myNodes[9];
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
    //


    function changeTextSize(node, factor) {
        var tb = node.findObject("text");
        tb.scale *= factor;
    }

    function setAlignment(node, alignment){
        var tb = node.findObject("text");
        tb.textAlign = alignment;
    }
    function isNodeBold(node){
        var tb = node.findObject("text");
        var idx = tb.font.indexOf("bold");
        return idx > -1;
    }
    function isNodeItalic(node){
        var tb = node.findObject("text");
        var idx = tb.font.indexOf("italic");
        return idx > -1;
    }

    function toggleTextItalic(node) {
        var tb = node.findObject("text");
        if (isNodeItalic(node)) {
            var idx = tb.font.indexOf("italic");
            tb.font = tb.font.substr(idx + 7);
        } else {
            tb.font = "italic " + tb.font;
        }
    }
//    function getAlignment(node){
//        var tb = node.findObject("text");
//        return tb.textAlign;
//    }


    function toggleTextWeight(node) {
        var tb = node.findObject("text");
        if (isNodeBold(node)) {
            var idx = tb.font.indexOf("bold");
            tb.font = tb.font.substr(idx + 5);
        } else {
            tb.font = "bold " + tb.font;
        }
    }
    function textStyle() {
        return {
            margin: 6,
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true,
            font: bigfont
        }
    }
    // clicking the button on an UndesiredEvent node inserts a new text object into the panel
    function addReason(e, obj) {
        var adorn = obj.part;
        if (adorn === null) return;
        e.handled = true;
        //var list = adorn.adornedPart.findObject("ReasonList");
        var arr = adorn.adornedPart.data.reasonsList;
        // and add it to the Array of port data
        myDiagram.startTransaction("add reason");
        myDiagram.model.addArrayItem(arr, {});
        myDiagram.commitTransaction("add reason");
    }
    function LoadNodeTempForFreeHand(){
        myDiagram.nodeTemplate =
            $$(go.Part,
                { locationSpot: go.Spot.Center },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                { selectionAdorned: true, selectionObjectName: "SHAPE",
                    selectionAdornmentTemplate:  // custom selection adornment: a cyan rectangle
                        $$(go.Adornment, "Auto",
                            $$(go.Shape, { stroke: "cyan", fill: null }),
                            $$(go.Placeholder))
                },
                { resizable: true, resizeObjectName: "SHAPE" },
                { rotatable: true, rotateObjectName: "SHAPE" },
                $$(go.Shape,
                    { name: "SHAPE", fill: null, strokeWidth: 1.5 },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                    new go.Binding("angle").makeTwoWay(),
                    new go.Binding("geometry", "geo", go.Geometry.parse).makeTwoWay(go.Geometry.stringify),
                    new go.Binding("fill"),
                    new go.Binding("stroke"),
                    new go.Binding("strokeWidth")));
    }
    function BasicNodeTemplate(){
        myDiagram.nodeTemplate =// the default category
            $$(go.Node, go.Panel.Spot,
                // The Node.location comes from the "loc" property of the node data,
                // If the Node.location is changed, it updates the "loc" property of the node data,
                new go.Binding("location", "loc").makeTwoWay(),
                { locationSpot: go.Spot.Center, isShadowed: true },
                //{ resizable: true },{ rotatable: true},
                { mouseEnter: function(e, obj) { showPorts(obj.part, true); },
                    mouseLeave: function(e, obj) { showPorts(obj.part, false); } },
                // the main object is a Panel that surrounds a picture over a TextBlock with a rectangular Shape
                $$(go.Panel, go.Panel.Auto,
                    $$(go.Shape,
                        {name: "shape", fill:greengrad },new go.Binding("figure","figure").makeTwoWay()
                        ,new go.Binding("fill","fill")
                    ),
                    $$(go.TextBlock,
                        {  margin: 5, text: "text",name:"text",
                            font: "bold 9pt Helvetica, Arial, sans-serif", editable: true ,isMultiline: false,
                            stroke: "rgb(190, 247, 112)" },new go.Binding("text","text")
                    )),

                // four named ports, one on each side:
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
            );


    }
    function LoadNodeTemplateForPolygon(){
        myDiagram.nodeTemplate =
            $$(go.Node,
                { locationSpot: go.Spot.Center },
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                { selectionAdorned: true, selectionObjectName: "SHAPE",
                    selectionAdornmentTemplate:  // custom selection adornment: a cyan rectangle
                        $$(go.Adornment, "Auto",
                            $$(go.Shape, { stroke: "cyan", fill: null }),
                            $$(go.Placeholder))
                },
                { resizable: true, resizeObjectName: "SHAPE" },
                { rotatable: true, rotateObjectName: "SHAPE" },
                $$(go.Shape,
                    { name: "SHAPE", fill: "lightgray", strokeWidth: 1.5 },
                    new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                    new go.Binding("angle").makeTwoWay(),
                    new go.Binding("geometry", "geo", go.Geometry.parse).makeTwoWay(go.Geometry.stringify),
                    new go.Binding("fill"),
                    new go.Binding("stroke"),
                    new go.Binding("strokeWidth")));

    }
    // enable or disable all command buttons
    function enableAll() {
        var cmdhnd = myDiagram.commandHandler;
        enable("AlignLeft", cmdhnd.canAlignSelection());
        enable("AlignRight", cmdhnd.canAlignSelection());
        enable("AlignTop", cmdhnd.canAlignSelection());
        enable("AlignBottom", cmdhnd.canAlignSelection());
        enable("AlignCenterX", cmdhnd.canAlignSelection());
        enable("AlignCenterY", cmdhnd.canAlignSelection());
        enable("AlignRow", cmdhnd.canAlignSelection());
        enable("AlignColumn", cmdhnd.canAlignSelection());
        enable("AlignGrid", cmdhnd.canAlignSelection());
    }
    // converts data about the part into a string
    function tooltipTextConverter(data) {
        if (data.item != undefined) return data.item;
        return "(unnamed item)";
    }





    return {
        getDiagram : function(){
           return myDiagram

       },
        getNodeArray : function(){
           return myNodes;
       },
        getPalette : function(){
           return Palette;
       },
        getGoMake : function(){
           return $$;
       },
        getUndoDisplay : function(){
        return undoDisplay;
       },
        InitDiagram: function(){
           myDiagram = new go.Diagram("myDiagram") // create a Diagram for the DIV HTML element},
       } ,
        Init : function(nodes){
           myDiagram = new go.Diagram("myDiagram")  // create a Diagram for the DIV HTML element
           $$ = go.GraphObject.make // for conciseness in defining templates
           // initialize the Palette
           Palette = $$(go.Palette, "myPalette") // must name or refer to the DIV HTML element
           BSPalette = $$(go.Palette, "bsPalette") // must name or refer to the DIV HTML element
           FlowPalette = $$(go.Palette, "flowPalette") // must name or refer to the DIV HTML element
           PflowPalette = $$(go.Palette, "pflowPalette") // must name or refer to the DIV HTML element
           FurPalette = $$(go.Palette, "furPalette") // must name or refer to the DIV HTML element




           myNodes = new NodeArray();
//           myNodes = nodes;
           DefaultPattern= myNodes[0]
           myPartContextMenu = new partContextMenu($$,DefaultPattern)
           navigator= new go.Overview("navigator")
           navigator.observed = myDiagram
       },
        textManipulation: function (feature){
        var sel = myDiagram.selection;
        if(sel.count === 0){
            return;
        }
        var obj = sel.first();
        switch(feature){
            case "bold":
                toggleTextWeight(obj);
                break;
            case "italic":
                toggleTextItalic(obj);
                break;
            case "bigger":
                changeTextSize(obj, 1.1);
                break;
            case "smaller":
                changeTextSize(obj, 1/1.1);
                break;
            default:
                if(feature === "left" || feature === "center" || feature === "right"){
                    setAlignment(obj, feature);
                }
                break;
        }
    },
        FreeHandMode : function(draw){
            // assume FreehandDrawingTool is the first tool in the mouse-down-tools list
            var tool = myDiagram.toolManager.mouseDownTools.elt(0);
            tool.isEnabled = draw;
            //Reset the basic node template
            //BasicNodeTemplate();

        },
        PolylineMode : function (draw, polygon) {
            // assume PolygonDrawingTool is the first tool in the mouse-down-tools list
            var tool = myDiagram.toolManager.mouseDownTools.elt(0);
            tool.isEnabled = draw;
            tool.isPolygon = polygon;
            tool.archetypePartData.fill = (polygon ? "yellow" : null);
        },
        newDocument : function()  {
        var currentFile = document.getElementById("currentFile");
        // checks to see if all changes have been saved
        if (myDiagram.isModified) {
            var fileName = currentFile.textContent;
            var save = confirm("Would you like to save changes to " + fileName + "?");
            if (save) {
                if (fileName == UnsavedFileName) {
                    saveDocumentAs();
                } else {
                    saveDocument();
                }
            }
        }
        // loads a blank diagram
        myDiagram.model = new go.GraphLinksModel();
        myDiagram.model.undoManager.isEnabled = true;
        myDiagram.isModified = false;
        currentFile.innerHTML = UnsavedFileName;
    },

        LocalStorage : function(){
            if (typeof (Storage) == "undefined" || navigator.appName == "Microsoft Internet Explorer") {
                var currentFile = document.getElementById("currentFile");
                currentFile.innerHTML = "Sorry! No web storage support. \n If you're using Internet Explorer, you must load the page from a server for local storage to work.";
            } else {
                // displays cached floor plan files in the listboxes
                var openlistbox = document.getElementById("mySavedFiles2");
                var removelistbox = document.getElementById("mySavedFiles2");
                for (key in localStorage) {
                    var storedFile = localStorage.getItem(key);
                    if (storedFile === null || storedFile === undefined) continue;
                    var option = document.createElement('option');
                    option.value = key;
                    option.text = key;
                    openlistbox.add(option, null)
                    removelistbox.add(option, null)
                }
            }


        },


        //load Node Template
        LoadNodeTemplate : function ($$)
        {
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
        var bluegrad = $$(go.Brush, go.Brush.Linear, { 0: "#B0E0E6", 1: "#87CEEB" });
        var whitegrad = $$(go.Brush, go.Brush.Linear, { 0: "#F0F8FF", 1: "#E6E6FA" });
        var graybrush = $$(go.Brush, go.Brush.Linear, { 0.0: "white", 1.0: "gray" });
        var lightText = 'whitesmoke';
        var darkText = '#454545';
        var startColor = "#79C900";
        var mainColor = "#00A9C9";
        var endColor = "#DC3C00";

            // sets the qualities of the tooltip
            var tooltiptemplate =
                $$(go.Adornment, go.Panel.Auto,
                    $$(go.Shape, "RoundedRectangle",
                        { fill: "whitesmoke", stroke: "gray" }),
                    $$(go.TextBlock,
                        { margin: 3, editable: true },
                        new go.Binding("text", "", tooltipTextConverter)));


            // define the Node template for regular nodes
        myDiagram.nodeTemplateMap.add("",// the default category
            $$(go.Node, go.Panel.Spot,
                // The Node.location comes from the "loc" property of the node data,
                // If the Node.location is changed, it updates the "loc" property of the node data,
                new go.Binding("location", "loc").makeTwoWay(),
                { locationSpot: go.Spot.Center, isShadowed: true },
                //{ resizable: true },{ rotatable: true},
                { mouseEnter: function(e, obj) { showPorts(obj.part, true); },
                    mouseLeave: function(e, obj) { showPorts(obj.part, false); } },
                // the main object is a Panel that surrounds a picture over a TextBlock with a rectangular Shape
                $$(go.Panel, go.Panel.Auto,
                    $$(go.Shape,
                        {name: "shape", fill:greengrad },new go.Binding("figure","figure").makeTwoWay()
                        ,new go.Binding("fill","fill")
                    ),
                    $$(go.TextBlock,
                        {  margin: 5, text: "text",name:"text",
                            font: "bold 9pt Helvetica, Arial, sans-serif", editable: true ,isMultiline: false,
                            stroke: "rgb(190, 247, 112)" },new go.Binding("text","text")
                    )),

                // four named ports, one on each side:
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


        //Define another node template name : pic
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
                        {column:0,row:1,editable: true,isMultiline: false, textAlign: "center", name:"text",
                            font: "bold 9pt Helvetica, Arial, sans-serif"},new go.Binding("text", "text").makeTwoWay()),
                    $$(go.TextBlock,
                        {column:0,row:2,editable: true,isMultiline: true, textAlign: "center", name:"text",
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
        // Define another node template : comment
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
        // Define another node template : Shape
//        myDiagram.nodeTemplateMap.add("basicShape",
//            $$(go.Node, "Vertical",
//                {
//                    locationSpot: go.Spot.Center, locationObjectName: "SHAPE",
//                    selectionAdorned: false,  // no selection handle when selected
//                    resizable: true, resizeObjectName: "SHAPE",  // user can resize the Shape
//                    rotatable: true, rotateObjectName: "SHAPE",  // user can rotate the Shape without rotating the label
//                    layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized  // don't re-layout when node changes size
//                },
//                $$(go.Shape,new go.Binding("figure","figure"),
//                    {
//                        name: "SHAPE",  // named so that the above properties can refer to this particular GraphObject
//                          // the name of the Shape figure, which automatically gives the Shape a Geometry
//                        width: 50, height: 50,
//                        fill: graybrush, strokeWidth: 2
//                    }),
//                $$(go.TextBlock,  // the label
//                     new go.Binding("text","text") )
//            ));
        myDiagram.nodeTemplateMap.add("basicShape",  // the default category
            $$(go.Node, "Spot", nodeStyle(),
                // The Node.location comes from the "loc" property of the node data,
                // converted by the Point.parse method.
                // If the Node.location is changed, it updates the "loc" property of the node data,
                // converting back using the Point.stringify method.
                new go.Binding("location", "loc").makeTwoWay(),
                // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                $$(go.Panel, "Auto",
                    $$(go.Shape, "Rectangle",
                        { width: 50, height: 50,
                        fill: graybrush, strokeWidth: 2},
                        new go.Binding("figure", "figure")),
                    $$(go.TextBlock,
                        { font: "bold 11pt Helvetica, Arial, sans-serif",
                            stroke: lightText,
                            margin: 8,
                            maxSize: new go.Size(160, NaN),
                            wrap: go.TextBlock.WrapFit,
                            editable: true },
                        new go.Binding("text", "text").makeTwoWay())
                ),
                // four named ports, one on each side:
                makePort("T", go.Spot.Top, false, true),
                makePort("L", go.Spot.Left, true, true),
                makePort("R", go.Spot.Right, true, true),
                makePort("B", go.Spot.Bottom, true, false)
            ));

        myDiagram.nodeTemplateMap.add("Start",
            $$(go.Node, "Spot", nodeStyle(),
                new go.Binding("location", "loc").makeTwoWay(),
                $$(go.Panel, "Auto",
                    $$(go.Shape, "Octagon",
                        { minSize: new go.Size(40, 60), fill: startColor, stroke: null }),
                    $$(go.TextBlock, "Start",
                        { margin: 5,
                            font: "bold 11pt Helvetica, Arial, sans-serif",
                            stroke: lightText })
                ),
                // three named ports, one on each side except the top, all output only:
                makePort("L", go.Spot.Left, true, false),
                makePort("R", go.Spot.Right, true, false),
                makePort("B", go.Spot.Bottom, true, false)
            ));

        myDiagram.nodeTemplateMap.add("End",
            $$(go.Node, "Spot", nodeStyle(),
                new go.Binding("location", "loc").makeTwoWay(),
                $$(go.Panel, "Auto",
                    $$(go.Shape, "Octagon",
                        { minSize: new go.Size(40, 60), fill: endColor, stroke: null }),
                    $$(go.TextBlock, "End",
                        { margin: 5,
                            font: "bold 11pt Helvetica, Arial, sans-serif",
                            stroke: lightText })
                ),
                // three named ports, one on each side except the bottom, all input only:
                makePort("T", go.Spot.Top, false, true),
                makePort("L", go.Spot.Left, false, true),
                makePort("R", go.Spot.Right, false, true)
            ));

        myDiagram.nodeTemplateMap.add("Source",
            $$(go.Node, "Auto",
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $$(go.Shape, "RoundedRectangle",
                    { fill: bluegrad,
                        portId: "", fromLinkable: true, cursor: "pointer"  }),
                $$(go.TextBlock, "Source", textStyle(),
                    new go.Binding("text", "text").makeTwoWay())
            ));

        myDiagram.nodeTemplateMap.add("DesiredEvent",
            $$(go.Node, "Auto",
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                $$(go.Shape, "RoundedRectangle",
                    { fill: greengrad, portId: "", toLinkable: true }),
                $$(go.TextBlock, "Success!", textStyle(),
                    new go.Binding("text", "text").makeTwoWay())
            ));

        // Undesired events have a special adornment that allows adding additional "reasons"
        var UndesiredEventAdornment =
            $$(go.Adornment, "Spot",
                $$(go.Panel, "Auto",
                    $$(go.Shape, { fill: null, stroke: "blue", strokeWidth: 2 }),
                    $$(go.Placeholder)),
                // the button to create a "next" node, at the top-right corner
                $$("Button",
                    { alignment: go.Spot.BottomRight,
                        click: addReason },  // this function is defined below
                    $$(go.Shape, "TriangleDown", { desiredSize: new go.Size(10, 10) })
                )
            );

        var reasonTemplate = $$(go.Panel, "Horizontal",
            $$(go.TextBlock, "Reason",
                {
                    margin: new go.Margin(4,0,0,0),
                    maxSize: new go.Size(200, NaN),
                    wrap: go.TextBlock.WrapFit,
                    stroke: "whitesmoke",
                    editable: true,
                    font: smallfont
                },
                new go.Binding("text", "text").makeTwoWay())
        );


        myDiagram.nodeTemplateMap.add("UndesiredEvent",
            $$(go.Node, "Auto",
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                { selectionAdornmentTemplate: UndesiredEventAdornment },
                $$(go.Shape, "RoundedRectangle",
                    { fill: redgrad, portId: "", toLinkable: true }),
                $$(go.Panel, "Vertical", {defaultAlignment: go.Spot.TopLeft},

                    $$(go.TextBlock, "Drop", textStyle(),
                        { stroke: "whitesmoke",
                            minSize: new go.Size(80, NaN) },
                        new go.Binding("text", "text").makeTwoWay()),

                    $$(go.Panel, "Vertical",
                        { name: "ReasonList", defaultAlignment: go.Spot.TopLeft,
                            itemTemplate: reasonTemplate },
                        new go.Binding("itemArray", "reasonsList").makeTwoWay()
                    )
                )
            ));
            myDiagram.nodeTemplateMap.add("furniture",
                $$(go.Node, "Spot",
                    {
                        locationObjectName: "SHAPE",
                        locationSpot: go.Spot.Center,
                        toolTip: tooltiptemplate,
                        selectionAdorned: false  // use a Binding on the Shape.stroke to show selection
                    },
                    // remember the location of this Node
                    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                    // move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
                    new go.Binding("layerName", "isSelected", function(s) { return s ? "Foreground" : ""; }).ofObject(),
                    // can be resided according to the user's desires
                    { resizable: true, resizeObjectName: "SHAPE" },
                    { rotatable: true, rotateObjectName: "SHAPE" },
                    $$(go.Shape,
                        {
                            name: "SHAPE",
                            // the following are default values;
                            // actual values may come from the node data object via data-binding
                            geometryString: "F1 M0 0 L20 0 20 20 0 20 z",
                            fill: "rgb(130, 130, 256)"
                        },
                        // this determines the actual shape of the Shape
                        new go.Binding("geometryString", "geo"),
                        // allows the color to be determined by the node data
                        new go.Binding("fill", "color"),
                        // selection causes the stroke to be magenta instead of black
                        new go.Binding("stroke", "isSelected", function(s) { return s ? "magenta" : "black"; }).ofObject(),
                        // remember the size of this node
                        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                        // can set the angle of this Node
                        new go.Binding("angle", "angle").makeTwoWay()
                    )
                ));







            //selection adornment template which is showed when the node is selected
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




    },
        //load palette
        LoadPalette : function ()
        {
        Palette.layout= $$(go.GridLayout,{ comparer: go.GridLayout.smartComparer });
        Palette.layout.wrappingColumn = NaN;
        Palette.layout.wrappingWidth=NaN;
        Palette.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
        Palette.groupTemplate = myDiagram.groupTemplate;
        // specify the contents of the Palette
        Palette.model = new go.GraphLinksModel(  // specify the contents of the Palette
            [

                myNodes[0],myNodes[1],myNodes[2],myNodes[3],myNodes[4],myNodes[5],myNodes[6],myNodes[7],myNodes[8],
                myNodes[9],myNodes[10]

            ]);
    },
        LoadFurPalette: function(){
            var wood = $$(go.Brush, go.Brush.Linear, { 0: "#964514", 1: "#5E2605" });
            var wall = $$(go.Brush, go.Brush.Linear, { 0: "#A8A8A8", 1: "#545454" });
            var blue = $$(go.Brush, go.Brush.Linear, { 0: "#42C0FB", 1: "#009ACD" });
            var metal = $$(go.Brush, go.Brush.Linear, { 0: "#A8A8A8", 1: "#474747" });
            var green = $$(go.Brush, go.Brush.Linear, { 0: "#9CCB19", 1: "#698B22" });
            FurPalette.layout= $$(go.GridLayout,{ comparer: go.GridLayout.smartComparer });
            FurPalette.layout.wrappingColumn = NaN;
            FurPalette.layout.wrappingWidth=NaN;
            FurPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
            FurPalette.groupTemplate = myDiagram.groupTemplate;

            // specify the contents of the Palette
            FurPalette.model = new go.GraphLinksModel(  // specify the contents of the Palette
                [{
                    category: "furniture",
                    key: 1,
                    geo: "F1 M0 0 L5,0 5,40 0,40 0,0z x M0,0 a40,40 0 0,0 -40,40 ",
                    item: "left door",
                    color: wall
                },
                    {
                        category: "furniture",
                        key: 2,
                        geo: "F1 M0 0 L5,0 5,40 0,40 0,0z x M5,0 a40,40 0 0,1 40,40 ",
                        item: "right door",
                        color: wall
                    },
                    {
                        category: "furniture",
                        key: 3, angle: 90,
                        geo: "F1 M0,0 L0,100 12,100 12,0 0,0z",
                        item: "wall",
                        color: wall
                    },
                    {
                        category: "furniture",
                        key: 4, angle: 90,
                        geo: "F1 M0,0 L0,50 10,50 10,0 0,0 x M5,0 L5,50z",
                        item: "window",
                        color: "whitesmoke"
                    },
                    {
                        category: "furniture",
                        key: 5,
                        geo: "F1 M0,0 L50,0 50,12 12,12 12,50 0,50 0,0 z",
                        item: "corner",
                        color: wall
                    },
                    {
                        category: "furniture",
                        key: 6,
                        geo: "F1 M0 0 L40 0 40 40 0 40 0 0 x M0 10 L40 10 x M 8 10 8 40 x M 32 10 32 40 z",
                        item: "arm chair",
                        color: blue
                    },
                    {
                        category: "furniture",
                        key: 7,
                        geo: "F1 M0 0 L80,0 80,40 0,40 0 0 x M0,10 L80,10 x M 7,10 7,40 x M 73,10 73,40 z",
                        item: "couch",
                        color: blue
                    },
                    {
                        category: "furniture",
                        key: 8,
                        geo: "F1 M0 0 L30 0 30 30 0 30 z",
                        item: "Side Table",
                        color: wood
                    },
                    {
                        category: "furniture",
                        key: 9,
                        geo: "F1 M0 0 L80,0 80,90 0,90 0,0 x M0,7 L80,7 x M 0,30 80,30 z",
                        item: "queen bed",
                        color: green
                    },
                    {
                        category: "furniture",
                        key: 10,
                        geo: "F1 M5 5 L30,5 35,30 0,30 5,5 x F M0 0 L 35,0 35,5 0,5 0,0 z",
                        item: "chair",
                        color: wood
                    },
                    {
                        category: "furniture",
                        key: 11,
                        geo: "F1 M0 0 L50,0 50,90 0,90 0,0 x M0,7 L50,7 x M 0,30 50,30 z",
                        item: "twin bed",
                        color: green
                    },
                    {
                        category: "furniture",
                        key: 12,
                        geo: "F1 M0 0 L0 60 80 60 80 0z",
                        item: "kitchen table",
                        color: wood
                    },
                    {
                        category: "furniture",
                        key: 13,
                        geo: "F1 M 0,0 a35,35 0 1,0 1,-1 z",
                        item: "round table",
                        color: wood
                    },
                    {
                        category: "furniture",
                        key: 14,
                        geo: "F1 M 0,0 L35,0 35,30 0,30 0,0 x M 5,5 L 30, 5 30,25 5,25 5,5 x M 17,2 L 17,10 19,10 19,2 17,2 z",
                        item: "kitchen sink",
                        color: metal
                    },
                    {
                        category: "furniture",
                        key: 15,
                        geo: "F1 M0,0 L55,0, 55,50, 0,50 0,0 x M 40,7 a 7,7 0 1 0 0.00001 0z x M 40,10 a 4,4 0 1 0 0.00001 0z x M 38,27 a 7,7 0 1 0 0.00001 0z x M 38,30 a 4,4 0 1 0 0.00001 0z x M 16,27 a 7,7 0 1 0 0.00001 0z xM 16,30 a 4,4 0 1 0 0.00001 0z x M 14,7 a 7,7 0 1 0 0.00001 0z x M 14,10 a 4,4 0 1 0 0.00001 0z",
                        item: "stove",
                        color: metal
                    },
                    {
                        category: "furniture",
                        key: 16,
                        geo: "F1 M0,0 L55,0, 55,50, 0,50 0,0 x F1 M0,51 L55,51 55,60 0,60 0,51 x F1 M5,60 L10,60 10,63 5,63z",
                        item: "refrigerator",
                        color: metal
                    },
                    {
                        category: "furniture",
                        key: 17,
                        geo: "F1 M0,0 100,0 100,40 0,40z",
                        item: "bookcase",
                        color: wood
                    },
                    {
                        category: "furniture",
                        key: 18,
                        geo: "F1 M0,0 70,0 70,50 0,50 0,0 x F1 M15,58 55,58 55,62 15,62 x F1 M17,58 16,50 54,50 53,58z",
                        item: "desk",
                        color: wood
                    }

                ]
            )

        },
        LoadFlowPalette : function ()
        {
           FlowPalette.layout= $$(go.GridLayout,{ comparer: go.GridLayout.smartComparer });
           FlowPalette.layout.wrappingColumn = NaN;
           FlowPalette.layout.wrappingWidth=NaN;
           FlowPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
           FlowPalette.groupTemplate = myDiagram.groupTemplate;
           // specify the contents of the Palette
           FlowPalette.model = new go.GraphLinksModel(  // specify the contents of the Palette
               [
                   { category: "Start", text: "Start" },
                   { text: "Step" },
                   { text: "???", figure: "Diamond" },
                   { category: "End", text: "End" },
                   { category: "Comment", text: "Comment", figure: "RoundedRectangle" }


               ]);
       },
        LoadpFlowPalette: function(){
        PflowPalette.layout= $$(go.GridLayout,{ comparer: go.GridLayout.smartComparer });
        PflowPalette.layout.wrappingColumn = NaN;
        PflowPalette.layout.wrappingWidth=NaN;
        PflowPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
        PflowPalette.groupTemplate = myDiagram.groupTemplate;
        // specify the contents of the Palette
        PflowPalette.model = new go.GraphLinksModel(  // specify the contents of the Palette
            [
                { category: "Source" },

                { category: "DesiredEvent" },
                { category: "UndesiredEvent", reasonsList: [{}] },
                { category: "Comment" }

            ]);


    },
        LoadBasicShapePalette: function(){
            var graybrush = $$(go.Brush, go.Brush.Linear, { 0.0: "white", 1.0: "gray" });
            var lightText = 'whitesmoke';
            BSPalette.layout= $$(go.GridLayout,{ comparer: go.GridLayout.smartComparer });
            BSPalette.layout.wrappingColumn = NaN;
            BSPalette.layout.wrappingWidth=NaN;
            BSPalette.nodeTemplateMap = myDiagram.nodeTemplateMap;  // share the templates used by myDiagram
            BSPalette.groupTemplate = myDiagram.groupTemplate;
            var shapes=[];
            // for each kind of figure, create a Shape using that figure
            for (var k in go.Shape.FigureGenerators) {
                instance ={category: "basicShape",figure: k}

                shapes.push(instance)

            }

            BSPalette.model = new go.GraphLinksModel(  // specify the contents of the Palette
                shapes
                );

    //        this Brush is shared by all of the Shapes
    //        var graybrush = $$(go.Brush, go.Brush.Linear, { 0.0: "white", 1.0: "gray" });
    //
    //        // for each kind of figure, create a Shape using that figure
    //        for (var k in go.Shape.FigureGenerators) {
    //            // ignore all-lower-case figure names
    //            if (k.toLowerCase() === k) continue;
    //            // add a Node consisting of a Shape with this kind of figure
    //            // and a TextBlock showing the figure name
    //            BSPalette.add(
    //                $$(go.Node, "Vertical",
    //                    {
    //                        locationSpot: go.Spot.Center, locationObjectName: "SHAPE",
    //                        selectionAdorned: false,  // no selection handle when selected
    //                        resizable: true, resizeObjectName: "SHAPE",  // user can resize the Shape
    //                        rotatable: true, rotateObjectName: "SHAPE",  // user can rotate the Shape without rotating the label
    //                        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized  // don't re-layout when node changes size
    //                    },
    //                    $$(go.Shape,
    //                        {
    //                            name: "SHAPE",  // named so that the above properties can refer to this particular GraphObject
    //                            figure: k,  // the name of the Shape figure, which automatically gives the Shape a Geometry
    //                            width: 50, height: 50,
    //                            fill: graybrush, strokeWidth: 2
    //                        }),
    //                    $$(go.TextBlock,  // the label
    //                        { text: k })
    //                ));
    //        }


        },
        //load Settings

        LoadSettings : function ()
        {

            myDiagram.allowZoom=true; // allow zoom ability
            myDiagram.grid.visible=true;// show grid on the diagram
            // when the user drags a node, also move/copy/delete the whole subtree starting with that node
            myDiagram.commandHandler.copiesTree = true;
            myDiagram.initialContentAlignment = go.Spot.Center;  // center the whole graph
            myDiagram.initialAutoScale = go.Diagram.Uniform; //Diagram are scaled uniformly until the documentBounds fits in the view.
            // Diagram.toolManager.linkingTool.direction = go.LinkingTool.ForwardsOnly;
            myDiagram.initialContentAlignment = go.Spot.Center;

            // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
            myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
            myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
            // have mouse wheel events zoom in and out instead of scroll up and down
            //myDiagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom;
            myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;    // enable dragging tool
            myDiagram.toolManager.resizingTool.isGridSnapEnabled = true;    // enable resizing tool
            myDiagram.undoManager.isEnabled = true; //enable undo ability


            // allow double-click in background to create a new node
            myDiagram.toolManager.clickCreatingTool.archetypeNodeData =DefaultPattern;

            // allow the group command to execute
            myDiagram.commandHandler.archetypeGroupData =
            { key: "Group", isGroup: true, color: "blue" };
            // modify the default group template to allow ungrouping
            myDiagram.groupTemplate.ungroupable = true;
            myDiagram.allowDrop = true;  // handle drag-and-drop from the Palette
            // create the model data that will be represented in both diagrams simultaneously
            myDiagram.model = $$(go.GraphLinksModel,
                {
                    linkFromPortIdProperty: "fromPort",  // required information:
                    linkToPortIdProperty: "toPort"      // identifies data property names
                });
            model = myDiagram.model;
            myDiagram.autoScrollRegion= (100, 100, 100, 100);
            myDiagram.commandHandler = new DrawCommandHandler();

            myDiagram.commandHandler.arrowKeyBehavior = "move";

            myDiagram.toolManager.rotatingTool = new RotateMultipleTool();

//            myDiagram.toolManager.resizingTool = new ResizeMultipleTool();

            myDiagram.toolManager.draggingTool = new GuidedDraggingTool();
            myDiagram.toolManager.draggingTool.horizontalGuidelineColor = "blue";
            myDiagram.toolManager.draggingTool.verticalGuidelineColor = "blue";
            myDiagram.toolManager.draggingTool.centerGuidelineColor = "green";
            myDiagram.toolManager.draggingTool.guidelineWidth = 1;






        } ,
        LoadFreeHand : function(){
            // create drawing tool for myDiagram
            var tool = new FreehandDrawingTool();
            // provide the default JavaScript object for a new polygon in the model
            tool.archetypePartData =
            { stroke: "green", strokeWidth: 3 };
            // install as first mouse-down-tool
            myDiagram.toolManager.mouseDownTools.insertAt(0, tool);
            LoadNodeTempForFreeHand();



        },
        LoadPolygonMode : function(){
            // create polygon drawing tool for myDiagram
            var tool = new PolygonDrawingTool();
            // provide the default JavaScript object for a new polygon in the model
            tool.archetypePartData =
            { fill: "yellow", stroke: "blue", strokeWidth: 3 };
            tool.isPolygon = true;  // for a polyline drawing tool set this property to false
            // install as first mouse-down-tool
            myDiagram.toolManager.mouseDownTools.insertAt(0, tool);
            LoadNodeTemplateForPolygon()
        },

        //load Link Template
        LoadLinkTemplate : function ()
        {
            // define the link template
            myDiagram.linkTemplate =
                $$(go.Link,  // the whole link panel
                    { selectionAdornmentTemplate:
                        $$(go.Adornment, //when the link is selected
                            $$(go.Shape,  // the link path shape
                                { isPanelMain: true, stroke: "dodgerblue", strokeWidth: 3 }),
                            $$(go.Shape,  // the arrowhead
                                { toArrow: "Standard", fill: "dodgerblue", stroke: null, scale: 1 })),
                        routing: go.Link.Normal,
                        curve: go.Link.Bezier,
                        toShortLength: 2 },

                    {
                        routing: go.Link.AvoidsNodes, // links will avoid nodes
                        curve: go.Link.JumpOver, // when 2 links cross, 1 will jump over
                        toShortLength: 2,
                        relinkableFrom: true,  corner: 5,
                        relinkableTo: true, reshapable:true //resegmentable: true,
                        /* mouseDragEnter: domouseDragEnter */},
                    //when the link is not selected
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
        },

        //load Group Template
        LoadGroupTemlate : function ()
        {
            //Define some fills and strokes
            groupFill = "rgba(128,128,128,0.2)";
            groupStroke = "gray";
            dropFill = "pink";
            dropStroke = "red";
            // Groups consist of a title in the color given by the group node data
            // above a translucent gray rectangle surrounding the member parts

            //Default group template , also indicate group's template when it's opened
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

            //group 's template when it's collapsed
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

        },

        //background contextmenu
        ContextMenu : function (){
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

        },

        SetCustomPanningTool : function(){
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


       },

        SetCustomLinkingTool : function(){
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
                    CreateNode=CreateNewNode(myDiagram,Node.data.category,Node.data.img,Node.data.text,pos);
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


        },

        // DiagramListener when ExternalObjectsDropped
        ExternalObjectsDroppedListener : function(RuntimeService,myDiagram){
           myDiagram.addDiagramListener("ExternalObjectsDropped",
               function(e)
               {
                   document.getElementById('myDiagram').focus();
                   myDiagram.toolManager.draggingTool.reset();  // remove any guidelines

                   JustAddedNode = e.subject.first();
                   if (myDiagram.model.nodeDataArray!=null)
                   {


                       for ( i=0; i<=RuntimeService.tempExternalLinkArray.length-1;i++)
                       {

                           link = RuntimeService.tempExternalLinkArray[i];
                           // alert(link.from+ " "+ link.to);
                           if (IsExisted(link)==false && (link.from==JustAddedNode.data.key || link.to == JustAddedNode.data.key)
                               &&(link.from!=link.to))
                           {

                               myDiagram.startTransaction("Add Link");
                               myDiagram.model.addLinkData(link);
                               myDiagram.commitTransaction("Add Link");
                           }

                       }
                       RuntimeService.tempExternalLinkArray.splice(0,RuntimeService.tempExternalLinkArray.length);

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
                               RuntimeService.tempLinkArray.pop(link);
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

       },


        addChangedListener : function (myDiagram){
            myDiagram.model.addChangedListener(function(e) {

                if (e.change == go.ChangedEvent.Transaction
                    && (e.propertyName === "CommittedTransaction" || e.propertyName === "FinishedUndo" || e.propertyName === "FinishedRedo")) {
                    document.getElementById("mySavedModel").textContent = myDiagram.model.toJson();


                }



                // Add entries into the log
                var changes = e.toString();
                if (changes[0] !== "*") changes = "  " + changes;
    //            changedLog.innerHTML += changes + "<br/>"
    //            changedLog.scrollTop = changedLog.scrollHeight;

            });
        },
        ChangedSelection : function(){
            // notice whenever the selection may have changed
            myDiagram.addDiagramListener("ChangedSelection", function(e) {
                enableAll();
            });
        },

        mouseDrop : function(RuntimeService,myDiagram)
        {
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
                if (RuntimeService.tempLinkArray!=null)
                {

                    RuntimeService.tempLinkArray.splice(0,RuntimeService.tempLinkArray.length);

                }

                //remove all the templinks for each pair of nodes whose distance is above THRESHOLD
                list = myDiagram.nodes;
                itr = list.iterator;
                holdNode= myDiagram.selection.first();
                while (itr.next()) {
                    val = itr.value;
                    if (holdNode.data.loc!=null && holdNode.data.category==="pic")
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
                                RuntimeService.tempLinkArray.pop(link);
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
        },
        DefineUndoDiagram : function($$){


            undoDisplay =
                   $$(go.Diagram, "undoDisplayCanvas",
                       { allowMove: false,
                           maxSelectionCount: 1 });

               undoDisplay.nodeTemplate =
                   $$(go.Node,
                       $$("TreeExpanderButton",
                           { width: 14,
                               "ButtonBorder.fill": "whitesmoke" }),
                       $$(go.Panel, go.Panel.Horizontal,
                           { position: new go.Point(16, 0) },
                           new go.Binding("background", "color"),
                           $$(go.TextBlock, {margin: 2},
                               new go.Binding("text", "text"))));

               undoDisplay.linkTemplate = $$(go.Link);  // not really used

               undoDisplay.layout =
                   $$(go.TreeLayout,
                       { alignment: go.TreeLayout.AlignmentStart,
                           angle: 0,
                           compaction: go.TreeLayout.CompactionNone,
                           layerSpacing: 16,
                           layerSpacingParentOverlap: 1,
                           nodeIndent: 2,
                           nodeIndentPastParent: 0.88,
                           nodeSpacing: 0,
                           setsPortSpot: false,
                           setsChildPortSpot: false,
                           arrangementSpacing: new go.Size(2, 2)
                       });

               undoModel = new go.GraphLinksModel();  // initially empty
               undoModel.isReadOnly = true;
               undoDisplay.model = undoModel;

           },


        mouseDragOver : function(RuntimeService,myDiagram){ myDiagram.mouseDragOver=function(e){
            THRESHOLD = 12500;
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

                                RuntimeService.tempLinkArray.push(newlink);

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
                            RuntimeService.tempLinkArray.pop(link);
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



        }}



    }



})


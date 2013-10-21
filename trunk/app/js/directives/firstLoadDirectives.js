app.directive("tabhistory",function(){
    return{
        restrict:"E",

        template:
            '<tabset id="historyTab" class="nav nav-tabs">'+

                '<tab heading="Editor">'+
                '<textarea autofocus placeholder="Editor \' s area...." id="infobar"   style="border: solid 1px gray ;overflow:scroll " wrap="SOFT" ></textarea>' +
                '</tab>'+

                '<tab heading="History">'+

                '<div id="history"></div> <div id="modelChangedLog" style="height:280px;border: solid 1px gray; font-family:Monospace; font-size:11px; overflow:scroll"></div>'+
                '<div id="undoDisplay" style="height:280px; border: solid 1px gray"></div></div>' +
                '</tab>'+
                '</tabset>'
    }
})


//<!--<div class="tabbable" id="historyTab">-->
//<!--<ul class="nav nav-tabs">-->
//<!--<li class="active"><a href="#pane1" data-toggle="tab">Editor</a></li>-->
//<!--<li><a href="#pane2" data-toggle="tab">History</a></li>-->
//
//<!--</ul>-->
//<!--<div class="tab-content">-->
//<!--<div id="pane1" class="tab-pane active">-->
//<!--<textarea autofocus placeholder="Editor \ s area...." id="infobar"   style="border: solid 1px gray ;overflow:scroll " wrap="SOFT" ></textarea>-->
//<!--</div>-->
//<!--<div id="pane2" class="tab-pane">-->
//<!--<div id="history"></div> <div id="modelChangedLog" style="height:280px;border: solid 1px gray; font-family:Monospace; font-size:11px; overflow:scroll"></div>-->
//<!--<div id="undoDisplay" style="height:280px; border: solid 1px gray"></div>-->
//<!--</div>-->
//
//<!--</div>&lt;!&ndash; /.tab-content &ndash;&gt;-->
//<!--</div>&lt;!&ndash; /.tabbable &ndash;&gt;-->
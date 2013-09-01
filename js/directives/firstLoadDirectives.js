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
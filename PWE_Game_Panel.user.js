// ==UserScript==
// @name        PWE Game Panel
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Panel.user.js
// @updateURL  https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Panel.user.js
// @version    1.1
// @description  Adds popup window for each game on with links to game home page, news page and game forum. Users can now select which games to show and these settings are stored locally. 
// @match      http://forum.arcgames.com/*
// @grant       none
// @copyright  2015, Eiledon
// ==/UserScript==

var _jsongames; //will be populated by external file
var gameselection = "";
var _embedded = false;

//determine embed status
function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// make tiles look nice
function toTitleCase(str) {
    return str.replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

//get external css
function addCSS(url) {
    var _head  = document.getElementsByTagName('head')[0];
    var _link  = document.createElement('link');
    _link.setAttribute('rel',"stylesheet");
    _link.setAttribute('type',"text/css");
    _link.setAttribute('media',"all");
    _link.setAttribute('href',url);
    _head.appendChild(_link);
};

function makePanel() {
    $('#gpouter').remove(); //remove any previous iteration
    // panel logo/activation button
    var $gplogo = $("<img src='http://www.arcgames.com/images/download/logo.png' width='30' alt='Games Menu' title='Games Menu' />");
    //define generic parts
    var _container = '<div></div>';
    var _list = '<ul></ul>';
    var _item = '<li></li>';
    var _link = '<a></a>'
    //var _select = '<select multiple></select>';
    //var _option = '<option></option>';
    var _check = '<input type="checkbox">'; //id, name, value
    var _label = '<label></label>'; //for


    //define main containers/controls
    var $gpouter = $(_container).attr('id','gpouter');
    var $gpbutton =$(_container).attr('id', 'gpbutton').append($gplogo);
    var $gppop = $(_container).attr('id','gppop');
    var $gpgamelist = $(_list).attr('id','gpgamelist');
    var $gpselect = $(_list).attr('id','gpselect');
    var $gpopt = $(_check).attr('name','check').attr('id','gpopt');
    var $gpoptbutton = $(_label).attr('id','gpoptbutton').attr('for','gpopt').text('Select Games').click(toggleGames);


    //always present arc details
    //create section containers
    var $gpgameitem = $(_item).attr('id','gp_arc').addClass('gpgameitem').css('background-image', 'url(https://raw.githubusercontent.com/Eiledon/PWEVC/master/arclogo.png)');
    var $gplinklist = $(_list).addClass('gplinklist');
    //generate links
    $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href','https://www.arcgames.com/en/my/account').attr('target','_blank').attr('alt','ARC Profile').attr('title','ARC Profile').text('ACCOUNT')));
    $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href','https://billing.arcgames.com/en/').attr('target','_blank').attr('alt','Charge Zen').attr('title','Charge Zen').text('CHARGE')));
    $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href','https://support.arcgames.com/app/home').attr('target','_blank').attr('alt','ARC Support').attr('title','ARC Support').text('SUPPORT')));
    $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href', (_embedded) ? 'http://www.arcgames.com/en/forums/arc/' : 'http://forum.arcgames.com/arc').attr('alt','ARC Forum').attr('title','ARC Forum').text('FORUM')));

    //append into games list container
    $gpgamelist.append($gpgameitem.append($gplinklist))

    $.each(_jsongames.games, function(_index, _element) {
        //should entry be visible?
        if (gameselection.indexOf(_element.catname) >= 0) { var _visible = true;} else { var _visible = false;}

        //collect/define game specific variables
        var _propername = _element.propername; 
        var _arcurl = 'http://www.arcgames.com/en/games/'+ _element.arcname; 
        // var _caturl = 'http://perfectworld.vanillaforums.com/categories/'+_element.catname;  // original forum linking
        // var _caturl = ((_embedded) ? 'http://www.arcgames.com/en/forums/' : 'http://forum.arcgames.com/') +_element.catname+'/' // v1.0.1 forum linking
        var _caturl = (_embedded) ? _element.forumembed : _element.forumself;
        var _imgurl = _element.logo; 


        //add option to select list
        $gpselect.append($(_item).append($(_check).attr('name','check').attr('value','#gp_' + _element.catname).attr('id','gps_' + _element.catname).prop( "checked", _visible )).append($(_label).attr('for','gps_' + _element.catname).text(_propername)));

        //create section containers
        var $gpgameitem = $(_item).attr('id','gp_' + _element.catname).addClass('gpgameitem').css('background-image', 'url(' + _imgurl + ')');

        if (_visible == false ) { $gpgameitem.hide(); }

        var $gplinklist = $(_list).addClass('gplinklist');
        //generate links
        $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href',_arcurl).attr('target','_blank').attr('alt',_propername + ' Game Homepage').attr('title',_propername + ' Game Homepage').text('HOME')));
        $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href',_arcurl + '/news').attr('target','_blank').attr('alt',_propername + ' Game News').attr('title',_propername + ' Game News').text('NEWS')));
        $gplinklist.append($(_item).addClass('gplinkitem').append($(_link).addClass('gplink').attr('href',_caturl).attr('alt',_propername + ' Game Forum').attr('title',_propername + ' Game Forum').text('FORUM'))) ;
        //append into games list container
        $gpgamelist.append($gpgameitem.append($gplinklist)); 
    });


    //all generated content into page
    $gpouter.append($gpbutton.append($gppop.append($gpgamelist).append($gpopt).append($gpoptbutton).append($gpselect)));
    $gpouter.appendTo('#Frame');

}

function toggleGames() {
    var _selected = $( "#gpselect input:checkbox:checked" ).map(function(){ return this.value }).get().join(", ");
    var _unselected = $( "#gpselect input:checkbox:not(:checked)").map(function(){ return  this.value }).get().join(", ");
    
    if($('#gpopt:checked').length) { 
        $(_selected).show(200);
        $(_unselected).hide(200);
        gameselection = _selected; 
        saveSettings(); ; 
    }
}

// amdended settings names
function saveSettings(){
    localStorage["pweGamePanel"] =  gameselection;
    //console.log('saved: ' + gameselection);
};

//amended settings names
function getSettings() {
    var savedselection = localStorage["pweGamePanel"];
    if (savedselection) { 
    gameselection = savedselection; 
  } else {
    gameselection = $.map(_jsongames.games, function(item) { return '#gp_' + item.catname; }).join(", ");
    saveSettings();
  }
};


$( document ).ready(function() {
    //initialise plug in
    _embedded = inIframe();
    addCSS("https://rawgit.com/Eiledon/PWEVC/master/PWE_Game_Panel.css");
    $.getJSON('https://rawgit.com/Eiledon/PWEVC/master/PWE_games.json', function(json) { _jsongames = json; })
     .complete(function(){
    //on completion of json load append all generated content into page
    getSettings();
    makePanel();   

  });    
}); 

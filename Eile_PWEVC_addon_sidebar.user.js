// ==UserScript==
// @name        PWEVC Game Logo Sidebar
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://cdn.rawgit.com/Eiledon/PWEVC/master/Eile_PWEVC_addon_sidebar.user.js
// @updateURL  https://cdn.rawgit.com/Eiledon/PWEVC/master/Eile_PWEVC_addon_sidebar.user.js
// @version    0.3.1
// @description  Adds sidebar with game logos in popup window linking to individual categories on pwe vanilla forums, game home and news page.
// @match      http://perfectworld.vanillaforums.com/*
// @grant       none
// @copyright  2015, Eiledon
// ==/UserScript==



// make tiles look nice
function toTitleCase(str)
{
    return str.replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//get external css
getCSS = function(url) {
	var _head  = document.getElementsByTagName('head')[0];
	var _link  = document.createElement('link');
	_link.setAttribute('rel',"stylesheet");
	_link.setAttribute('type',"text/css");
	_link.setAttribute('media',"all");
	_link.setAttribute('href',url);
	_head.appendChild(_link);
};

getCSS("https://rawgit.com/Eiledon/PWEVC/master/Eile_PWEVC_gamepanel.css");

// initialise main panel elements
var _gameouter = $("<div id='floatnav'></div>");
var _gameinner = $("<div class='floatbutton'></div>");
var _gamebutton = $("<img src='http://www.arcgames.com/images/download/logo.png' width='30' alt='Games Menu' title='Games Menu' />");
var _gamepopout = $("<div class='popoutpanel'></div>");
var _gamelist = $("<ul></ul>");

//permanent ARC additions
var _li = $('<li class="gameitem"></li>');
    
//combine each game into main list
_li.append($('<div class="gamebox"><img width="140" title="ARC" alt="ARC" src="http://images-cdn.perfectworld.com/arcportal_static/images/global/logos.png"></div>'));
_li.append($('<div class="gamelinks"><a href="https://www.arcgames.com/en/my/account" target="_blank" alt="ARC Profile" title="ARC Profile">ACCOUNT</a>&nbsp;|&nbsp;<a href="https://billing.arcgames.com/en/" target="_blank"  alt="Charge Zen" title="Charge Zen">ZEN</a>&nbsp;|&nbsp;<a href="https://support.arcgames.com/app/home" target="_blank"  alt="ARC Support" title="ARC Support">SUPPORT</a></div>')); 
_gamelist.append(_li);



// open and loop through games array to populate inner container with list elements
$.getJSON('https://rawgit.com/Eiledon/PWEVC/master/games.json', function(json) {
  $.each(json.games, function(_index, _element) {

    // extract game specific data
    var _catname = _element.catname;
    var _caturl = 'http://perfectworld.vanillaforums.com/categories/'+_catname;
    
    var _arcname = _element.arcname;
    var _arcurl = 'http://www.arcgames.com/en/games/'+_arcname;
    
    // format arc name into nice looking title  
    var _propername = toTitleCase(_arcname.replace(/(-|_)/g," ")); 

    var _imgurl = _element.logo; 
  
    var _li = $('<li class="gameitem"></li>');
    
      
      http://www.arcgames.com/en/games/star-trek-online/news
      
      
    //combine each game into main list
    _li.append($('<div class="gamebox"><img width="150" title="'+_propername+'" alt="'+_propername+'" src="'+_imgurl+'"></div>'));
    _li.append($('<div class="gamelinks"><a href="'+_arcurl+'" target="_blank" title="Visit Game Homepage" alt="Visit Game Homepage">HOME</a>&nbsp;|&nbsp;<a href="'+_arcurl+'/news" target="_blank" title="See Game News" alt="See Game News">NEWS</a>&nbsp;|&nbsp;<a href="'+_caturl+'"  title="Visit Game Forum" alt="Visit Game Forum">FORUM</a></div>')); 
    _gamelist.append(_li);
  });
});

// combine panel elements and add to page
_gamepopout.append(_gamelist);
_gameinner.append(_gamebutton);
_gameinner.append(_gamepopout);
_gameouter.append(_gameinner);
$("#Frame").append(_gameouter);

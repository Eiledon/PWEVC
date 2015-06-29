// ==UserScript==
// @name        PWEVC Game Logo Sidebar
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://rawgit.com/Eiledon/PWEVC/master/Eile_PWEVC_addon_sidebar.user.js
// @updateURL  https://rawgit.com/Eiledon/PWEVC/master/Eile_PWEVC_addon_sidebar.user.js
// @version    0.1.1
// @run-at     document-start
// @description  Adds sidebar with game logos linking to individual categories on pwe vanilla forums
// @match      http://perfectworld.vanillaforums.com/*
// @grant       none
// @copyright  2015, Eiledon
// ==/UserScript==



// make tiles look nice
function toTitleCase(str)
{
    return str.replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

getCSS = function(url) {
	var _head  = document.getElementsByTagName('head')[0];
	var _link  = document.createElement('link');
	_link.setAttribute('rel',"stylesheet");
	_link.setAttribute('type',"text/css");
	_link.setAttribute('media',"all");
	_link.setAttribute('href',url);
	_head.appendChild(link);
};

getCSS("https://rawgit.com/Eiledon/PWEVC/master/Eile_PWEVC_addon_sidebar.user.css");

// game information - "category name|arc name|game logo image"
var _games = ["startrekonline|star-trek-online|http://images-cdn.perfectworld.com/arc/b0/f8/b0f828fe91b8db7e4a8bc149fbb61c051429636566.png",
"championsonline|champions-online|http://images-cdn.perfectworld.com/arc/a6/33/a633c3671491651ea7b42d6d95815edb1385152436.png",
"neverwinter|neverwinter|http://images-cdn.perfectworld.com/arc/3a/81/3a81ab0f31f45e9932b42a9acb6901251428424134.png",
"pwi|pwi|http://images-cdn.perfectworld.com/arc/92/47/9247267bdf832fd41d502991fe80fbbd1419024145.png",
"forsakenworld|forsaken-world|http://images-cdn.perfectworld.com/arc/c0/75/c0755520a43e6b6a9b551be9948f83d51425683020.png",
"jadedynasty|jade-dynasty|http://images-cdn.perfectworld.com/arc/55/ba/55ba6657e975b3d45abdf2cb45ad4b7b1387241344.png",
"apbreloaded|APB_Reloaded|http://images-cdn.perfectworld.com/arc/04/25/04251ebaafb985484e54dd859c152de31403296162.png",
"battleoftheimmortals|battle-of-the-immortals|http://images-cdn.perfectworld.com/arc/fc/1b/fc1b836d8d7ddc102d664bbd448cb9441412994941.png",
"blacklightretribution|blacklight-retribution|http://images-cdn.perfectworld.com/arc/5d/49/5d49d74ac317bb7160337bacb75701191385067585.png",
"elsword|Elsword|http://images-cdn.perfectworld.com/arc/79/0c/790c434d55e978555c6a51ff796029591423791394.png",
"ethersagaodyssey|ether-saga-odyssey|http://images-cdn.perfectworld.com/arc/3e/1f/3e1f70e14a0bd0d96705b65b079801221386047915.png",
"prime-world|Prime_World|http://images-cdn.perfectworld.com/arc/94/ec/94ec34ae25f734803e89f145ea28dfc31430354530.png",
"raiderz|raiderz|http://images-cdn.perfectworld.com/arc/7b/7b/7b7b748d3e3815d4f83fa4e85d1225cf1385159081.png",
"royal-quest|Royal_Quest|http://images-cdn.perfectworld.com/arc/49/18/49185e8a9a3672c0d02db0a08e0b11f41430953754.png",
"star-conflict|Star_Conflict|http://images-cdn.perfectworld.com/arc/b0/d7/b0d7ba458793fa27ff99bfd8cd57a8241426788017.png",
"stronghold-kingdoms|Stronghold_Kingdoms|http://images-cdn.perfectworld.com/arc/68/c2/68c232a17c60f90978bd3420a39949881425581480.png",
"Swordsman|swordsman|http://images-cdn.perfectworld.com/arc/68/72/68726923a8a436c82dbbdd8973ac24631414170956.png",
"waroftheimmortals|war-of-the-immortals|http://images-cdn.perfectworld.com/arc/1c/a3/1ca3942f422047f4d5fd284a10fe43d41398393797.png"];

var _body = document.getElementsByTagName('body') [0];  //where everything is getting added to
var _div = document.createElement("div"); // outer container
var _ul = document.createElement("ul"); // inner container unordered list

// details for outer container
_div.setAttribute('id',"gamediv");
_div.setAttribute('class',"divgame");
//_div.setAttribute('style',"position:fixed;width:46px;height:auto;top:50px;left:1px; padding:0px;background:transparent; border:0px solid transparent; z-index:100");

// loop through games array to populate inner container with list elements
for(var i=0, len=_games.length; i < len; i++){
  
  var _li =  document.createElement("LI"); // Create a list element
  var _span = document.createElement("span"); //Create a container
  var _a = document.createElement("a"); //create link
  var _img = document.createElement("img"); // create an image


  var _content = _games[i].split("|"); // break games array entry into individual parts

  // format arc name into nice looking title  
  var _propername = _content[1].replace(/(-|_)/g," "); 
  _propername = toTitleCase(_propername);

  _li.setAttribute('id',"li_"+_content[0]);
  _li.setAttribute('class',"ligame");
  //_li.setAttribute('style',"list-style-type: none;display: inline;"); //set list element formatting
  _span.setAttribute('style',"display: block;float: left;padding: 0px;text-decoration: none;"); // set span formatting

  _a.setAttribute('href', "http://perfectworld.vanillaforums.com/categories/" +_content[0]); //add address to link
  
  // set image details  
  _img.setAttribute('src',_content[2]);
  _img.setAttribute('title',_propername +" Forum");
  _img.setAttribute('alt',_propername +" Forum");
  _img.setAttribute('height',"25px");
  
 // combine elements together and add into unordered list
 _a.appendChild(_img);
 _span.appendChild(_a);
 _li.appendChild(_span);
 _ul.appendChild(_li);
 
};

_div.appendChild(_ul); // add unordered list into outer container
_body.appendChild(_div); // add outer container onto webpage

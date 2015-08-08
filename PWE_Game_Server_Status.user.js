// ==UserScript==
// @name        PWE Game Server Status
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Server_Status.user.js
// @updateURL  https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Server_Status.user.js
// @include     *perfectworld.vanillaforums.com/*
// @version     0.4
// @description  Adds server status display panel to the top of the forums, refreshes status every 5 minutes
// @grant       none
// @copyright  2015, Eiledon.
// ==/UserScript==

var _css = ".Game_Status_Block {	float:right; margin-top: 8px;	margin-right:15px; padding:0px; border:1px solid #444; }"; 
_css += ".Game_Block {	padding:2px; float: left; overflow:visible;}";           
_css += ".Game_Status, .Server_Status {	padding: 0; display: none;	height: 12px;	width: 9px;	background: url('http://launcher.champions-online.com/static/all/img/server_status.png') no-repeat;	white-space: nowrap;}";
_css += ".Game_Status[data-status=up], .Server_Status[data-status=up] { display: inline-block; background-position:  -0px 3px; }";
_css += ".Game_Status[data-status=down], .Server_Status[data-status=down] { display: inline-block; background-position: -18px 3px; }";
_css += ".Game_Status[data-status=mix] { display: inline-block; background-position: -9px 3px; }";
_css += ".Game_Pop { position: absolute; z-index: 10; margin:-2px 0 0 0; padding:3px; background:rgba(0,0,0,0.75); border:1px solid #444; min-width:100px; }";
_css += "div.Game_Block .Game_Pop {display:none; }";
_css += "div.Game_Block:hover .Game_Pop {display:block;}";
_css += ".Game_Pop span { opacity:0.5;}";
_css += ".Game_Pop ul {margin-top:-10px; }";
_css += ".Game_Pop li {margin-top:-5px; margin-left:10px; margin-right:3px;}";

var _refresh = 5; //no of minutes between checking server status

var _Game_Status_Block = '<div class="Game_Status_Block"></div>';
var _Game_Block = '<div class="Game_Block">{game}:<div id="{game}_status" class="Game_Status" data-status="down"></div><div id="{game}_pop" class="Game_Pop"></div></div>';
var _Server_Status_Block = '<ul></ul>';
var _Server_Block = '<li>{server}:<div id="{server}_status" class="Server_Status" data-status="{status}"></div></li>';

//game array - name, url of server status, element to be scraped, servers to be excluded (e.g closed)
var _games = { 
  "games": [
    {
      "name":"CO",
      "url":"http://launcher.champions-online.com/launcher_server_status",
      "xpath":"'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/a6/33/a633c3671491651ea7b42d6d95815edb1385152436.png"
    },
    {
      "name":"STO",
      "url":"http://launcher.startrekonline.com/launcher_server_status",
      "xpath":"'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/b0/f8/b0f828fe91b8db7e4a8bc149fbb61c051429636566.png"
    },
    {
      "name":"NW",
      "url":"http://launcher.playneverwinter.com/launcher_server_status",
      "xpath":"'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/3a/81/3a81ab0f31f45e9932b42a9acb6901251428424134.png"
    },
    {
      "name":"PW",
      "url":"http://pwi.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"Heavens Tear|Lost City|Harshlands|Raging Tide",
      "logo":"http://images-cdn.perfectworld.com/arc/92/47/9247267bdf832fd41d502991fe80fbbd1419024145.png"
    },
    {
      "name":"JD",
      "url":"http://jd.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/55/ba/55ba6657e975b3d45abdf2cb45ad4b7b1387241344.png"
    },
    {
      "name":"FW",
      "url":"http://fw.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"server-times\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/c0/75/c0755520a43e6b6a9b551be9948f83d51425683020.png"
    },
    {
      "name":"BOI",
      "url":"http://boi.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/fc/1b/fc1b836d8d7ddc102d664bbd448cb9441412994941.png"
    },
    {
      "name":"WOI",
      "url":"http://woi.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/1c/a3/1ca3942f422047f4d5fd284a10fe43d41398393797.png"
    }
  ]
};

// insert code generates css style to head
var addCSS = function(){ $("<style type='text/css'>" + _css + " </style>").appendTo("head"); };

// update physical page values
function set_server_status(_game,_status, _logo, _servers)
{
  // _status Can be "up" or "down"._additional is string in json format
  $('#' + _game + '_status').attr('data-status', _status); //update overall game status - up, down or mix (where multiple servers are up and down)
  var _game_details = $.parseJSON(_servers); //convert string to json array
  var $server_status_block = $(_Server_Status_Block);  //define popup container list
  // iterate through each timezone where applicable
  $.each(_game_details.zones,function(index,_elZone){
    $server_status_block.append('<span>' + _elZone.zone + '</span>') // add time zone header
    if (_elZone.servers.length){
      //iterate through each game server
      $.each(_elZone.servers,function(index,_elServer){
        var regex = new RegExp( "{server}", 'g');
        var _addblock = _Server_Block.replace(regex,_elServer.server);
        var regex = new RegExp( "{status}", 'g');
        _addblock = _addblock.replace(regex,_elServer.status);
        $server_status_block.append(_addblock); //add server list element
      })
    }
  });
  $('#' + _game + '_pop').html('');
  $('<img src="' + _logo + '" width="100px" >').appendTo('#' + _game + '_pop');
  $server_status_block.appendTo('#' + _game + '_pop');
  console.log(_game + ': ' + _status);
}

function update_server_status()
{

  $.each(_games.games,function(index, _item){
    var _game = _item.name;
    var _url = _item.url;
    var _xpath = _item.xpath;
    var _exclude = _item.exclude;
    var _logo = _item.logo;
    var _qry = "SELECT * FROM html WHERE url='" + _url +  _xpath;
    var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(_qry)  + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    $.getJSON(yql, function(data){
      if (_game == "STO"||_game =="CO"||_game == "NW") { 
        var _status = data.query.results.body;
        var _addit = '{"zones":[{"zone":"' + _game + '","servers":[{"server":"Live","status":"' + _status + '"}]}]}';
        set_server_status(_game, _status, _logo, _addit); 
      }
      if (_game == "PW"||_game == "JD"||_game == "BOI"||_game == "WOI") {
        var _addit = "", _status = "", _upcnt = 0, _dncnt = 0;
        _addit += '{"zones":[';
        var g = 0, h = data.query.results.div.length;
        $.each(data.query.results.div, function(index, _elZone) {
          g++;
          _addit += '{"zone":"' + _elZone.h5 + '","servers":[';  

          if (_elZone.ul.li.length) {
            var i = 0, j = _elZone.ul.li.length;
            $.each(_elZone.ul.li, function(index, _elServer) {
              i++;
              if (_exclude.indexOf(_elServer.span) >= 0) { j--; }
              if (_exclude.indexOf(_elServer.span) < 0) { 

                if (_elServer.class == 'online icon') {_upcnt++; _status = "up";}
                if (_elServer.class == 'offline icon') {_dncnt++; _status = "down";}
                _addit += '{"server":"' + _elServer.span + '","status":"' + _status + '"}';
                if (i < j){ _addit += ",";}

              }
            });
          } else {
            if (_exclude.indexOf(_elZone.ul.li.span) < 0) { 

              if (_elZone.ul.li.class == 'online icon') {_upcnt++; _status = "up";}
              if (_elZone.ul.li.class == 'offline icon') {_dncnt++; _status = "down";}   
              _addit += '{"server":"' + _elZone.ul.li.span + '","status":"' + _status + '"}';

            }
          }
          _addit += ']}';
          if (g < h){ _addit += ',';}
        });
        _addit += ']}';

        if (_upcnt > 0){ _status = "up"; }
        if (_dncnt > 0){ _status = "down"; }
        if (_upcnt > 0 && _dncnt > 0 ){ _status = "mix"; }

        set_server_status(_game, _status, _logo, _addit);

      }    

      if (_game == "FW") {
        var _addit = "", _status = "", _upcnt = 0, _dncnt = 0;
        _addit += '{"zones":[';
        var g = 0, h = data.query.results.div.length;
        $.each(data.query.results.div, function(index, _elZone) {
          g++;
          _addit += '{"zone":"' + _elZone.h4[0] + '","servers":[';
          if (_elZone.ul.li.length) {
            var i = 0, j = _elZone.ul.li.length;
            $.each(_elZone.ul.li, function(index, _elServer) {
              i++;
              if (_exclude.indexOf(_elServer.content) >= 0) { j--; }
              if (_exclude.indexOf(_elServer.content) < 0) { 

                if (_elServer.span.class == 'online') {_upcnt++; _status = "up";}
                if (_elServer.span.class == 'offline') {_dncnt++; _status = "down";}
                _addit += '{"server":"' + _elServer.content + '","status":"' + _status + '"}';
                if (i < j){ _addit += ",";}

              }
            });
          } else {
            if (_exclude.indexOf(_elZone.ul.li.content) < 0) {

              if (_elZone.ul.li.span.class == 'online') {_upcnt++; _status = "up";}
              if (_elZone.ul.li.span.class == 'offline') {_dncnt++; _status = "down";} 
              _addit += '{"server":"' + _elZone.ul.li.content + '","status":"' + _status + '"}';

            }
          }
          _addit += ']}';
          if (g < h){ _addit += ',';}
        });
        _addit += ']}';

        if (_upcnt > 0){ _status = "up"; }
        if (_dncnt > 0){ _status = "down"; }
        if (_upcnt > 0 && _dncnt > 0 ){ _status = "mix"; }
        set_server_status(_game, _status, _logo, _addit);
      }
    }); 
  });               
}

function add_game_block(){
  if ($(".SiteSearch").length){
    $('.Game_Status_Block').remove();
    var $gameblock = $(_Game_Status_Block);

    $.each( _games.games, function( index, item ){
      var regex = new RegExp( "{game}", 'g');
      $gameblock.append(_Game_Block.replace(regex, item.name));
    });
    $gameblock.insertAfter($(".SiteSearch").first());    
  }
}

$( document ).ready(function() {
  //initialise plug in
  addCSS();
  add_game_block();
  update_server_status();
  var server_interval = window.setInterval(update_server_status, 60 * 1000 * _refresh);
  $(window).unload(function() { window.clearInterval(server_interval); });
});
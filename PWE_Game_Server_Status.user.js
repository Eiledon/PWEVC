// ==UserScript==
// @name        PWE Game Server Status
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Server_Status.user.js
// @updateURL  https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Server_Status.user.js
// @include     *perfectworld.vanillaforums.com/*
// @version     0.6
// @description  Adds server status display panel to the top of the forums, refreshes status every 5 minutes
// @grant       none
// @copyright  2015, Eiledon.
// ==/UserScript==

var unhide_games;
var update_server_interval;
var _statuslogging = "";
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
      "scrape":"cryptic",
      "state":"initial",
      "url":"http://launcher.champions-online.com/launcher_server_status",
      "xpath":"'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/a6/33/a633c3671491651ea7b42d6d95815edb1385152436.png"
    },
    {
      "name":"STO",
      "scrape":"cryptic",
      "state":"initial",
      "url":"http://launcher.startrekonline.com/launcher_server_status",
      "xpath":"'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/b0/f8/b0f828fe91b8db7e4a8bc149fbb61c051429636566.png"
    },
    {
      "name":"NW",
      "scrape":"cryptic",
      "state":"initial",
      "url":"http://launcher.playneverwinter.com/launcher_server_status",
      "xpath":"'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/3a/81/3a81ab0f31f45e9932b42a9acb6901251428424134.png"
    },
    {
      "name":"PW",
      "scrape":"zone",
      "state":"initial",
      "url":"http://pwi.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"Heavens Tear|Lost City|Harshlands|Raging Tide",
      "logo":"http://images-cdn.perfectworld.com/arc/92/47/9247267bdf832fd41d502991fe80fbbd1419024145.png"
    },
    {
      "name":"JD",
      "scrape":"zone",
      "state":"initial",
      "url":"http://jd.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/55/ba/55ba6657e975b3d45abdf2cb45ad4b7b1387241344.png"
    },
    {
      "name":"FW",
      "scrape":"server-times",
      "state":"initial",
      "url":"http://fw.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"server-times\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/c0/75/c0755520a43e6b6a9b551be9948f83d51425683020.png"
    },
    {
      "name":"BOI",
      "scrape":"zone",
      "state":"initial",
      "url":"http://boi.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/fc/1b/fc1b836d8d7ddc102d664bbd448cb9441412994941.png"
    },
    {
      "name":"WOI",
      "scrape":"zone",
      "state":"initial",
      "url":"http://woi.perfectworld.com/status",
      "xpath":"' AND xpath='//div[contains(@class,\"zone\")]'",
      "exclude":"",
      "logo":"http://images-cdn.perfectworld.com/arc/1c/a3/1ca3942f422047f4d5fd284a10fe43d41398393797.png"
    }
  ]
};

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
  _statuslogging += _game + ' - ' + _status + '; '; 
}

function update_server_status()
{
  _statuslogging ="Game Status: ";
  $.each(_games.games,function(index, _item){
    var _status = "";
    var _gameindex = index;
    var _game = _item.name;
    var _scrape = _item.scrape;
    var _state = _item.state;
    var _url = _item.url;
    var _xpath = _item.xpath;
    var _exclude = _item.exclude;
    var _logo = _item.logo;
    var _qry = "SELECT * FROM html WHERE url='" + _url +  _xpath;
    var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(_qry)  + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    var yqlload = $.getJSON(yql, function(data){
      if (_scrape == "cryptic") { 
         _status = data.query.results.body;
        var _addit = '{"zones":[{"zone":"' + _game + '","servers":[{"server":"Live","status":"' + _status + '"}]}]}';
        set_server_status(_game, _status, _logo, _addit); 
      }
      if (_scrape == "zone") {
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

      if (_scrape == "server-times") {
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
    })
    .fail(function(){
      _games.games[_gameindex].state="failed";
    }) 
    .complete(function(){
      _games.games[_gameindex].state="checked";
      if (_gameindex == _games.games.length - 1) {
        setTimeout(function(){ console.log(_statuslogging); }, 10 * 1000); 
      }
    }); 
  }); 
}

function add_game_block(){
  if ($(".SiteSearch").length){
    $('.Game_Status_Block').remove();
    var $gameblock = $(_Game_Status_Block);
    $gameblock.hide();
    $.each( _games.games, function( index, item ){
      var regex = new RegExp( "{game}", 'g');
      $gameblock.append(_Game_Block.replace(regex, item.name));
    });
    $gameblock.insertAfter($(".SiteSearch").first());    
  }
}

function unhide_game_block(){
  var _readystate = true
  $.each(_games.games,function(index, _item){
    if(_item.state == "initial"){_readystate = false;}    
  });
  if(_readystate){
    $('.Game_Status_Block').fadeToggle( "fast");
    window.clearInterval(unhide_games);  
  } 
}

$( document ).ready(function() {
  //initialise plug in
  getCSS("https://rawgit.com/Eiledon/PWEVC/master/PWE_Game_Server_Status.css");
  add_game_block();
  update_server_status();
  unhide_games = window.setInterval(unhide_game_block,500);
  update_server_interval = window.setInterval(update_server_status, 60 * 1000 * _refresh);
  $(window).unload(function() { window.clearInterval(update_server_interval); });
  $(window).unload(function() { window.clearInterval(unhide_games); });
});
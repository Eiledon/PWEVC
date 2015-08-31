// ==UserScript==
// @name        PWE Game Server Status
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Server_Status.user.js
// @updateURL  https://github.com/Eiledon/PWEVC/raw/master/PWE_Game_Server_Status.user.js
// @include     http://forum.arcgames.com/*
// @version     0.7.1
// @description  Adds server status display panel to the top of the forums, refreshes status every 5 minutes
// @grant       none
// @copyright  2015, Eiledon.
// ==/UserScript==

// define variables
var _jsongames; //will be populated by external file
var unhide_games;
var update_server_interval;
var _statuslogging = "";
var _refresh = 5; //no of minutes between checking server status
var gameselection = "";

//define generic parts for dom generation
var _container = '<div>';
var _header = '<span>';
var _list = '<ul>';
var _item = '<li>';
var _check = '<input type="checkbox">'; //id, name, value
var _label = '<label>'; //for

//get external css
function getCSS(url) {
  var _head  = document.getElementsByTagName('head')[0];
  var _link  = document.createElement('link');
  _link.setAttribute('rel',"stylesheet");
  _link.setAttribute('type',"text/css");
  _link.setAttribute('media',"all");
  _link.setAttribute('href',url);
  _head.appendChild(_link);
};

//perform scraping of external websites for server status based on json details
function update_server_status()
{
  _statuslogging ="Game Status: ";
  $.each(_jsongames.games,function(index, item){
    //only include if scrape property exists
    if(item.hasOwnProperty('scrape')) {

      var _status = "";
      var _gameindex = index;
      var _game = item.name;
      var _propername = item.propername;
      var _scrape = item.scrape;
      var _state = item.state;
      var _url = item.url;
      var _xpath = item.xpath;
      var _exclude = item.exclude;
      var _qry = "SELECT * FROM html WHERE url='" + _url +  _xpath;
      console.log(_qry);
      var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(_qry)  + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
      var yqlload = $.getJSON(yql, function(data){

        if (_scrape == "cryptic") { 
          _status = data.query.results.body;
          var _serverdetails = '{"zones":[{"zone":"' + _propername + '","servers":[{"server":"Live","status":"' + _status + '"}]}]}';
          set_server_status(_game, _status, _serverdetails, _state); 
        }
        if (_scrape == "zone" || _scrape == "server-times") {
          var _serverdetails = "", _status = "", _upcnt = 0, _dncnt = 0;
          _serverdetails += '{"zones":[';
          var g = 0, h = data.query.results.div.length;
          $.each(data.query.results.div, function(index, _elZone) {
            g++;
            //page specific details
            if (_scrape == "zone") { _serverdetails += '{"zone":"' + _elZone.h5.replace('EU','Europe') + '","servers":[';  }
            if (_scrape == "server-times") { _serverdetails += '{"zone":"' + _elZone.h4[0].replace('EU','Europe') + '","servers":['; }

            if (_elZone.ul.li.length) {
              //if multiple servers returned
              var i = 0, j = _elZone.ul.li.length;
              $.each(_elZone.ul.li, function(index, _elServer) {
                i++;

                //page specific details
                if (_scrape == "zone") { var _servername = _elServer.span , _serverclass = _elServer.class; }
                if (_scrape == "server-times") { var _servername = _elServer.content , _serverclass = _elServer.span.class; }

                if (_exclude.indexOf(_servername) >= 0) { j--; }
                if (_exclude.indexOf(_servername) < 0) { 

                  if (_serverclass.indexOf('online') >= 0) {_upcnt++; _status = "up";}
                  if (_serverclass.indexOf('offline') >= 0) {_dncnt++; _status = "down";}
                  _serverdetails += '{"server":"' + _servername + '","status":"' + _status + '"}';
                  if (i < j){ _serverdetails += ",";}

                }
              });
            } else {
              //if single server returned
              //page specific details
              if (_scrape == "zone") { var _servername = _elZone.ul.li.span , _serverclass = _elZone.ul.li.class; }
              if (_scrape == "server-times") { var _servername = _elZone.ul.li.content , _serverclass = _elZone.ul.li.span.class; }

              if (_exclude.indexOf(_servername) < 0) { 

                if (_serverclass.indexOf('online') >= 0) {_upcnt++; _status = "up";}
                if (_serverclass.indexOf('offline') >= 0) {_dncnt++; _status = "down";} 
                _serverdetails += '{"server":"' + _servername + '","status":"' + _status + '"}';

              }
            }
            _serverdetails += ']}';
            if (g < h){ _serverdetails += ',';}
          });
          _serverdetails += ']}';

          if (_upcnt > 0){ _status = "up"; }
          if (_dncnt > 0){ _status = "down"; }
          if (_upcnt > 0 && _dncnt > 0 ){ _status = "mix"; }
          console.log(_serverdetails);
          set_server_status(_game, _status, _serverdetails, _state);
        }    
      })
      .fail(function(){
        _jsongames.games[_gameindex].state="failed";
      }) 
      .complete(function(){
        _jsongames.games[_gameindex].state="checked";
        if (_gameindex == _jsongames.games.length - 1) {
          setTimeout(function(){ console.log(_statuslogging); }, 10 * 1000); 
        }
      }); 
    }
  }); 
}

//generate DOM elements for each game which is to be included
function makeGameStatusBlock() {
  if ($(".SiteSearch").length){
    $('.Game_Status_Block').remove();
    var $Game_Status_Block = $(_container).addClass('Game_Status_Block').hide();        

    var $Game_Select = $(_list).attr('id','Game_Select');
    $.each( _jsongames.games, function( index, item ){

      //only include if scrape property exists
      if(item.hasOwnProperty('scrape')) {

        //should entry be visible?
        if (gameselection.indexOf(item.name) >= 0) { var _visible = true;} else { var _visible = false;}

        //add game to game list
        var $Game_Block = $(_container).addClass('Game_Block').attr('id',item.name + '_block').text(item.name + ':')
        .append($(_container).addClass('Game_Status').attr('id',item.name + '_status').attr('data-status','down'))
        .append($(_container).addClass('Game_Pop').attr('id',item.name + '_pop')
                .append($('<img>').attr('id',item.name + '_logo').attr('src',item.logo)))
        .appendTo($Game_Status_Block); 

        if (_visible == false ) { $Game_Block.hide(); } //hide if user has selected not to see

        //add option to select list
        $(_item)
        .append($(_check).attr('name','check').attr('value','#' + item.name + '_block').attr('id','Game_Select_' + item.name).prop( "checked", _visible ))
        .append($(_label).attr('for','Game_Select_' + item.name).text(item.propername))
        .appendTo($Game_Select); 


      }
    });
    //add game selection options to main block and add to page
    $Game_Status_Block
    .append(    
      $(_container).addClass('Game_Block').attr('id', 'Opt_block')
      .append($(_check).attr('name','check').attr('id','Game_Select_Opt'))
      .append($(_label).attr('id','Game_Select_Button').attr('for','Game_Select_Opt').text('').attr('title', 'Select Games').attr('alt', 'Select Games').click(toggleGames))
      .append($(_container).addClass('Game_Pop').attr('id','Opt_pop').append($Game_Select))
    )
    .insertAfter($(".SiteSearch").first());    
  } 
}

//when all data has been gathered show status panel
function unhide_game_block(){
  var _readystate = true
  $.each(_jsongames.games,function(index, item){
    //only check where scrape property exists
    if(item.hasOwnProperty('scrape')) {
      if(item.state == "initial"){_readystate = false;}   
    }
  });
  if(_readystate){
    $('.Game_Status_Block').fadeToggle( "fast");
    window.clearInterval(unhide_games);  
  } 
}

// update physical page values
// initial pass through generates DOM elements
// subsequent passes updates status flags
function set_server_status(_game,_status, _serverdetails, _state)
{
  // _status Can be "up" or "down"._additional is string in json format
  $('#' + _game + '_status').attr('data-status', _status); //update overall game status - up, down or mix (where multiple servers are up and down)
  var _jsonServerDetails = $.parseJSON(_serverdetails); //convert string to json array

  // if initial run create server block otherwise find it in DOM
  if (_state == 'initial'){
    var $Server_Status_Block = $(_list).attr('id',_game + '_servers'); 
  } else {
    var $Server_Status_Block = $('#' + _game + '_servers').first();   
  }

  // iterate through each timezone where applicable
  $.each(_jsonServerDetails.zones,function(index,_elZone){
    //if initial run append time zone header
    if (_state == 'initial'){ $Server_Status_Block.append($(_header).text(_elZone.zone)); } 

    if (_elZone.servers.length){
      //iterate through each game server
      $.each(_elZone.servers,function(index,_elServer){

        var regex = new RegExp( " ", 'g');
        var _serverid = _elServer.server.replace(regex,'_');
        //if initial run create server panel, other wise update status only
        if (_state == 'initial'){
          $Server_Status_Block.append($(_item).attr('id',_game + '_' + _serverid + '_server').text(_elServer.server + ':').append($(_container).addClass('Server_Status').attr('id',_game + '_' +  _serverid + '_status').attr('data-status',_elServer.status)));
        } else {
          $('#' + _game + '_' +  _serverid + '_status').attr('data-status',_elServer.status)  
        }

      })
    }
  });
  // if initial run complete appending server details to game status block
  if (_state == 'initial'){ $Server_Status_Block.appendTo('#' + _game + '_pop'); }

  _statuslogging += _game + ' - ' + _status + '; '; 
}

// show/hide games based on user selection and store choice
function toggleGames() {
  var _selected = $( "#Game_Select input:checkbox:checked" ).map(function(){ return this.value }).get().join(", ");
  var _unselected = $( "#Game_Select input:checkbox:not(:checked)").map(function(){ return  this.value }).get().join(", ");

  if($('#Game_Select_Opt:checked').length) { 
    $(_selected).show(200);
    $(_unselected).hide(200);
    gameselection = _selected; 
    saveSettings(); ; 
  }
}

// save game selections to localstorage
function saveSettings(){
  localStorage["pweGameServerStatus"] =  gameselection;
  //console.log('saved: ' + gameselection);
};

//get game selections from local storage
//if not present, generate full list from json
function getSettings() {
  var savedselection = localStorage["pweGameServerStatus"];
  if (savedselection) { 
    gameselection = savedselection; 
  } else {
    gameselection = $.map(_jsongames.games, function(item) { if(item.hasOwnProperty('scrape')) { return '#' + item.name + '_block';} }).join(", ");
    saveSettings();
  }
};

$( document ).ready(function() {
  //initialise plug in
  getCSS("https://rawgit.com/Eiledon/PWEVC/master/PWE_Game_Server_Status.css");
  $.getJSON('https://rawgit.com/Eiledon/PWEVC/master/PWE_games.json', function(json) { _jsongames = json; })
  .complete(function(){
    //on completion of json load append all generated content into page

    getSettings();
    makeGameStatusBlock();
    update_server_status();
    unhide_games = window.setInterval(unhide_game_block,100);
    update_server_interval = window.setInterval(update_server_status, 60 * 1000 * _refresh);
    $(window).unload(function() { window.clearInterval(update_server_interval); });
    $(window).unload(function() { window.clearInterval(unhide_games); });     

  }); 
});


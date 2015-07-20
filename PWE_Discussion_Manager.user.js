// ==UserScript==
// @name        PWE Discussion Manager
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://github.com/Eiledon/PWEVC/raw/master/PWE_Discussion_Manager.user.js
// @updateURL  https://github.com/Eiledon/PWEVC/raw/master/PWE_Discussion_Manager.user.js
// @include     *perfectworld.vanillaforums.com/*
// @version     0.3.5
// @description  Adds Autopage (Discussions/Comments/Search Results), Filtering (Discussions) and buttons for Scroll to Top and Bottom
// @grant       none
// @copyright  2015, Eiledon. portions of code from Asterelle
// ==/UserScript==

var _sep = "_" ;
var _url = "";
var lastScrollTop = 0, delta = 5;

//temporary CSS - will be moved to external CSS file after some testing
var _css = "";
_css += ".postfilter { width: 900px;	background: rgba(0, 0, 0, 0.3); padding: 2px; margin-right:8px; vertical-align:top; box-shadow: 0px 0px 10px 0px  rgba(255,255,255,0.3); } ";
_css += ".postfilter-form { vertical-align:top; white-space:no-wrap; } ";
_css += ".postfilter-form > fieldset { border:none; margin:0; } ";
_css += ".postfilter-grpwrap { border: 1px solid rgba(255,255,255,0.3); margin: 5px; margin-bottom: 10px; vertical-align:top; min-height:140px; } ";
_css += ".postfilter-grp { padding: 5px; width: 280px; vertical-align:top; } ";
_css += ".postfilter-controls .postfilter-chk, .postfilter-rdo, .postfilter-lbl { vertical-align:middle; } ";
_css += ".postfilter-controls > fieldset { border-top:1px solid rgba(255,255,255,0.3); } ";
_css += ".postfilter-inline { float:left; display:inline-block; } ";
_css += ".postfilter-block { display:block; vertical-align:middle; } ";
_css += ".postfilter-chk, .postfilter-rdo { margin-right:2px; } ";
_css += ".postfilter-lbl { margin:2px 0px; } ";
_css += ".postfilter-desc { margin-left:4px; font-weight:bold;} ";
_css += ".resetDMOptions { color: #fff; border-radius : 5px;  border: 1px solid rgba(255,255,255,0.3); background: rgba(0, 0, 0, 0.3); margin:5px; float:right; box-shadow: 0px 0px 5px 0px  rgba(255,255,255,0.3); } ";
_css += ".resetDMOptions:hover { box-shadow: 0px 0px 5px  #FFFFFF; } ";
_css += ".postfilter-chk, .postfilter-rdo, .postfilter-lbl:not(.postfilter-desc), .resetDMOptions { cursor:pointer; } ";
_css += ".enhance-discussion .SpOptions:before { content: \"\\f146\" !important; color: #69CAFE !important; } ";
_css += ".discussionManager { width: 925px; } ";
_css += "#totopbutton { display:inline-block; position: fixed; bottom: 2px;   right: 7px; opacity: 0.75;  filter:alpha(opacity=75);} ";
_css += "#toendbutton { display:inline-block; position: fixed; top: 10px;   right: 7px; opacity: 0.75;  filter:alpha(opacity=75);} ";
_css += "#totopbutton:hover, #toendbutton:hover { opacity: 1; filter:alpha(opacity=100); } ";
_css += "#totopbutton .navbutton, #toendbutton .navbutton  {text-align:left; font-family:vanillicon; font-size:32px; font-weight: normal; color:#A7A7A9; text-shadow: 0px 2px 4px black; cursor:default;} ";
_css += ".enhanceMeta { display:inline-block; float:left; margin-right:5px; margin-left:-5px; min-width:30px; min-height:16px;} "
_css += ".enhanceMeta .Tag { font-family:'vanillicon' !important; font-size:20px; }"
_css += "div.enhanceMeta > span.Tag.Tag-Announcement:before { content: \"\\f15c\" !important;} "
_css += "div.enhanceMeta > span.Tag.QnA-Tag-Question:before { content: \"\\f181\" !important;} "
_css += "div.enhanceMeta > span.Tag.QnA-Tag-Answered:before { content: \"\\f181\" !important; filter: alpha(opacity=50); -moz-opacity: .5; opacity: .5;} "
_css += "div.enhanceMeta > span.Tag.QnA-Tag-Accepted:before { content: \"\\f173\" !important; "
_css += "div.enhanceMeta > span.Tag.Tag-Closed:before { content: \"\\f15e\" !important;} "

//default values
var pweDiscussionManager = { 
  "features": [
    {
      "fname":"fScrollButtons",
      "fdesc":"Show Scroll Buttons",
      "ftype":"Feature",
      "fselector":"fScrollButtons",
      "fdefault":"checked"
    },
    {
      "fname":"fAutoPage",
      "fdesc":"Use Autopaging",
      "ftype":"Feature",
      "fselector":"fAutoPage",
      "fdefault":"checked"
    },
    {
      "fname":"fFilter",
      "fdesc":"Use Filter",
      "ftype":"Feature",
      "fselector":"fFilter",
      "fdefault":"checked"
    }
  ],
  "filters": [
    {
      "fname":"fAnnounce",
      "fdesc":"Announcements",
      "ftype":"Discussion",
      "fselector":"tr.ItemDiscussion:has(span.Tag-Announcement)",
      "fdefault":"checked"
    },
    {
      "fname":"fPoll",
      "fdesc":"Polls",
      "ftype":"Discussion",
      "fselector":"tr.ItemDiscussion:has(span.Tag-Poll)",
      "fdefault":""
    },
    {
      "fname":"fQuestion",
      "fdesc":"Questions",
      "ftype":"Discussion",
      "fselector":"tr.ItemDiscussion:has(span.QnA-Tag-Question),tr.ItemDiscussion:has(span.QnA-Tag-Answered),tr.ItemDiscussion:has(span.QnA-Tag-Accepted)",
      "fdefault":"checked"
    },  
    {
      "fname":"fClosed",
      "fdesc":"Closed",
      "ftype":"Discussion",
      "fselector":"tr.ItemDiscussion:has(span.Tag.Tag-Closed)",
      "fdefault":""
    },
    {
      "fname":"fNew",
      "fdesc":"Unread (New)",
      "ftype":"Comment",
      "fselector":"tr.Item.New.ItemDiscussion, tr.Item.Unread.ItemDiscussion:not(tr.Participated)",
      "fdefault":"checked"
    },
    {
      "fname":"fPUnread",
      "fdesc":"Read (New)",
      "ftype":"Comment",
      "fselector":"tr.Participated.Unread",
      "fdefault":"checked"
    },
    {
      "fname":"fRead",
      "fdesc":"Read (No New)",
      "ftype":"Comment",
      "fselector":"tr.Read.ItemDiscussion, tr.Participated.Read.ItemDiscussion",
      "fdefault":"checked"
    }
  ]
};

// insert code generates css style to head
var addCSS = function(){
  $("<style type='text/css'>" + _css + " </style>").appendTo("head");
}
// add filter and settings dialog
var addFilterForm = function(){
  // form opening html
  var _formopen = "<div class=\"discussionManager enhanceDialog \" style=\"margin: 0px auto; display: none;\">";
  _formopen += "<div class=\"title\"><h1>Navigation \& Filters </h1><h1></h1></div><div class=\"content\">";
  _formopen += "<div class=\"postfilter\"><form id=\"postfilter-form\" class=\"postfilter-form\"><fieldset>";
  // form closing html
  var _formclose = "</fieldset></form></div>";
  // section(s) opening html
  var _wrapopen = "<div class=\"postfilter-grpwrap postfilter-inline\">";
  var _wrapclose = "</div>";
  var _ffeature = "<div class=\"postfilter-grp postfilter-inline\"><label class=\"postfilter-lbl postfilter-desc\" for=\"opts_feature\">Features: </label><div class=\"postfilter-controls\"><fieldset>";
  var _fdiscussion = "<div class=\"postfilter-grp postfilter-inline\"><label class=\"postfilter-lbl postfilter-desc\" for=\"chks_discussion\">Include By Discussions Type: </label><div class=\"postfilter-controls\"><fieldset>";
  var _fcomment = "<div class=\"postfilter-grp postfilter-inline\"><label class=\"postfilter-lbl postfilter-desc\" for=\"chks_comment\">Include By Comment Status:</label><div class=\"postfilter-controls\"><fieldset>";
  // section(s) closing html
  var _sectionclose = "</fieldset></div></div>";
  // generate features section
  $.each(pweDiscussionManager.features, function(_index, _element) {
    // extract details from settings
    var _filtername = _element.fname; // e.g "fAnnounce"
    var _filterdesc = _element.fdesc; // e.g "Announcements"
    var _filtertype = _element.ftype.toLowerCase(); // e.g "Discussion"
    var _filterselector = _element.fselector; // e.g "tr.ItemDiscussion:has(span.Tag-Announcement)"
    var _filterdefault = _element.fdefault; // e.g "checked" 
    // define this filter html
    var _thisfilter = "<div class=\"postfilter-block\"><label class=\"postfilter-lbl\" for=\"opt_"+ _filtername + "\">";
    _thisfilter += "<input class=\"postfilter-chk\" name=\"opts_" + _filtertype + "\" id=\"opt_"+ _filtername + "\" value=\"" + _filterselector + "\" type=\"checkbox\" " + _filterdefault + " />&nbsp;" + _filterdesc + "</label></div>";
    // combine with existing section html
    _ffeature += _thisfilter; 
  });
  // close off this section
  _ffeature += "<div class=\"postfilter-block\"><input class=\"resetDMOptions\" type=\"button\" value=\"Reset to Default\" ></div>" + _sectionclose;
  // generate filter section(s)
  $.each(pweDiscussionManager.filters, function(_index, _element) {
    // extract details from settings
    var _filtername = _element.fname; // e.g "fAnnounce"
    var _filterdesc = _element.fdesc; // e.g "Announcements"
    var _filtertype = _element.ftype.toLowerCase(); // e.g "Discussion"
    var _filterselector = _element.fselector; // e.g "tr.ItemDiscussion:has(span.Tag-Announcement)"
    var _filterdefault = _element.fdefault; // e.g "checked"
    // define this filter html
    var _thisfilter = "<div class=\"postfilter-block\"><label class=\"postfilter-lbl\" for=\"chk_"+ _filtername + "\">";
    _thisfilter += "<input class=\"postfilter-chk\" name=\"chks_" + _filtertype + "\" id=\"chk_"+ _filtername + "\" value=\"" + _filterselector + "\" type=\"checkbox\" " + _filterdefault + " />&nbsp;" + _filterdesc + "</label></div>";
    // combine with appropriate existing section html
    if (_filtertype == "discussion") { _fdiscussion += _thisfilter; }
    if (_filtertype == "comment") { _fcomment += _thisfilter; }
  });
  // close of filter section(s)
  _fdiscussion += _sectionclose;
  _fcomment += _sectionclose;
  // finalise form html
  var _form = _formopen + _wrapopen + _ffeature + _wrapclose + _wrapopen + _fdiscussion + _fcomment + _wrapclose + _formclose;
  // remove any existing instance of form and append to menu
  $(".discussionManager, .enhance-discussion").remove();
  $(".SiteMenu").append(_form);
  //define menu button, funtion and add to control panel
  var button = $('<a href="#" class="MeButton FlyoutButton" title="Navigation & Filters"><span class="Sprite Sprite16 SpOptions"></span></a>');
  var discussionControl = $("<span class='ToggleFlyout enhance-discussion'></span>");
  button.click(function(){
    $('.discussionManager').slideToggle();
    $('.discussionManager').siblings('.enhanceDialog:visible').detach().insertAfter($('.discussionManager')).slideToggle();
  });
  $(".MeMenu").append(discussionControl.append(button));
  //apply function to form controls
  $('input[type="checkbox"][name^="chks_"].postfilter-chk').click(function(){ applyFilter(); });
  $('input[type="checkbox"][name^="opts_"].postfilter-chk').click(function(){ applyOptions(); });
  $('input[type="button"].resetDMOptions').click(function(){ resetDMOptions(); });

  return false;
};


// add scroll to top/bottom of document buttons
var addScrollButtons = function(){
  //remove any previous instance of buttons
  $("div[id^='to']:has(span[id^='ScrollTo'])").remove();
  // add To Top and To Bottom Buttons
  $('#Frame').append("<div id='totopbutton'><span id='ScrollToTop' class='navbutton' title='Scroll To Top of Page' alt='Scroll To Top of Page'></span></div>"); //top button
  $('#Frame').append("<div id='toendbutton'><span id='ScrollToBottom' class='navbutton' title='Scroll To End of Page' alt='Scroll To End of Page'></span></div>"); //bottom button
  //define functions
  $('#ScrollToTop').click(function(){ $("html, body").animate({ scrollTop: 0 }, "fast"); });
  $('#ScrollToBottom').click(function(){ $("html, body").animate({ scrollTop: $(document).height() }, "fast"); });
}


// update and apply options as determined by form check boxes
var applyOptions = function(){

  // parse feature checkboxes for unchecked
  $('input[type="checkbox"][name^="opts_"].postfilter-chk').each(function(index) {     
    var $this = $(this);
    //update appropriate feature value in settings based on checkbox status
    $.each(pweDiscussionManager.features, function(_index, _element) {
      if ($this.attr("id").replace('opt_','') == _element.fname) { 
        if ($this.is(":not(:checked)")){ 
          pweDiscussionManager.features[_index].fdefault = "";
        } else {
          pweDiscussionManager.features[_index].fdefault = "checked" ;
        }       
        return false;
      }
    });

    // set scrollbutton status
    if ( $this.attr("id") ==  "opt_fScrollButtons")  {
      if ($this.is(":not(:checked)")){  
        // if not selected remove scroll to buttons
        $("div[id^='to']:has(span[id^='ScrollTo'])").remove();
        console.log ('Scroll Buttons Disabled');
      } else {
        // if selected add scroll to buttons
        addScrollButtons();
        console.log ('Scroll Buttons Enabled');
      }    
    }

    // set autopage status
    if ( $this.attr("id") ==  "opt_fAutoPage")  {
      if ($this.is(":not(:checked)")){
        //if not selected unbind scroll event and remove any added pages
        $(window).unbind('scroll');
        $("div[id^='pageadd_']").remove();
        console.log ('Autopage Disabled');
      } else {
        //if selected unbind and reapply autopage on scroll event
        _url = ""; //reset page position
        $(window).unbind('scroll');
        $(window).data('loading',false).scroll(function() {
          
         triggernextpage();
                
        });
        console.log ('Autopage Enabled');
      }    
    }

    // set filter status
    if ( $this.attr("id") ==  "opt_fFilter")  {
      if ($this.is(":not(:checked)")){
        //if not selected disable all filter checkboxes and show any hidden threads
        $('input[type="checkbox"][name^="chks_"].postfilter-chk').prop( "disabled", true );
        $("tr.ItemDiscussion").show();
        console.log ('Filters Disabled');
      } else {
        //if selected enable all filter checkboxes and apply filter to current page
        $('input[type="checkbox"][name^="chks_"].postfilter-chk').prop( "disabled", false);
        applyFilter();
        console.log ('Filters Enabled');
      }    
    }
  });   
  // save any settings changes
  update();
}


// update and apply filters based on check boxes
var applyFilter = function(){

  var _filteractive = false; //flag to prevent filtering 
  //check if filtering active
  $.each(pweDiscussionManager.features, function(_index, _element) {
    if (_element.fname == "fFilter" ) { 
      if (pweDiscussionManager.features[_index].fdefault.toLowerCase() == "checked"){ 
        _filteractive = true;
        return false; 
      }
    }
  });

  //only continue if filtering is active
  if (_filteractive) { 

    var _postfilter = ""; // initialise overall filter string
    var _post = "tr.ItemDiscussion"; // main item to be filtered

    // parse checkboxes for unchecked
    $('input[type="checkbox"][name^="chks_"].postfilter-chk').each(function(index) {  

      //$('input[type="checkbox"][name^="chks_"].postfilter-chk:not(:checked)').each(function(index) {     
      var $this = $(this); // filter being applied
      //update appropriate filter value in settings based on checkbox status	
      $.each(pweDiscussionManager.filters, function(_index, _element) {
        if ($this.attr("id").replace('chk_','') == _element.fname) { 
          if ($this.is(":not(:checked)")){ 
            pweDiscussionManager.filters[_index].fdefault = "";
          } else {
            pweDiscussionManager.filters[_index].fdefault = "checked" ;
          } 
          return false;
        }

      });
      // generate selector string for items to be hidden
      if ($this.is(":not(:checked)")){
        // insert seperator for selector filter where multiple exlusions
        if ($('input[type="checkbox"][name^="chks_"].postfilter-chk:not(:checked)').index($this) > 0) { _postfilter += ", "; }  
        // combine current filter to overall
        _postfilter += $this.val();
      } 
    });   
    // troubleshooting
    //console.log ("New Filter: : + _postfilter);

    $(_post).show(); //show all categories first
    $(_postfilter).hide(); // hide unchecked categories
    // save any filter changes
    update();  
  }
};


// wrapper to manage excessive on scroll triggering
var triggernextpage = function() {

  //if a page is already loading skip trigger
  if ($(window).data('loading') == true) return;

  var nearToBottom = 50; // how far from the bottom before event is actioned
  //if ($(window).scrollTop() + $(window).height() > $(document).height() - nearToBottom) { 
  var st = $(document).scrollTop();

  if(Math.abs(lastScrollTop - st) <= delta)
    return;

  // check for downscroll only
  if (st > lastScrollTop){
    // check for processing in progress
    if ($(window).data('loading') == false) {

      var _type = 0; // reset page type 0 = null, 1 = discussion lists e.g discussions or categories, 2 = discussion pages i.e comments, 3 = Search Results

      //determine page type and define variables 
      if ( $( "table.DataTable.DiscussionsTable" ).length ) { 
        _type = 1;
        var _element = 'td.DiscussionName';
        var _containerclass = 'div.DataTableWrap';
      }
      if ( $( "ul.MessageList.DataList.Comments" ).length ) {
        _type = 2;
        var _element = 'h2.CommentHeading';
        var _containerclass = 'div.CommentsWrap';
      } 
      if ( $( "ol.DataList.DataList-Search" ).length ) {
        var _type = 3;
        var _element = 'h2.CommentHeading';
        var _containerclass = 'div.Column.ContentColumn'; 

        //insert initial header for search page parsing
        if ( $('div[id^="pageadd_"]').length == 0 && $('h2.CommentHeading').length == 0 ) {
          //insert page 1 header for tracking
          $( "ol.DataList.DataList-Search").first().before('<h2 class="CommentHeading">Page ' + parseInt($("#PagerBefore a.Highlight").text(),10) + '</h2>');
        }
      }

      // only continue if value page type
      if (_type > 0) {

        var $post = $( _containerclass + ',div[id^="pageadd_"]').last().find( _element ); // find header in last 'page' loaded
        if ($post.is(":visible")) {      
          var position = parseInt( $post.position().top - $(window).scrollTop(),10); // determine relation to top of window for trigger
          // only load next page if selected element has just scrolled off top of page OR scrolled near to bottom
          if ( position <= 0 || $(window).scrollTop() + $(window).height() > $(document).height() - nearToBottom )  {  
            // set loading flag true to prevent further triggers
            $(window).data('loading', true);
            getnextpage(); // call next page
            // reset loading flag to false to allow further loading
            $(window).data('loading', false);
          }  
        }
      }
    }
  }
  lastScrollTop = st;
}


// autopager function main code
var getnextpage = function(){

  var _id =""; // reset id name
  var _type = 0; // reset page type 0 = null, 1 = discussion lists e.g discussions or categories, 2 = discussion pages i.e comments
  var _lastpage = parseInt($("#PagerBefore a.LastPage").text(),10);
  //determine page type and define variables
  if ( $( "table.DataTable.DiscussionsTable" ).length ) {
    //categories & discussions pages discussion lists
    var _type = 1;
    var _insertbefore = ".PageControls.Bottom";
    var _dataload = ".html .DataTable";
    var _splitstart = '<table class="DataTable DiscussionsTable">';
    var _splitend = '</table>';
    var _pagetitle = 'td.DiscussionName';
  } 
  if ( $( "ul.MessageList.DataList.Comments" ).length ) {
    // discussion comments lists
    var _type = 2;
    var _insertbefore = "div.P.PagerWrap:has(div#PagerAfter)";
    var _dataload = ".html .DataBox";
    var _splitstart = '<div class="DataBox DataBox-Comments">';
    var _splitend = '<div class="P PagerWrap">';
    var _pagetitle = 'h2.CommentHeading';
  } 
  if ( $( "ol.DataList.DataList-Search" ).length ) {
    // search lists
    var _type = 3;
    var _insertbefore = "div.PageControls.Bottom";
    var _dataload = ".html .DataList";
    var _splitstart = '<ol id=';
    var _splitend = '<div class="PageControls Bottom">';
    var _pagetitle = '';
  }

  // only continue if value page type
  if (_type > 0) {

    var _oldurl = _url; // store old url
    // if not first page inserted
    if ( $('div[id^="pageadd_"]').length > 0 ) {
      var regex = new RegExp( "pageadd_", 'g');
      _page = parseInt($('div[id^="pageadd_"]').last().attr('id').replace(/\D/g,''));

      _newpage = _page + 1; //increment page   

      if (_type == 3){
        var regex = new RegExp( "Page=p"+_page, 'g');
        _url = _oldurl.replace(regex, "Page=p" + _newpage); //replace the old page number in the url with the new page number 
      } else {
        var regex = new RegExp( "/p"+_page, 'g');
        _url = _oldurl.replace(regex, "/p" + _newpage); //replace the old page number in the url with the new page number 
      } 

    } else { 
      // if first page inserted     
      _url = $("#PagerBefore a.Next").attr("href"); //get page details from pager element next button

      if (_type == 3) { 
        _newpage = parseInt(_url.substring( _url.indexOf('?Page=') + 6, _url.indexOf('&')).split(/[\/ ]+/).pop().replace(/\D/g,'')); //extract page number from url as integer     
      } else {   
        _newpage = parseInt(_url.split(/[\/ ]+/).pop().replace(/\D/g,'')); //extract page number from url as integer     
      }
    }
    // console.log(_url);
    // check not past last page
    if (_newpage <= _lastpage ) {
      _id = "pageadd_" + _newpage;

      $('#'+ _id).remove(); //ensure no duplicates for each page 
      $("<div id='" + _id + "' class='pagehidden'></div>").insertBefore(_insertbefore); //insert before bottom pager controls

      var $content = $("#" + _id); //store container as variable to reduce calls
      $content.hide(); // hide container while work going on

      console.log ("Loading:" + _url); //troubleshooting

      // load next page into hidden container while processing it
      $content.load( _url + _dataload , function (response, status, xhr) {
        console.log("Load Status: " + status); //troubleshooting

        var _fullPage = response; //store response in variable
        // extract required elements using defined start and end strings
        var _newcontent =  _fullPage.substring( _fullPage.indexOf(_splitstart), _fullPage.indexOf(_splitend)) ; 
        $content.html(_newcontent); //update container to new page extract
        // calculate thread count for discussions pages
        if ($content.find('tr.ItemDiscussion').length > 0 ) { 
          var _pageposts =  " (" + $content.find('tr.ItemDiscussion').length + " Threads)";
        } else {
          var _pageposts = ""; 
        }
        // change title at top of section from Discussions to Page # ( # Threads) format
        $content.find( _pagetitle ).first().text("Page " + parseInt(_id.split(/[_ ]+/).pop().replace(/\D/g,'')) + _pageposts );

        if (_type == 3) { $content.prepend('<h2 class="CommentHeading">Page ' + _newpage + '</h2>'); }   

        if  ( _type == 1 )  { applyFilter();  } //reapply current filter
        $content.show(); //unhide container
        $(document).trigger('PageLoaded', [$content]);
      }); 
    }
  }
}


// function to reset user experience to default plug in values - also useful when major update to filter definitions in code
var resetDMOptions = function () {
  var _answer = confirm("Are you sure you wish to use default settings?");
  console.log(_answer);
  if (_answer == true) { 
    localStorage.removeItem("pweDiscussionManagerStore");
    location.reload();
  } 
}

/* cloned from asterelle with minor changes */

var mergeData = function(to, from, allowAddKeys) {
  if (from == null) {
    return;
  }
  for (var key in from) {
    if (typeof from[key] == 'object' && key in to) 
      mergeData(to[key], from[key]);
    else if (key in to || allowAddKeys) 
      to[key] = from[key];
  }
};

var update = function() {
  saveSettings();
};

// amdended settings names
var saveSettings = function(){
  localStorage["pweDiscussionManagerStore"] =  JSON.stringify(pweDiscussionManager);
  //console.log(JSON.stringify(pweDiscussionManager));
};

//amended settings names
var getSettings = function() {
  var savedSettingsJSON = localStorage["pweDiscussionManagerStore"];
  if (savedSettingsJSON) {
    var savedSettings = JSON.parse(savedSettingsJSON);
    mergeData(pweDiscussionManager.features, savedSettings.features, true);
    mergeData(pweDiscussionManager.filters, savedSettings.filters, false);		
  }
};

/* end of section cloned from asterelle  */

$( document ).ready(function() {
  //amend title on first page header of discussions page
  var $content = $("div.DataTableWrap");
  if ($content.find('tr.ItemDiscussion').length > 0 ) { 
    var _pageposts =  " (" + $content.find('tr.ItemDiscussion').length + " Threads)"; 
  } else {
    var _pageposts = ""; 
  }
  $content.find('td.DiscussionName').first().text("Page " + $('#PagerBefore > a.Highlight').first().text() + _pageposts );

  //initialise plug in
  addCSS();
  getSettings();
  addFilterForm();
  applyOptions();

});

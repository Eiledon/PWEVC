// ==UserScript==
// @name        PWE Discussion Manager
// @namespace   https://github.com/Eiledon/PWEVC/
// @downloadURL https://github.com/Eiledon/PWEVC/raw/master/PWE_Discussion_Manager.user.js
// @updateURL  https://github.com/Eiledon/PWEVC/raw/master/PWE_Discussion_Manager.user.js
// @include     *perfectworld.vanillaforums.com/*
// @version     0.4.7
// @description  Adds Autopage (Discussions/Comments/Search Results/Activity, Profiles - Discussions/Comments), Filtering (Discussions) and buttons for Scroll to Top and Bottom
// @grant       none
// @copyright  2015, Eiledon. portions of code from Asterelle
// ==/UserScript==

var _sep = "_" ;
var _url = "";
var lastScrollTop = 0, delta = 5;
var triggerdelay = 500;
var _autopagepaused = false;

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
_css += "#toPage { display:inline-block; float:right; } ";
_css += "#ScrollToPrev, #ScrollToNext, #autopageToggle { display:inline-block; margin-right:5px; opacity: 0.75;  filter:alpha(opacity=75);} ";
_css += "#totopbutton:hover, #toendbutton:hover, #ScrollToPrev:hover, #ScrollToNext:hover, #autopageToggle:hover { opacity: 1; filter:alpha(opacity=100); } ";
_css += "#totopbutton .navbutton, #toendbutton .navbutton, #toPage .navbutton  {text-align:left; font-family:vanillicon; font-size:32px; font-weight: normal; color:#A7A7A9; text-shadow: 0px 2px 4px black; cursor:pointer;} ";
_css += "#toPage .navbutton  {font-size:24px; vertical-align:middle; height: 22px; width: 22px;} ";

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
var addCSS = function(){ $("<style type='text/css'>" + _css + " </style>").appendTo("head"); };

// add filter and settings dialog
var addFilterForm = function(){
  // form opening html
  var _formopen = "<div class=\"discussionManager enhanceDialog \" style=\"margin: 0px auto; display: none;\">";
  _formopen += "<div class=\"title\"><h1>Navigation & Filters </h1><h1></h1></div><div class=\"content\">";
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
};


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
        toggleAutopage(false);
        $("div[id^='pageadd_']").remove();
        console.log ('Autopage Disabled');
      } else {
        //if selected unbind and reapply autopage on scroll event
        _url = ""; //reset page position
        toggleAutopage(true);
		_autopagepaused = false;
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


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// function to toggle state of autopage and associated pause button(s)
var toggleAutopageButton = function (_state) {
  if (typeof _state === 'undefined') { _state = true; }
  if (_state)  {
    //if autopaging paused, unpause and change icon, text to 'pause' button
    $('span[id="autopageToggle"]').each(function() {
      $(this).text ('❚❚') ;
      $(this).attr('title','Pause Autopaging');
      $(this).attr('alt','Pause Autopaging');
    });
  } else {
    // if autopaging running, pause and change icon, text to 'unpause' button
    $('span[id="autopageToggle"]').each(function() {
      $(this).text('►') ;
      $(this).attr('title','Restart Autopaging');
      $(this).attr('alt','Restart Autopaging');
    });
  }  
  toggleAutopage(_state);
  _autopagepaused = !_autopagepaused;
}                 

// function to disable/enable scroll event checking
var toggleAutopage = function(_state) {
  if (typeof _state === 'undefined') { _state = true; }
  if (_state) {
       $(window).unbind('scroll');
       $(window).data('loading',false).scroll( debounce(triggernextpage, triggerdelay) );
  } else {
       $(window).unbind('scroll');
  }
}


// wrapper to manage excessive on scroll triggering
var triggernextpage = function() {

  //if a page is already loading skip trigger
  if ($(window).data('loading')) return;

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
        if ( $('div[id^="pageadd_"]').length == 0 && $(_element).length == 0 ) {
          //insert page 1 header for tracking
          $( "ol.DataList.DataList-Search").first().before('<h2 class="CommentHeading">Page ' + parseInt($("#PagerBefore a.Highlight").text(),10) + '</h2>');
        }
      }
      if ( $( "ul.DataList.Activities" ).length ) {
        var _type = 4;
        var _element = 'h2.CommentHeading';
        var _containerclass = 'div.Column.ContentColumn, div.DataListWrap'; 

        //insert initial header for search page parsing
        if ( $('div[id^="pageadd_"]').length == 0 && $(_element).length == 0 ) {
          var _nexturl = $("#PagerBefore a.Next").attr("href");
          var _thispage = parseInt(_nexturl.substring( _nexturl.indexOf('?Page=') + 6, _nexturl.indexOf('&')).split(/[\/ ]+/).pop().replace(/\D/g,'')) - 1;
          
          //insert page 1 header for tracking
          $( "ul.DataList.Activities").first().before('<h2 class="CommentHeading">Page ' + _thispage + '</h2>');
        }
      }
      if ( $( "ul.DataList.Discussions" ).length ) {
        var _type = 5;
        var _element = 'h2.CommentHeading';
        var _containerclass = 'div.DataListWrap'; 

        //insert initial header for search page parsing
        if ( $('div[id^="pageadd_"]').length == 0 && $(_element).length == 0 ) {
          var _nexturl = $("#PagerMore a").attr("href");
          var _thispage = parseInt(_nexturl.split(/[\/ ]+/).pop().replace(/\D/g,'')) - 1;
          
          //insert page 1 header for tracking
          $( "ul.DataList.Discussions").first().before('<h2 class="CommentHeading">Page ' + _thispage + '</h2>');
        }
      }
      if ( $( "ul.DataList.SearchResults" ).length ) {
        var _type = 6;
        var _element = 'h2.CommentHeading';
        var _containerclass = 'div.DataListWrap'; 

        //insert initial header for search page parsing
        if ( $('div[id^="pageadd_"]').length == 0 && $(_element).length == 0 ) {
          var _nexturl = $("#PagerMore a").attr("href");
          var _thispage = parseInt(_nexturl.split(/[\/ ]+/).pop().replace(/\D/g,'')) - 1;

          //insert page 1 header for tracking
          $( "ul.DataList.SearchResults").first().before('<h2 class="CommentHeading">Page ' + _thispage + '</h2>');
        }
      }

      // only continue if value page type
      if (_type > 0) {
        
        var $post = $( _containerclass + ',div[id^="pageadd_"]').last().find( _element ).first(); // find header in last 'page' loaded    
        
        if ( $('div[id^="pageadd_"]').length == 0 && $('#toPage').length == 0 ) {

          // add To Next and To Prev Page Buttons
          $post.prepend("<div id='toPage'><span id='ScrollToNext' class='navbutton' title='Scroll To Next Page' alt='Scroll To Next Page'></span><span id='autopageToggle' class='navbutton' title='Pause Autopaging' alt='Pause Autopaging'>❚❚</span></div>"); //bottom button
          //define functions
          $post.find('#ScrollToNext').first().click(function(){ if($('div[id^="pageadd_"]').length) { var _toPos = $('div[id^="pageadd_"]:first').offset().top + 2; }else{ var _toPos = $(document).height();} $("html, body").animate({ scrollTop:_toPos }, "fast"); });   
          $post.find('#autopageToggle').first().click(function(){ toggleAutopageButton(_autopagepaused); });
        }
        

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
  var _id = ""; //reset id
  var _type = 0; // reset page type 0 = null, 1 = discussion lists e.g discussions or categories, 2 = discussion pages i.e comments
  var _lastpage = parseInt($("#PagerBefore a.LastPage").text(),10);
  //determine page type and define variables
  if ( $( "table.DataTable.DiscussionsTable" ).length ) {
    //categories & discussions pages discussion lists
    var _type = 1;
    var _insertPoint = ".PageControls.Bottom";
    var _titleElement = 'td.DiscussionName';
    var _testElement = 'tr[id^="Discussion_"]';
    var _fromElement = "table.DataTable.DiscussionsTable";
  } 
  if ( $( "ul.MessageList.DataList.Comments" ).length ) {
    // discussion comments lists
    var _type = 2;
    var _insertPoint = "div.P.PagerWrap:has(div#PagerAfter)";  
    var _titleElement = 'h2.CommentHeading';
    var _testElement = 'li[id^="Comment_"]';    
    var _fromElement = "ul.MessageList.DataList.Comments";
  } 
  if ( $( "ol.DataList.DataList-Search" ).length ) {
    // search lists
    var _type = 3;
    var _insertPoint = "div.PageControls.Bottom";
    var _titleElement = 'h2.CommentHeading';
    var _testElement = 'li[class^="Item"]';
    var _fromElement = "ol.DataList.DataList-Search";
  }
  if ( $( "ul.DataList.Activities" ).length ) {
    // activities
    var _type = 4;
    var _insertPoint = "div.PagerWrap:has(div#PagerBefore)";
    var _titleElement = 'h2.CommentHeading';
    var _testElement = 'li[id^="Activity_"]';
    var _fromElement = "ul.DataList.Activities";
    // no true last page  
    _lastpage = 100;
  }
  if ( $( "ul.DataList.Discussions" ).length ) {
    // profile discussions
    var _type = 5;
    var _insertPoint = "div.DataListWrap";
    var _titleElement = 'h2.CommentHeading';
    var _testElement = 'li[id^="Discussion_"]';
    var _fromElement = "ul.DataList.Discussions";
    // no true last page  
    _lastpage = 100;
  }
  if ( $( "ul.DataList.SearchResults" ).length ) {
    // profile comments
    var _type = 6;
    var _insertPoint = "div.DataListWrap";
    var _titleElement = 'h2.CommentHeading';
    var _testElement = 'li[id^="Comment_"]';
    var _fromElement = "ul.DataList.SearchResults";
    // no true last page  
    _lastpage = 100;
  }

  // only continue if value page type
  if (_type > 0) {
    var _oldurl = _url; // store old url
    // if not first page inserted
    if ( $('div[id^="pageadd_"]').length ) {
      var regex = new RegExp( "pageadd_", 'g');
      _page = parseInt($('div[id^="pageadd_"]').last().attr('id').replace(/\D/g,''));
      _newpage = _page + 1; //increment page   

      if (_type == 3||_type == 4){
        var regex = new RegExp( "Page=p"+_page, 'g');
        _url = _oldurl.replace(regex, "Page=p" + _newpage); //replace the old page number in the url with the new page number 
      } else {
        var regex = new RegExp( "/p"+_page, 'g');
        _url = _oldurl.replace(regex, "/p" + _newpage); //replace the old page number in the url with the new page number 
      } 
    } else { 
      // if first page inserted     
      _url = $("#PagerBefore a.Next, #PagerMore a").first().attr("href"); //get page details from pager element next button
      _page = parseInt($("#PagerBefore a.Highlight").text(),10);
      if (_type == 3||_type == 4) { 
        _newpage = parseInt(_url.substring( _url.indexOf('?Page=') + 6, _url.indexOf('&')).split(/[\/ ]+/).pop().replace(/\D/g,'')); //extract page number from url as integer     
      } else {   
        _newpage = parseInt(_url.split(/[\/ ]+/).pop().replace(/\D/g,'')); //extract page number from url as integer     
      }
    }

    if (_newpage <= _lastpage ) {
           
      _id = "pageadd_" + _newpage;
      var _toElement = "#" + _id;
      var _titleString = "Page " + _newpage + " ([resultcount] Results)"

      $(_toElement).remove(); //ensure no duplicates for each page 
      
      if (_type == 5||_type == 6){
       $(_insertPoint + ',div[id^="pageadd_"]' ).last().after("<div id='" + _id + "' class='pagehidden'></div>"); //insert after more controls 
      }else{
       $("<div id='" + _id + "' class='pagehidden'></div>").insertBefore(_insertPoint); //insert before bottom pager controls        
      }

      if (_type != 1) { $(_toElement).prepend('<h2 class="CommentHeading"></h2>'); }  //prepend page title for search results (not on original page) 
      
      $(_toElement).prepend('<div id="loading" style="text-align:center;"><h1 class="CommentHeading">Loading Next Page</h2></div>'); //let user know what is happening
      
      loadpage(_url,_toElement, _fromElement, _testElement, _titleElement, _titleString); //execute ajax load
      if  ( _type == 1 )  { applyFilter();  }              //reapply current filter for discussion lists
      $(document).trigger('PageLoaded', [$(_toElement)]);       //trigger enhancements from other scripts

    }
  }
}

//function to load next results page - if required elements not found will try again
var loadpage = function(_url, _toElement, _fromElement, _testElement,  _titleElement, _titleString ){
  $.ajax({ url: _url, dataType: 'html', async:false, success: function(response) { 
    if (jQuery(response).find(_testElement).length) {
      jQuery(response).find(_fromElement).clone().appendTo( $(_toElement));  
      $(_toElement).find( _titleElement ).first().text(_titleString.replace("[resultcount]", $(_toElement).find(_testElement).length)); // change title at top of to Page # ( # Threads) format
      // add To Next and To Prev Page Buttons
      $(_toElement).find(_titleElement).first().prepend("<div id='toPage'><span id='ScrollToPrev' class='navbutton' title='Scroll To Previous Page' alt='Scroll To Previous Page'></span><span id='ScrollToNext' class='navbutton' title='Scroll To Next Page' alt='Scroll To Next Page'></span><span id='autopageToggle' class='navbutton' title='Pause Autopaging' alt='Pause Autopaging'>❚❚</span></div>"); //bottom button
      //define functions
      $(_toElement).find('#ScrollToPrev').first().click(function(){ $("html, body").animate({ scrollTop: $(_toElement).prev().offset().top }, "fast"); });
      $(_toElement).find('#ScrollToNext').first().click(function(){ if($(_toElement).next().length) { var _toPos = $(_toElement).next().offset().top + 2; }else{ var _toPos = $(document).height();} $("html, body").animate({ scrollTop:_toPos }, "fast"); });   
      $(_toElement).find('#autopageToggle').first().click(function(){ toggleAutopageButton(_autopagepaused); });
      $(_toElement).find('#loading').remove();
    }  else {
      loadpage(_url, _toElement, _fromElement, _testElement,  _titleElement, _titleString );
    }      
  } });
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
  //initialise plug in
  addCSS();
  getSettings();
  addFilterForm();
  applyOptions();

});

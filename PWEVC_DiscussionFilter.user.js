// ==UserScript==
// @name        PWEV_DiscussionFilter
// @namespace   Eiledon
// @include     *perfectworld.vanillaforums.com/*
// @version     0.2
// @grant       none
// ==/UserScript==

var applyFilter = function(){
  
  var _post = "tr.ItemDiscussion";

  // Filters  
  var _filters = {
    "excAnn" : "tr.ItemDiscussion:has(span.Tag-Announcement)" /*Announcements*/ ,
    "excPoll" : "tr.ItemDiscussion:has(span.Tag-Poll)" /*Polls*/ ,
    "excNew" : "tr.Item.New.ItemDiscussion, tr.Item.Unread.ItemDiscussion:not(tr.Participated)" /*New / Unread Discussion*/ ,
    "excPUnread" : "tr.Participated.Unread" /*Participated Discussion - new content*/ ,
    "excPRead" : "tr.Participated.Read.ItemDiscussion" /*Participated Discussion - no new content*/ ,
    "excReadNoNew" : "tr.Read.ItemDiscussion:not(tr.Participated)" /*Read discussion - no new content*/
  };
    
  // initialise overall filter string
  var _postfilter = "";

  // parse checkboxes for unchecked
  $('input[type="checkbox"].postfilter-chk:not(:checked)').each(function(index) {     
    var $this = $(this);

    if ($this.is(":not(:checked)")){
      // insert seperate for selector filter where multiple exlusions
      if ($('input[type="checkbox"].postfilter-chk:not(:checked)').index($this) > 0) { _postfilter += ", "; }  
      // combine current filter to overall
      _postfilter += _filters["exc"+ $this.val()];;
    }    
  });   
  // troubleshooting
  console.log (_postfilter);

  
  $(_post).show() //show all categories first
  $(_postfilter).hide(); // hide unchecked categories
    
  return false;  
};

var addFilterForm = function(){
  
  //temporary add styles for new tooltip class to be added to links
  $("<style type='text/css'> .postfilter, .postfilter-form, .postfilter-desc, .postfilter-chk,.postfilter-lbl {display:inline-block; vertical-align:middle;} </style>").appendTo("head");
  $("<style type='text/css'> .postfilter {float:right; padding: 2px 5px; margin-right:5px; border: 1px solid #000;	font-size:90%; font-weight: normal;} </style>").appendTo("head");
  $("<style type='text/css'> .postfilter-form {/* */ } </style>").appendTo("head");
  $("<style type='text/css'> .postfilter-desc {/* */} </style>").appendTo("head");
  $("<style type='text/css'> .postfilter-chk{margin-right:2px;} </style>").appendTo("head");
  $("<style type='text/css'> .postfilter-lbl {margin:2px 0px;} </style>").appendTo("head");
  

  var _form = "<div class=\"postfilter\"><form id=\"postfilter-form\" class=\"postfilter-form\">";
  _form += "<div class=\"postfilter-desc\"><span title=\"Un-check box to hide posts\" alt=\"Un-check box to hide posts\">Show:<span></div>";
  _form += "<input id=\"chk_1\" name=\"chk_1\" class=\"postfilter-chk\" type=\"checkbox\" value=\"Ann\" checked /><label class=\"postfilter-lbl\" for=\"chk_1\">Announcements</label>";
  _form += "<input id=\"chk_2\" name=\"chk_2\" class=\"postfilter-chk\" type=\"checkbox\" value=\"Poll\" /><label class=\"postfilter-lbl\" for=\"chk_2\">Polls</label> | ";
    _form += "<input id=\"chk_3\" name=\"chk_3\" class=\"postfilter-chk\" type=\"checkbox\" value=\"New\" checked /><label class=\"postfilter-lbl\" for=\"chk_3\">New/Unread</label>";
    _form += "<input id=\"chk_4\" name=\"chk_4\" class=\"postfilter-chk\" type=\"checkbox\" value=\"PUnread\" checked /><label class=\"postfilter-lbl\" for=\"chk_4\">Commented/New</label>";
    _form += "<input id=\"chk_5\" name=\"chk_5\" class=\"postfilter-chk\" type=\"checkbox\" value=\"PRead\" checked /><label class=\"postfilter-lbl\" for=\"chk_5\">Commented/No New</label>";
    _form += "<input id=\"chk_6\" name=\"chk_6\" class=\"postfilter-chk\" type=\"checkbox\" value=\"ReadNoNew\" /><label class=\"postfilter-lbl\" for=\"chk_6\">Read/No New</label>";
  _form += "</form></div>";
    
  $("div.PageControls.Top > #PagerBefore").after(_form);
  
  $('input[type="checkbox"].postfilter-chk').click(function(){
       applyFilter();
    });
  
  applyFilter();
  return false;
};

$( document ).ready(function() {
    addFilterForm();
});
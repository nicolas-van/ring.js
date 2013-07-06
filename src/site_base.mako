<%!
    sideContent = True

%>

<%inherit file="/common/base.mako"/>
<%namespace name="macros" file="/macros.mako"/>

<%block name="favicons">
    <link rel="shortcut icon" href="/static/img/favicon.ico">
</%block>

<%block name="head">
    <link rel="stylesheet" type="text/css" href="/static/css/style.css" />
</%block>

<%block name="sideContent">
    <div class="sidePageHeader">
        <a href="/"><img src="/static/img/ring_150.png"></a>
        <div>
            <h1>Ring.js</h1>
            <h2>JavaScript Class System with Multiple Inheritance</h2>
        </div>
    </div>
    <div class="sideNavigation">
        ${macros.navigation()}
    </div>
</%block>

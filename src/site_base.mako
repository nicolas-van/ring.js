<%!
    sideContent = True

%>

<%inherit file="/common/base.mako"/>
<%namespace name="macros" file="/macros.mako"/>

<%block name="favicons">
    <link rel="shortcut icon" href="/static/img/favicon.ico">
</%block>

<%block name="beforeContent">
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-33415030-6', 'neoname.eu');
      ga('send', 'pageview');

    </script>
    <a href="https://github.com/nicolas-van/ring.js"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" alt="Fork me on GitHub"></a>
</%block>

<%block name="head">
    <link rel="stylesheet" type="text/css" href="/static/css/style.css"></link>
    <script type="text/javascript" src="/static/js/underscore.js"></script>
    <script type="text/javascript" src="/static/js/ring.js"></script>
</%block>

<%block name="sideContent">
    <div class="sidePageHeader sideBlock">
        <a href="/"><img src="/static/img/ring_150.png"></a>
        <div>
            <h1>Ring.js</h1>
            <h2>JavaScript Class System with Multiple Inheritance</h2>
        </div>
    </div>
    <div class="sideNavigation sideBlock">
        <h3>Navigation</h3>
        ${macros.navigation()}
    </div>
    <div class="usefulLinks sideBlock">
        <h3>Useful Links</h3>
        ${macros.links()}
    </div>
</%block>

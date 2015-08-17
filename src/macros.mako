
<%namespace name="basemacros" file="/common/macros.mako"/>

<%def name="navigation()">
    <a href="/">home</a>
    <a href="/docs/docs.html">documentation</a>
    <a href="https://github.com/nicolas-van/ring.js/releases">releases</a>
    <a href="/faq.html">faq</a>
</%def>

<%def name="links()">
    <a href="https://github.com/nicolas-van/ring.js/issues">Bug tracker</a>
    <a href="https://github.com/nicolas-van/ring.js">Ring.js @ Github</a>
    ${basemacros.links()}
</%def>

<%def name="social()">
    <a href="https://twitter.com/share" class="twitter-share-button" data-url="http://ringjs.neoname.eu" data-text="Ring.js - JavaScript Class System with Multiple Inheritance" data-via="nicolasvanhoren" data-lang="fr">Tweeter</a>
    <a href="https://twitter.com/nicolasvanhoren" class="twitter-follow-button" data-show-count="false" data-show-screen-name="false">Follow @nicolasvanhoren</a>
    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
    <iframe src="http://ghbtns.com/github-btn.html?user=nicolas-van&repo=ring.js&type=watch&count=true" allowtransparency="true" frameborder="0" scrolling="0" width="110" height="20"></iframe>
</%def>

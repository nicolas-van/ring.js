
<%namespace name="basemacros" file="/common/macros.mako"/>

<%def name="navigation()">
    <a href="/">home</a>
    <a href="/releases.html">download</a>
    <a href="/docs/docs.html">documentation</a>
    <a href="/faq.html">faq</a>
</%def>

<%def name="links()">
    <a href="https://github.com/nicolas-van/ring.js/issues">Bug tracker</a>
    <a href="https://github.com/nicolas-van/ring.js">Ring.js @ Github</a>
    ${basemacros.links()}
</%def>
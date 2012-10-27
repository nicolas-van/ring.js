
var e = new nova.TemplateEngine();
var transform = function(x) {
    return _.filter(_.map(x.split("\n"), function(el) { return el.trim(); }),
        function(el) { return el; }).join("");
};

e.loadFile("templates.html").pipe(function() {

module("TemplateEngine");

test("base", function() {
    var r = e.yop();
    equal(r.trim(), "Hello");
    r = e.test({test_var: "azerty"});
    equal(r.trim(), "azerty");
    r = e.test2({lst: [1, 2, 3]});
    r = transform(r);
    equal(r, "123"); 
    r = e.test3({lst: [2, 3, 4]});
    r = transform(r);
    equal(r, "234");
    r = e.testfct();
    equal(transform(r), "abcdef");

});

test("escaping", function() {
    var r = e.testescaping();
    equal(r.trim(), "&lt;div&gt;&lt;&#x2F;div&gt;");
});

test("noescaping", function() {
    var r = e.testnoescaping();
    equal(r.trim(), "<div></div>");
});

test("this", function() {
    var obj = {str: "test"};
    var r = e.test_this.call(obj);
    equal(r.trim(), obj.str);
});

test("slash_escape", function() {
    var tmpl = e.buildTemplate("\\${1+1}");
    equal(tmpl(), "${1+1}");
    var tmpl = e.buildTemplate("\\\\${1+1}");
    equal(tmpl(), "\\2");
    var tmpl = e.buildTemplate("\\\\\\${1+1}");
    equal(tmpl(), "\\${1+1}");
    var tmpl = e.buildTemplate("\\\\\\\\${1+1}");
    equal(tmpl(), "\\\\2");
    var tmpl = e.buildTemplate("\\\\\\\\\\${1+1}");
    equal(tmpl(), "\\\\${1+1}");
});

test("def", function() {
    var r = e.testDef();
    equal(r.trim(), "Test");
});

test("functional_prog", function() {
    var r = e.testFunctional();
    equal(transform(r), "<div>Test</div>");
});


});


var e = new nova.TemplateEngine();

e.loadFile("templates.html").pipe(function() {

module("TemplateEngine");

test("base", function() {
    var r = e.yop();
    equal(r.trim(), "Hello");
    r = e.test({test_var: "azerty"});
    equal(r.trim(), "azerty");
    r = e.test2({lst: [1, 2, 3]});
    var transform = function(x) {
        return _.filter(_.map(x.split("\n"), function(el) { return el.trim(); }),
            function(el) { return el; }).join(" ");
    };
    r = transform(r);
    equal(r, "1 2 3"); 
    r = e.test3({lst: [2, 3, 4]});
    r = transform(r);
    equal(r, "2 3 4");
    r = e.testfct();
    equal(transform(r), "abc def");

    var tmpl = e.buildTemplate(" \\\\\\% lalala");
    equal(tmpl(), " \\% lalala");

    r = e.testcallmacro();
    equal(transform(r), "lalala");
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


});

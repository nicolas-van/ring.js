
if (typeof(exports) !== "undefined") { // nodejs
    _ = require("underscore");
}

test("base", function() {
    var C = ring.class({});
    deepEqual(C.__mro__, [C, ring.object]);
});

test("mro", function() {
    var f = ring.class("f", [], {});
    deepEqual(f.__mro__, [f, ring.object]);
    var e = ring.class("e", [], {});
    deepEqual(e.__mro__, [e, ring.object]);
    var d = ring.class("d", [], {});
    deepEqual(d.__mro__, [d, ring.object]);

    var c = ring.class("c", [d, f], {});
    deepEqual(c.__mro__, [c, d, f, ring.object]);
    var b = ring.class("b", [d, e], {});
    deepEqual(b.__mro__, [b, d, e, ring.object]);

    var a = ring.class("a", [b, c], {});
    deepEqual(a.__mro__, [a, b, c, d, e, f, ring.object]);
});

test("inherit", function() {
    var A = ring.class({
        x: function() { return 1; },
    });
    var B = ring.class([A], {
        y: function() { return 2; },
    });
    equal(new A().x(), 1);
    equal(new B().x(), 1);
    equal(new B().y(), 2);
    var C = ring.class([A], {
        x: function() { return 3; },
    });
    equal(new C().x(), 3);
    var D = ring.class([A], {
        x: function() { return this.$super() + 5; },
    });
    equal(new D().x(), 6);

});


if (typeof(exports) !== "undefined") { // nodejs
    _ = require("underscore");
}

test("base", function() {
    var C = ring.create({});
    deepEqual(C.__mro__, [C, ring.Object]);
});

test("mro", function() {
    var f = ring.create("f", [], {});
    deepEqual(f.__mro__, [f, ring.Object]);
    var e = ring.create("e", [], {});
    deepEqual(e.__mro__, [e, ring.Object]);
    var d = ring.create("d", [], {});
    deepEqual(d.__mro__, [d, ring.Object]);

    var c = ring.create("c", [d, f], {});
    deepEqual(c.__mro__, [c, d, f, ring.Object]);
    var b = ring.create("b", [d, e], {});
    deepEqual(b.__mro__, [b, d, e, ring.Object]);

    var a = ring.create("a", [b, c], {});
    deepEqual(a.__mro__, [a, b, c, d, e, f, ring.Object]);
});

test("inherit", function() {
    var A = ring.create({
        x: function() { return 1; }
    });
    var B = ring.create([A], {
        y: function() { return 2; }
    });
    equal(new A().x(), 1);
    equal(new B().x(), 1);
    equal(new B().y(), 2);
    var C = ring.create([A], {
        x: function() { return 3; }
    });
    equal(new C().x(), 3);
    var D = ring.create([A], {
        x: function() { return this.$super() + 5; }
    });
    equal(new D().x(), 6);
});

test("$init", function() {
    var A = ring.create({
        $init: function() {
            this.x = 3;
        }
    });
    equal(new A().x, 3);
});

test("instance", function() {
    var A = ring.create({});
    var B = ring.create([A], {});
    ok(ring.instance(new A(), A));
    ok(ring.instance(new B(), B));
    ok(ring.instance(new B(), A));
    ok(! ring.instance(new A(), B));

    ok(ring.instance([], Array));
    ok(! ring.instance([], A));
    ok(! ring.instance(new A(), Array));

    ok(ring.instance("", "string"));
    ok(ring.instance(function(){}, "function"));
    ok(ring.instance(2, "number"));
    ok(ring.instance({}, "object"));

});

test("$classInit", function() {
    var A = ring.create({
        $classInit: function(proto) {
            proto.x = 2;
        }
    });
    equal(new A().x, 2);
    var B = ring.create([A], {
        $classInit: function(proto) {
            proto.y = 3;
        }
    });
    equal(new B().x, 2);
    equal(new B().y, 3);
});

test("exceptions", function() {
    var hasStack = false;
    try {
        throw new Error("");
    } catch(e) {
        if (e.stack)
            hasStack = true;
    }
    try {
        throw new ring.Error("test");
    } catch(e) {
        equal(e.message, "test");
        equal(e.name, "ring.Error");
        if (hasStack)
            ok(e.stack.length > 0);
        ok(!!e.toString);
        ok(ring.instance(e, Error));
        ok(ring.instance(e, ring.Error));
    }

    try {
        throw new ring.ValueError("test");
    } catch(e) {
        equal(e.message, "test");
        equal(e.name, "ring.ValueError");
        if (hasStack)
            ok(e.stack.length > 0);
        ok(!!e.toString);
        ok(ring.instance(e, Error));
        ok(ring.instance(e, ring.Error));
        ok(ring.instance(e, ring.ValueError));
    }
});
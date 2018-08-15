
Tutorial
========

Installation
------------

Use npm to install Ring.js:

```sh
npm install ring
```

Then inside your program:

```javascript
var ring = require("ring");
```

Or if you don't use CommonJS:

```html
<script type="text/javascript" src="node_modules/lodash/lodash.js"></script>
<script type="text/javascript" src="node_modules/ring/ring.js"></script>
```

Declaring Classes
-----------------

The `ring.create()` function is used to declare new classes:

```javascript
var A = ring.create({
  saySomething: function() {
    return "hello world";
  },
});
var a = new A();
console.log(a.saySomething()); // prints "hello world" in the JavaScript console
```

`ring.create()` takes a dictionary as argument. The content of that dictionary will be added to the prototype of the
class.

Constructor
-----------

```javascript
var A = ring.create({
  constructor: function(name) {
    this.name = name;
  },
});
var a = new A("Nicolas");
console.log(a.name); // prints "Nicolas"
```

When the dictionary of properties given to `ring.create()` contains a method named `constructor`, that method will be
called during the object construction with the arguments given to the class when using `new`.

Inheritance
-----------

To inherit from one or multiple classes, add a list of the classes to inherit as an argument of `ring.create()` *before*
the properties dictionary.

```javascript
var A = ring.create({
  x: function() {
    return "x";
  },
});
var B = ring.create({
  y: function() {
    return "y";
  },
});

var C = ring.create([A, B], {});

var c = new C();
console.log(c.x()); // prints "x";
console.log(c.y()); // prints "y";
```

Diamond inheritance (ie: the classes B and C both inherit from A and the class D inherits from B *and* C) is allowed by
Ring.js.

Alternatively you can use the more classical `$extend` method:

```javascript
var A = ring.create({});

var B = A.$extend({});
```

Super Method
------------

To call the super method when overriding a method, use `this.$super()`. Pass arguments to `this.$super()` to forward
arguments if necessary.

```javascript
var A = ring.create({
    sayHello: function(name) {
        return "Hello " + name;
    },
});
var B = ring.create([A], {
    sayHello: function(name) {
        return this.$super(name) + ", nice to meet you";
    },
});

var b = new B();
console.log(b.sayHello("Nicolas")); // prints "Hello Nicolas, nice to meet you"
```

Testing the Class of an Object
------------------------------

The standard procedure in JavaScript to test if an object is an instance of a class is to use `instanceof`. But, due to
the implementation of inheritance in Ring.js (which is necessary to have multiple inheritance), `instanceof` can not
work properly.

So you should use `ring.instance()` instead.

```javascript
var A = ring.create({});
var B = ring.create([A], {});

console.log(ring.instance(new A(), A)); // prints "true"
console.log(ring.instance(new B(), A)); // prints "true"
```

`ring.instance(obj, type)` will return `true` if `obj` is an instance of `type` or an instance of a sub-class of `type`.

`ring.instance()` can also be used with classes and objects that do not use the Ring.js class system. It will use the
`instanceof` operator in that case. It means you can safely replace all the usages of `instanceof` in any programs by
`ring.instance()` without causing problems.

Additionally, `ring.instance()` can be used to test the type of basic data types in JavaScript. To do so, use a string
as second argument instead of a class. Example:

```javascript
console.log(ring.instance("", "string")); // prints "true"
console.log(ring.instance(function() {}, "function")); // prints "true"
```

Creation of New Exception Types
-------------------------------

To create new exception types you are supposed to inherit from the standard `Error` class. But inheriting from that
standard class can be hard. That's why Ring.js contains a feature to bring a solution to that:

```javascript
var MyError = ring.create([ring.Error], {
    name: "MyError",
});

try {
    throw new MyError("an error occured");
} catch(e) {
    console.log(ring.instance(e, Error)); // prints "true"
    console.log(ring.instance(e, ring.Error)); // prints "true"
    console.log(ring.instance(e, MyError)); // prints "true"
}
```

The `ring.Error` class is a special class using the Ring.js class system *but* it also inherits from the standard
`Error` class. You can create new exceptions classes inheriting from it and thus create complex exception hierarchies.

Please note the `name` property is a property of the standard `Error` class that can be useful for debugging. So all
exception classes should define one.

Compatibility with other class systems
--------------------------------------

With Ring.js, since version 2, it is possible to inherit from a class created with any other class system. Example
with a Backbone model:

```javascript
var A = Backbone.Model.extend({
    initialize: function() {
        this.a = "a";
    }
});
var B = ring.create([A], {
    constructor: function() {
        this.$super();
    }
});
```

Inheriting from a non-Ring class uses the same syntax than with a Ring class. `this.$super` is usable as always. When
overriding the constructor method, simply define a `constructor` function like you would with a normal Ring class.
To call the original implementation of the constructor, use the usual `this.$super`. It doesn't matter if you are
using a class system that uses another name for the constructor, like `initialize`, `init` or whatever. Just use
`constructor` and `this.$super()` like usual and Ring.js will do the rest.

Also note that, in the above example, `new B() instanceof A` will return `false`. `instanceof` still doesn't work in
this case so you should use `ring.instance()` instead.

Inheriting from a non-Ring class has some limitations. We could mostly resume it by saying that Ring does not "see"
the inheritance in other classes. Example:

```javascript
var A = ... some non-Ring class ...
var B = ... some non-Ring class inheriting from A ...

var C = ring.create([B], {...});
```

Instances of C will work as expected in this example. But still, ring doesn't understand the relation between `A` and
`B`, and `ring.instance(new C(), A)` will return `false` while `ring.instance(new C(), B)` return `true`.

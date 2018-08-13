---
---

Ring.js is a class system in JavaScript allowing multiple inheritance.

```javascript
var Human = ring.create({
  talk: function() {
    return "hello";
  },
});

var Spider = ring.create({
  climb: function() {
    return "climbing";
  },
});

var SpiderMan = ring.create([Spider, Human], {
  talk: function() {
    return this.$super() + ", my name is Peter Parker";
  }
});

var spiderman = new SpiderMan();
console.log(spiderman.talk());
```

Its advantages:

* Stop fighting against JavaScript prototype-based object oriented system. Use a class system like
  you would in Java, Python, or basically any well-known language.
* Available in the browser or in node.js. Also works with require.js.
* The inheritance system is inspired by Python, one of the best multiple inheritance system ever.
* Provides compatibility with other JavaScript class systems, like CoffeeScript or Backbone.
* Licensed under the MIT license.
* Damn, multiple inheritance just rocks!

To get started, [read the tutorial](./docs/tutorial.html).

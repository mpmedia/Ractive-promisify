Ractive-promisify
=================

A few operations with [Ractive.js](http://ractivejs.org) can be asynchronous - the initial render, plus `set()`, `animate()`, `update()` and `teardown()`.

They're asynchronous if they cause one or more [transitions](https://github.com/Rich-Harris/Ractive/wiki/Transitions) that are themselves asynchronous. In these cases, you often want to execute some code once the operation is complete.

Normally, you achieve this by passing a *callback*, e.g. `ractive.set( 'foo', bar, doSomething )`. But this can get unwieldy when you're trying to chain lots of operations together in a complex fashion.

Because of these situations, in recent years '[promises](http://promises-aplus.github.io/promises-spec/)' (and deferreds, which are similar) have become increasingly popular. **Ractive.js** doesn't support promises 'out of the box' because there are so many different implementations, but it's easy to make it work with your promise library of choice.

See the examples in this repo for more information.


Contributing
------------

If you want to see a particular promises/deferreds library represented here, submit a pull request! Copy one of the existing example folders, replace the library, edit the `Ractive-promisify.js` so that it works with said library, then make any necessary alterations to the `index.html` file. 


License
-------

Released under an MIT license.
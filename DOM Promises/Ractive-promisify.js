(function ( global ) {

	'use strict';

	var factory, property;

	factory = function ( Ractive ) {

		// This all works by replacing the base Ractive class with a subclass that wraps
		// the async-able methods
		var Promisified = Ractive.extend({

			// We need to create a promise that represents the state of the initial
			// render, so that we can add handlers to it via a `then` method
			beforeInit: function ( options ) {
				var complete = options.complete;

				// We're using the DOM Promises polyfill (https://github.com/slightlyoff/Promises)
				// since it's the closest thing we have to an actual standard
				// http://dom.spec.whatwg.org/#promises)
				this.renderPromise = new Promise( function ( resolver ) {
					options.complete = resolver.resolve;
				});

				// If a `complete` function was passed in as an initialisation option, add it
				// to the promise
				if ( complete ) {
					this.renderPromise.then( complete );
				}
			},

			// We overwrite the `set`, `animate`, `teardown` and `update` methods so that they return
			// promises. This is possible because Ractive.extend() allows you to use this._super
			// to call the overwritten method. They all follow the same basic pattern:

			set: function ( keypath, value, complete ) {
				var self = this, promise;

				// Accommodate either ractive.set( keypath, value, complete ) or
				// ractive.set( map, complete )
				if ( typeof keypath === 'object' ) {
					complete = value;
				}

				promise = new Promise( function ( resolver ) {
					if ( typeof keypath === 'object' ) {
						self._super( keypath, resolver.resolve );
					} else {
						self._super( keypath, value, resolver.resolve );
					}
				});

				if ( complete ) {
					promise.then( complete );
				}

				return promise;
			},

			animate: function ( keypath, value, options ) {
				var self = this, promise, complete;

				if ( typeof keypath === 'object' ) {
					options = value;
				}

				if ( !options ) {
					options = {};
				}

				complete = options.complete;

				promise = new Promise( function ( resolver ) {
					options.complete = resolver.resolve;

					if ( typeof keypath === 'object' ) {
						self._super( keypath, options );
					} else {
						self._super( keypath, value, options );
					}
				});

				if ( complete ) {
					promise.then( complete );
				}

				return promise;
			},

			update: function ( keypath, complete ) {
				var self = this, promise;

				if ( typeof keypath === 'function' ) {
					complete = keypath;
					keypath = '';
				}

				promise = new Promise( function ( resolver ) {
					self._super( keypath, resolver.resolve );
				});

				if ( complete ) {
					promise.then( complete );
				}

				return promise;
			},

			teardown: function ( complete ) {
				var self = this, promise;

				promise = new Promise( function ( resolver ) {
					self._super( resolver.resolve );
				});

				if ( complete ) {
					promise.then( complete );
				}

				return promise;
			},

			// We also add a ractive.then() method which maps to the renderPromise
			// created earlier

			then: function ( callback ) {
				return this.renderPromise.then( callback );
			}

		});

		// Add all the static methods and properties from the original
		for ( property in Ractive ) {
			if ( Ractive.hasOwnProperty( property ) ) {
				Promisified[ property ] = Ractive[ property ];
			}
		}

		return Promisified;

	};

	// Export as AMD module. You may need to tweak this for your project - the original Ractive
	// module is anonymous, so you may need to change it to 
	//
	//     define([ 'js/lib/Ractive' ], factory );
	//
	// or whatever, depending on how your project is structured.
	//
	// It's recommended that you edit your AMD paths config, so that require( 'Ractive' )
	// returns the promisified version rather than the original
	if ( typeof define !== 'undefined' && define.amd ) {
		define([ 'Ractive' ], factory );
	}

	// If you're not using AMD, we just overwrite the global Ractive variable
	else {
		global.Ractive = factory( global.Ractive );
	}

}( this ));
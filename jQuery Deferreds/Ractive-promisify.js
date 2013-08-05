(function ( global ) {

	'use strict';

	var factory, property;

	factory = function ( Ractive ) {

		// This all works by replacing the base Ractive class with a subclass that wraps
		// the async-able methods
		var Promisified = Ractive.extend({

			// We need to create a deferred that represents the state of the initial
			// render, so that we can add handlers to it via a `then` method
			beforeInit: function ( options ) {
				var complete = options.complete;

				this.renderDeferred = new $.Deferred();
				options.complete = this.renderDeferred.resolve;

				// If a `complete` function was passed in as an initialisation option, add it
				// to the promise
				if ( complete ) {
					this.renderDeferred.then( complete );
				}
			},

			// We overwrite the `set`, `animate`, `teardown` and `update` methods so that they return
			// deferreds. This is possible because Ractive.extend() allows you to use this._super
			// to call the overwritten method. They all follow the same basic pattern:

			set: function ( keypath, value, complete ) {
				var self = this, deferred;

				deferred = new $.Deferred();

				// Accommodate either ractive.set( keypath, value, complete ) or
				// ractive.set( map, complete )
				if ( typeof keypath === 'object' ) {
					complete = value;

					this._super( keypath, deferred.resolve );
				} else {
					this._super( keypath, value, deferred.resolve );
				}

				if ( complete ) {
					deferred.then( complete );
				}

				return deferred;
			},

			animate: function ( keypath, value, options ) {
				var self = this, deferred, complete;

				deferred = new $.Deferred();

				if ( typeof keypath === 'object' ) {
					options = value;
				}

				if ( !options ) {
					options = {};
				}

				complete = options.complete;
				options.complete = deferred.resolve;

				if ( typeof keypath === 'object' ) {
					this._super( keypath, options );
				} else {
					this._super( keypath, value, options );
				}

				if ( complete ) {
					deferred.then( complete );
				}

				return deferred;
			},

			update: function ( keypath, complete ) {
				var self = this, deferred;

				deferred = new $.Deferred();

				if ( typeof keypath === 'function' ) {
					complete = keypath;
					keypath = '';
				}

				this._super( keypath, deferred.resolve );

				if ( complete ) {
					deferred.then( complete );
				}

				return deferred;
			},

			teardown: function ( complete ) {
				var self = this, deferred;

				deferred = new $.Deferred();

				this._super( deferred.resolve );

				if ( complete ) {
					deferred.then( complete );
				}

				return deferred;
			},

			// We also add a ractive.then() method which maps to the renderDeferred
			// created earlier

			then: function ( callback ) {
				return this.renderDeferred.then( callback );
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
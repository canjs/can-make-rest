/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-make-rest@0.0.0#can-make-rest*/
define('can-make-rest', function (require, exports, module) {
    var each = require('can-util/js/each/each');
    var methodMapping = {
        item: {
            'GET': 'getData',
            'PUT': 'updateData',
            'DELETE': 'destroyData'
        },
        list: {
            'GET': 'getListData',
            'POST': 'createData'
        }
    };
    function inferIdProp(url) {
        var wrappedInBraces = /\{(.*)\}/;
        var matches = url.match(wrappedInBraces);
        var isUniqueMatch = matches && matches.length === 2;
        if (isUniqueMatch) {
            return matches[1];
        }
    }
    function getItemAndListUrls(url, idProp) {
        idProp = idProp || inferIdProp(url) || 'id';
        var itemRegex = new RegExp('\\/\\{' + idProp + '\\}.*');
        var rootIsItemUrl = itemRegex.test(url);
        var listUrl = rootIsItemUrl ? url.replace(itemRegex, '') : url;
        var itemUrl = rootIsItemUrl ? url : url.trim() + '/{' + idProp + '}';
        return {
            item: itemUrl,
            list: listUrl
        };
    }
    module.exports = function (url, idProp) {
        var data = {};
        each(getItemAndListUrls(url, idProp), function (url, type) {
            each(methodMapping[type], function (interfaceMethod, method) {
                data[interfaceMethod] = {
                    method: method,
                    url: url
                };
            });
        });
        return data;
    };
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();
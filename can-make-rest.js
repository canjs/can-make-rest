var each = require("can-util/js/each/each");

var methodMapping = {
	item: {
		'GET': 'getData',
		'PUT': 'updateData',
		'DELETE': 'destroyData',
	},
	list: {
		'GET': 'getListData',
		'POST': 'createData'
	}
};


function inferIdProp (url) {
	var wrappedInBraces = /\{(.*)\}/;
	var matches = url.match(wrappedInBraces);
	var isUniqueMatch = matches && matches.length === 2;
	if (isUniqueMatch) {
		return matches[1];
	}
}

function getItemAndListUrls (url, idProp) {
	idProp = idProp || inferIdProp(url) || "id";
	var itemRegex = new RegExp('\\/\\{' + idProp+"\\}.*" );
	var rootIsItemUrl = itemRegex.test(url);
	var listUrl = rootIsItemUrl ? url.replace(itemRegex, "") : url;
	var itemUrl = rootIsItemUrl ? url : (url.trim() + "/{" + idProp + "}");
	return {item: itemUrl, list: listUrl};
}



module.exports = function(url, idProp){
	var data= {};
	each( getItemAndListUrls(url, idProp), function(url, type){
		each(methodMapping[type], function(interfaceMethod, method){
			data[interfaceMethod] = {
				method: method,
				url: url
			};
		});
	});
	return data;
};

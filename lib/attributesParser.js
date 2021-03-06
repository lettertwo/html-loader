/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var Parser = require("./fastparse");

var parser = new Parser({
	outside: {
		"<!--.*?-->": true,
		"<![CDATA[.*?]]>": true,
		"<[!\\?].*?>": true,
		"<\/[^>]+>": true,
		"<([a-zA-Z\\-:]+)\\s*": function(match, tagName) {
			this.currentTag = tagName;
			return "inside";
		},
		"[^<]+": true
	},
	inside: {
		"\\s+": true, // eat up whitespace
		">": "outside", // end of attributes
		"(([a-zA-Z\\-]+)\\s*=\\s*\")([^\"]*)\"": function(match, strUntilValue, name, value, index) {
			if(!this.isRelevantTagAttr(this.currentTag, name)) return;
			this.results.push({
				start: index + strUntilValue.length,
				length: value.length,
				value: value
			});
		},
		"(([a-zA-Z\\-]+)\\s*=\\s*)([^\\s>]+)": function(match, strUntilValue, name, value, index) {
			if(!this.isRelevantTagAttr(this.currentTag, name)) return;
			this.results.push({
				start: index + strUntilValue.length,
				length: value.length,
				value: value
			});
		},
		"[a-zA-Z\-]+": true, // attribute without value
		"[^>]+": true // catch parsing errors
	}
});


module.exports = function parse(html, isRelevantTagAttr) {
	return parser.parse("outside", html, {
		currentTag: null,
		results: [],
		isRelevantTagAttr: isRelevantTagAttr
	}).results;
};
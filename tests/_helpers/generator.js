(function(module) {
	
	"use strict";

	var Buttercup = require(__dirname + "/../../source/module.js"),
		Archive = Buttercup.Archive,
		searching = require(GLOBAL.root + "/tools/searching.js"),
		encoding = require(GLOBAL.root + "/tools/encoding.js");

	// action setup
	var _ACTIONS = {
			"new-entry": 		8,
			"new-group": 		4,
			"delete-entry": 	2,
			"delete-group": 	1,
			"move-entry": 		2,
			"move-group": 		1,
			"set-prop": 		15,
			"set-meta": 		12
		},
		ACTIONS = [],
		ACTIONS_COUNT;
	for (var actionName in _ACTIONS) {
		if (_ACTIONS.hasOwnProperty(actionName)) {
			for (var i = 0; i < _ACTIONS[actionName]; i += 1) {
				ACTIONS.push(actionName);
			}
		}
	}
	ACTIONS_COUNT = ACTIONS.length;

	/**
	 * Generate a random command
	 * @param {Object} dataset The internal dataset that a Westley instance uses
	 * @returns {String}
	 * @private
	 */
	function getRandomCommand(dataset) {
		var randIndex = getRandomIndex(ACTIONS_COUNT),
			action = ACTIONS[randIndex],
			groupID,
			entryID,
			targetID;
		if (action === "new-entry") {
			groupID = getRandomGroupID(dataset, false);
			if (groupID) {
				entryID = encoding.getUniqueID();
				return "cen " + groupID + " " + entryID;
			}
		} else if (action === "new-group") {
			targetID = 0;
			groupID = encoding.getUniqueID();
			targetID = getRandomGroupID(dataset, true);
			return "cgr " + targetID + " " + groupID;
		} else if (action === "delete-entry") {
			entryID = getRandomEntryID(dataset);
			if (entryID) {
				return "den " + entryID;
			}
		} else if (action === "delete-group") {
			groupID = getRandomGroupID(dataset, false);
			if (groupID) {
				return "dgr " + groupID;
			}
		} else if (action === "move-entry") {
			entryID = getRandomEntryID(dataset);
			groupID = getRandomGroupID(dataset);
			if (entryID && groupID) {
				return "men " + entryID + " " + groupID;
			}
		} else if (action === "move-group") {
			groupID = getRandomGroupID(dataset);
			targetID = getRandomGroupID(dataset);
			if (groupID && targetID && groupID !== targetID) {
				return "mgr " + groupID + " " + targetID;
			}
		} else if (action === "set-prop") {
			entryID = getRandomEntryID(dataset);
			var mode = getRandomIndex(3),
				setPropType;
			if (entryID) {
				if (mode === 0) {
					setPropType = "title";
				} else if (mode === 1) {
					setPropType = "username";
				} else {
					setPropType = "password";
				}
				return "sep " + entryID + " " + setPropType + " \"" + getRandomValue() + "\"";
			}
		} else if (action === "set-meta") {
			entryID = getRandomEntryID(dataset);
			if (entryID) {
				return "sem " + entryID + " \"" + getRandomKey() + "\" \"" + getRandomValue() + "\"";
			}
		}
		return false;
	}

	/**
	 * Get a random entry ID from the current dataset
	 * @param {Object} dataset
	 * @returns {String|Boolean} An ID on success, false on failure
	 * @private
	 */
	function getRandomEntryID(dataset) {
		var entryIDs = [];
		(function collectGroupIDs(groups) {
			var gCount = groups.length,
				eCount;
			for (var g = 0; g < gCount; g += 1) {
				eCount = (groups[g].entries || []).length;
				for (var e = 0; e < eCount; e += 1) {
					entryIDs.push(groups[g].entries[e].id);
				}
			}
		})(dataset.groups || []);
		return entryIDs.length > 0 ? entryIDs[getRandomIndex(entryIDs.length)] : false;
	}

	/**
	 * Get a random group ID
	 * @param {Object} dataset
	 * @param {Boolean=} includeRoot
	 * @returns {String|Boolean} An ID on success, false on failure
	 * @private
	 */
	function getRandomGroupID(dataset, includeRoot) {
		var groupIDs = includeRoot ? [0] : [];
		(function collectGroupIDs(groups) {
			var gCount = groups.length;
			for (var i = 0; i < gCount; i += 1) {
				groupIDs.push(groups[i].id);
			}
		})(dataset.groups || []);
		return groupIDs.length > 0 ? groupIDs[getRandomIndex(groupIDs.length)] : false;
	}

	/**
	 * Get a random index. Given a `len` of 3, the return value would be between 0 and 2 inclusive.
	 * @param {Number} len Length/Count
	 * @returns {Number}
	 * @private
	 */
	function getRandomIndex(len) {
		return Math.floor(Math.random() * len);
	}

	/**
	 * Get a random property key
	 * @returns {String}
	 * @private
	 */
	function getRandomKey() {
		return getRandomString(12, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 _");
	}

	/**
	 * Get a random string
	 * @param {Number} length The length of the string to generate
	 * @param {String} chars A string of characters to use
	 * @returns {String}
	 * @private
	 */
	function getRandomString(length, chars) {
		var result = '';
		for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}

	/**
	 * Get a random property value
	 * @returns {String}
	 * @private
	 */
	function getRandomValue() {
		return getRandomString(32, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" +
			"!@#$%^&*()_+-={}[]|\\;':\",.<>/?`~");
	}

	/**
	 * Generate an archive
	 * @param {Number} numActions Number of "actions" to perform
	 * @param {Archive=} archive
	 * @returns {Archive}
	 * @public
	 * @type {Function}
	 */
	module.exports = function generate(numActions, archive) {
		archive = archive || new Archive();
		var westley = archive._getWestley(),
			command;
		while (numActions > 0) {
			command = getRandomCommand(westley.getDataset());
			if (command) {
				westley
					.execute(command)
					.pad();
				numActions -= 1;
			}
		}
		return archive;
	};

})(module);

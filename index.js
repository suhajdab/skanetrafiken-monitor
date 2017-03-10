const skanetrafiken = require('node-skanetrafiken');
var API = {},
    subscriptions = [];

	/**
	 * XML structure
	 *  <RealTime>
	 * 		<RealTimeInfo>
	 * 			<DepTimeDeviation>0</DepTimeDeviation>
	 * 		 	<DepDeviationAffect>NONE</DepDeviationAffect>
	 * 	   </RealTimeInfo>
	 * 	</RealTime>
	 *
	 *  DepDeviationAffect: NONE | NON_CRITICAL | CRITICAL
	 */

// PRIVATE
function cleanupResults(res) {
    var o = {};
    for (var k in res) {
        if (k == 'JourneyDateTime') {
            o[k] = new Date(res[k][0]);
		} else if (k == 'RealTime' && res[k][0] != '') { // lets remove a couple levels of complexity
			o[k] = res[k][0].RealTimeInfo.map(cleanupResults)[0];
        } else {
            o[k] = res[k][0];
        }
    }
    return o;
}

function filterResults(res) {
	if (res.No != this.no || res.Towards != this.towards) return false;
	return true;
}

function onGotDepartures(deps) {
	console.log('opts', this);
	var relevant = deps.map(cleanupResults).filter(filterResults, this);
	console.log('relevant', relevant);
}

// API
/**
 * [subscribe description]
 * @param  {Object} opts subscription options
 * @param  {Number} opts.stopId id of station from skanetrafiken api
 * @param  {Number} opts.no line number from skanetrafiken api
 * @param  {String} opts.towards direction of departure
 * @return {Number}      subscription id
 */
API.subscribe = function(opts) {
	// required: stop, line, time, towards
	// optional: margin (=5min), deviation (=critical)
	skanetrafiken.getDepartures({stopID: opts.stopId}, onGotDepartures.bind(opts));
    return subscriptions.length;
}


API.unsubscribe = function(id) {
	return true;
}

module.exports = API;

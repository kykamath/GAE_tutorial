/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


var ObjectsFromMemcache = {
	locations : null,
	locations_in_order_of_influence_spread : null,
	charts_data: null, 
	LoadLocations : function(callback_function, parameter) {
		$.getJSON("/locations", {}, function(data) {
			ObjectsFromMemcache.locations = data;
			callback_function(parameter);
		});
	},
	LoadLocationsInOrderOfInfluenceSpread : function() {
		$.getJSON("/locations_in_order_of_influence_spread", {}, function(data) {
			ObjectsFromMemcache.locations_in_order_of_influence_spread = data;
		});
	},
	GetLocations : function(hashtag_id) {
		return this.locations[hashtag_id];
	},
	GetLocationsInOrderOfInfluenceSpread : function(hashtag_id) {
		return this.locations_in_order_of_influence_spread[hashtag_id];
	}
}

var HashtagsMenu = {
	Init : function() {
		$('select#hashtags').selectmenu({
			maxHeight : 150,
			style : 'dropdown'
		}).change(function() {
			PropagationAnalysis.SpreadPath.StopPlot();
			GlobalSpread.Plot(this.value);
		});
	}
}

var GlobalSpread = {
	Init : function() {
		$('#tabs').tabs();
		$('#map_canvas').gmap();
		var hashtag_id = $('select#hashtags').val();
		if(hashtag_id != "None") {
			// Memcache has valid data as hashtags are loaded in menu. Now load data structures.
			// Load locations from memcache.
			ObjectsFromMemcache.LoadLocations(GlobalSpread.Plot, hashtag_id)
			// Load locations_in_order_of_influence_spread from memcache.
			ObjectsFromMemcache.LoadLocationsInOrderOfInfluenceSpread();
		} else {
			// Memcache doesn't have valid data as hashtags are not loaded in menu.
			// Show a dialog displaying the issue.
			$("#dialog:ui-dialog").dialog("destroy");
			$("#dialog-message").css('visibility', 'visible');
			$("#dialog-message").dialog({
				modal : true,
				buttons : {
					Ok : function() {
						$(this).dialog("close");
						$("#dialog-message").css('visibility', 'hidden');
					}
				}
			});
		}
	},
	Plot : function(hashtag_id) {
		locations_for_hashtag = ObjectsFromMemcache.GetLocations(hashtag_id);
		$('#map_canvas').gmap('clear', 'markers');
		var mark_clusterter = $('#map_canvas').gmap('get', 'MarkerClusterer');
		if(mark_clusterter != null) {
			mark_clusterter.clearMarkers();
		}
		$.each(locations_for_hashtag, function(index, location) {
			$('#map_canvas').gmap('addMarker',
			// {'position': location, 'bounds': true, 'icon': 'http://maps.google.com/mapfiles/kml/paddle/pink-blank.png'}
			{
				'position' : location,
				'bounds' : true
			})
		});
		$('#map_canvas').gmap('set', 'MarkerClusterer', new MarkerClusterer($('#map_canvas').gmap('get', 'map'), $('#map_canvas').gmap('get', 'markers')));
	}
}

function Timeout(fn, interval, scope, args) {
	scope = scope || window;
	this.fn = fn;
	this.interval = interval;
	var self = this;
	var wrap = function() {
		self.clear();
		fn.apply(scope, args || arguments);
	}
	this.id = setTimeout(wrap, interval);
}

Timeout.prototype.id = null
Timeout.prototype.cleared = false;
Timeout.prototype.clear = function() {
	clearTimeout(this.id);
	this.cleared = true;
	this.id = null;
};

var PropagationAnalysis = {
	loaded_tabs : [],
	Init : function() {
		$('#tabs2').tabs({
			show : function(event, ui) {
				if($.inArray(ui.index, PropagationAnalysis.loaded_tabs) == -1) {
					PropagationAnalysis.loaded_tabs.push(ui.index);
					switch (ui.index) {
						case 0:
							PropagationAnalysis.loaded_tabs.push(ui.index);
							PropagationAnalysis.SpreadPath.Init();
							break;
						case 1:
							// alert('loading ' + ui.index);
							break;
						default:
							console.log();
					}
				}
			}
		});
	},
	SpreadPath : {
		MARKER_DROP_TIME_LAG : 1000,
		intervals_for_marker_on_spread_path : [],
		Init : function() {
			$('#map_path').gmap3({
				action : 'init',
				options : {
					zoom : 3
				},
			});
			PropagationAnalysis.SpreadPath.Buttons.Init();
		},
		Buttons : {
			TogglePlayPauseButtons : function() {
				var disabled = $("#draw_spread_path_button").button("option", "disabled");
				// Stop button can always be used except immediately after it is clicked.
				// Play and pause toggle.
				$("#stop_spread_path_button").button("option", "disabled", false);
				if(disabled) {
					$("#draw_spread_path_button").button("option", "disabled", false);
					$("#pause_spread_path_button").button("option", "disabled", true);
				} else {
					$("#draw_spread_path_button").button("option", "disabled", true);
					$("#pause_spread_path_button").button("option", "disabled", false);
				}
			},
			Hide : function() {
				alert('hide buttons');
			},
			InitPlayButton : function() {
				$("#draw_spread_path_button").button({
					icons : {
						primary : "ui-icon-play"
					},
					disabled : false,
				}).click(function() {
					var restart_label = 'Re-start';
					PropagationAnalysis.SpreadPath.Buttons.TogglePlayPauseButtons();
					var current_label = $("#draw_spread_path_button").button("option", "label");
					if(current_label == restart_label) {
						PropagationAnalysis.SpreadPath.ReStartPlot();
					} else {
						$("#draw_spread_path_button").button("option", "label", restart_label);
						PropagationAnalysis.SpreadPath.StartPlot();
					}
				});
			},

			InitPauseButton : function() {
				$("#pause_spread_path_button").button({
					icons : {
						primary : "ui-icon-pause"
					},
					disabled : true,
				}).click(function() {
					PropagationAnalysis.SpreadPath.Buttons.TogglePlayPauseButtons();
					PropagationAnalysis.SpreadPath.PausePlot();
				});
			},

			InitStopButton : function() {
				$("#stop_spread_path_button").button({
					icons : {
						primary : "ui-icon-stop"
					},
					disabled : true,
				}).click(function() {
					PropagationAnalysis.SpreadPath.StopPlot();
				});
			},
			Init : function() {
				this.InitPlayButton();
				this.InitPauseButton();
				this.InitStopButton();
			},
			EndState : function() {
				$("#draw_spread_path_button").button("option", "disabled", false);
				$("#pause_spread_path_button").button("option", "disabled", true);
				$("#stop_spread_path_button").button("option", "disabled", true);
				$("#draw_spread_path_button").button("option", "label", 'Start');
			}
		},
		StartPlot : function() {
			var hashtag_id = $('select#hashtags').val();
			path_for_hashtag = ObjectsFromMemcache.GetLocationsInOrderOfInfluenceSpread(hashtag_id);
			var iteration_counter = 0;
			var spread_path_queue = $('#queue');
			$('#map_path').gmap3({
				action : 'clear'
			});
			PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path = [];
			$.each(path_for_hashtag, function(index, co_ordinates) {
				spread_path_queue.queue(function() {
					PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path.push(new Timeout(function() {
						$('#map_path').gmap3({
							action : 'addMarker',
							latLng : [co_ordinates[0], co_ordinates[1]],
							options : {
								animation : google.maps.Animation.DROP
							},
							callback : function(marker) {
								$('#map_path').gmap3({
									action : 'panTo',
									args : [marker.position]
								});
							},
						});
					}, iteration_counter * PropagationAnalysis.SpreadPath.MARKER_DROP_TIME_LAG));
					iteration_counter += 1
					$(this).dequeue();
				});
			});
			spread_path_queue.queue(function() {
				PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path.push(new Timeout(
					PropagationAnalysis.SpreadPath.Buttons.EndState, 
					iteration_counter * PropagationAnalysis.SpreadPath.MARKER_DROP_TIME_LAG
					));
				$(this).dequeue();
			});
		},
		ReStartPlot : function() {
			var intervals_for_marker_on_spread_path = [];
			$.each(PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path, function(index, tuo_fn_and_interval) {
				intervals_for_marker_on_spread_path.push(new Timeout(tuo_fn_and_interval[0], tuo_fn_and_interval[1]));
			})
			PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path = intervals_for_marker_on_spread_path;
		},
		PausePlot : function() {
			var uncleared_intervals_for_marker_on_spread_path = []
			var no_of_cleared = 0;
			$.each(PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path, function(index, interval) {
				if(interval.cleared == false) {
					var tuo_fn_and_interval = [interval.fn, interval.interval - (no_of_cleared * PropagationAnalysis.SpreadPath.MARKER_DROP_TIME_LAG)];
					uncleared_intervals_for_marker_on_spread_path.push(tuo_fn_and_interval);
				} else {
					no_of_cleared += 1;
				}
				interval.clear();
			});
			PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path = uncleared_intervals_for_marker_on_spread_path;
		},
		StopPlot : function() {
			PropagationAnalysis.SpreadPath.Buttons.EndState();
			$.each(PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path, function(index, interval) {
				if($.isArray(interval) == false) {
					interval.clear();
				}
			});
			PropagationAnalysis.SpreadPath.intervals_for_marker_on_spread_path = []
			$('#map_path').gmap3({
				action : 'clear'
			});
		},
	},
}

$(document).ready(function() {
	// Init hashtags menu
	HashtagsMenu.Init();

	// 	Init global spread map
	GlobalSpread.Init();

	// 	Init spread path map
	PropagationAnalysis.Init();
});


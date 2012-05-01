var ObjectsFromMemcache = {
	locations : null,
	locations_in_order_of_influence_spread : null,
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
			SpreadPath.StopPlot();
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
// Modified a wrapper for setTimeout written by user
// Reid (http://stackoverflow.com/users/236139/reid)
// or stackoverflow (http://stackoverflow.com/questions/5226578/check-if-a-timeout-has-been-cleared).
// function Timeout(fn, interval) {
// var id = setTimeout(fn, interval);
// this.cleared = false;
// this.fn = fn;
// this.interval = interval;
// this.clear = function() {
// this.cleared = true;
// clearTimeout(id);
// };
// }
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

var SpreadPath = {
	MARKER_DROP_TIME_LAG : 1000,
	intervals_for_marker_on_spread_path : [],
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

		InitPlayButton : function() {
			$("#draw_spread_path_button").button({
				icons : {
					primary : "ui-icon-play"
				},
				disabled : false,
			}).click(function() {
				var restart_label = 'Re-start';
				SpreadPath.Buttons.TogglePlayPauseButtons();
				var current_label = $("#draw_spread_path_button").button("option", "label");
				if(current_label == restart_label) {
					SpreadPath.ReStartPlot();
				} else {
					$("#draw_spread_path_button").button("option", "label", restart_label);
					SpreadPath.StartPlot();
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
				SpreadPath.Buttons.TogglePlayPauseButtons();
				SpreadPath.PausePlot();
			});
		},

		InitStopButton : function() {
			$("#stop_spread_path_button").button({
				icons : {
					primary : "ui-icon-stop"
				},
				disabled : true,
			}).click(function() {
				SpreadPath.StopPlot();
			});
		},
		Init : function() {
			this.InitPlayButton();
			this.InitPauseButton();
			this.InitStopButton();
		}
	},
	Init : function() {
		$('#tabs2').tabs();
		$('#map_path').gmap3({
			action : 'init',
			options : {
				zoom : 3
			},
		});
		SpreadPath.Buttons.Init();
	},
	StartPlot : function() {
		var hashtag_id = $('select#hashtags').val();
		path_for_hashtag = ObjectsFromMemcache.GetLocationsInOrderOfInfluenceSpread(hashtag_id);
		var iteration_counter = 0;
		var spread_path_queue = $('#queue');
		$('#map_path').gmap3({
			action : 'clear'
		});
		SpreadPath.intervals_for_marker_on_spread_path = [];
		$.each(path_for_hashtag, function(index, co_ordinates) {
			spread_path_queue.queue(function() {
				SpreadPath.intervals_for_marker_on_spread_path.push(new Timeout(function() {
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
				}, iteration_counter * SpreadPath.MARKER_DROP_TIME_LAG));
				iteration_counter += 1
				$(this).dequeue();
			});
		});
	},
	ReStartPlot : function() {
		var intervals_for_marker_on_spread_path = [];
		$.each(SpreadPath.intervals_for_marker_on_spread_path, function(index, tuo_fn_and_interval) {
			intervals_for_marker_on_spread_path.push(new Timeout(tuo_fn_and_interval[0], tuo_fn_and_interval[1]));
		})
		SpreadPath.intervals_for_marker_on_spread_path = intervals_for_marker_on_spread_path;
	},
	PausePlot : function() {
		var uncleared_intervals_for_marker_on_spread_path = []
		var no_of_cleared = 0;
		// console.log('before ' + SpreadPath.intervals_for_marker_on_spread_path.length);
		$.each(SpreadPath.intervals_for_marker_on_spread_path, function(index, interval) {
			if(interval.cleared == false) {
				var tuo_fn_and_interval = [interval.fn, interval.interval - (no_of_cleared * SpreadPath.MARKER_DROP_TIME_LAG)];
				uncleared_intervals_for_marker_on_spread_path.push(tuo_fn_and_interval);
			} else {
				no_of_cleared += 1;
			}
			interval.clear();
		});
		SpreadPath.intervals_for_marker_on_spread_path = uncleared_intervals_for_marker_on_spread_path;
		// console.log('after ' + SpreadPath.intervals_for_marker_on_spread_path.length);
		// console.log('difference ' + count);
		// console.log();
	},
	StopPlot : function() {
		$("#draw_spread_path_button").button("option", "disabled", false);
		$("#pause_spread_path_button").button("option", "disabled", true);
		$("#stop_spread_path_button").button("option", "disabled", true);
		$("#draw_spread_path_button").button("option", "label", 'Start');
		$.each(SpreadPath.intervals_for_marker_on_spread_path, function(index, interval) {
			if($.isArray(interval)==false) {
				interval.clear();
			}
		});
		SpreadPath.intervals_for_marker_on_spread_path = []
		$('#map_path').gmap3({
			action : 'clear'
		});
	},
}

$(document).ready(function() {
	// Init hashtags menu
	HashtagsMenu.Init();

	// 	Init global spread map
	GlobalSpread.Init();

	// 	Init spread path map
	SpreadPath.Init();
});


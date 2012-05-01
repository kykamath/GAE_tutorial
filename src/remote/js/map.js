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

var SpreadPath = {
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
				$("#draw_spread_path_button").button("option", "label", 'Re-start');
				SpreadPath.Buttons.TogglePlayPauseButtons();
				SpreadPath.StartPlot();
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
				SpreadPath.intervals_for_marker_on_spread_path.push(setTimeout(function() {
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
				}, iteration_counter * 1000));
				iteration_counter += 1
				$(this).dequeue();
			});
		});
	},
	StopPlot : function() {
		$.each(SpreadPath.intervals_for_marker_on_spread_path, function(index, interval) {
			clearTimeout(interval);
		});
		SpreadPath.intervals_for_marker_on_spread_path = []
		$('#map_path').gmap3({
			action : 'clear'
		});
		$("#stop_spread_path_button").button("option", "disabled", true);
		$("#draw_spread_path_button").button("option", "disabled", false);
		$("#pause_spread_path_button").button("option", "disabled", true);
		$("#draw_spread_path_button").button("option", "label", 'Start');
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


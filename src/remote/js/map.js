var locations = null;
var locations_in_order_of_influence_spread = null;

function PlotGlobalSpreadOnMap(hashtag_id) {
	locations_for_hashtag = locations[hashtag_id];
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

function GetLatLngFromLatLngStr(str_lat_lon) {
	var result_of_split = str_lat_lon.split(',');
	result_of_split[0] = parseFloat(result_of_split[0]);
	result_of_split[1] = parseFloat(result_of_split[1]);
	return result_of_split
}

var PlotSpreadPathOnMap = {
	intervals_for_marker_on_spread_path : [],
	Start : function() {
		var hashtag_id = $('select#hashtags').val();
		path_for_hashtag = locations_in_order_of_influence_spread[hashtag_id];
		var iteration_counter = 0;
		var spread_path_queue = $('#queue');
		$('#map_path').gmap3({
			action : 'clear'
		});
		PlotSpreadPathOnMap.intervals_for_marker_on_spread_path = [];
		$.each(path_for_hashtag, function(index, co_ordinates) {
			spread_path_queue.queue(function() {
				PlotSpreadPathOnMap.intervals_for_marker_on_spread_path.push(setTimeout(function() {
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
	Stop : function() {
		$.each(PlotSpreadPathOnMap.intervals_for_marker_on_spread_path, function(index, interval) {
			clearTimeout(interval);
		});
		PlotSpreadPathOnMap.intervals_for_marker_on_spread_path = []
		$('#map_path').gmap3({
			action : 'clear'
		});
	}
}

function InitDropDown() {
	$('select#hashtags').selectmenu({
		maxHeight : 150,
		style : 'dropdown'
	}).change(function() {
		StopPlotSpreadPathOnMap();
		PlotGlobalSpreadOnMap(this.value);
	});
}

function InitTabs() {
	$('#tabs').tabs();
	$('#tabs2').tabs();
}

function InitSpreadMap() {
	$('#map_canvas').gmap();
	var hashtag_id = $('select#hashtags').val();
	if(hashtag_id != "None") {
		// Memcache has valid data as hashtags are loaded in menu. Now load data structures.
		// Load locations from memcache.
		$.getJSON("/locations", {}, function(data) {
			locations = data;
			PlotGlobalSpreadOnMap(hashtag_id);
		});
		// Load locations_in_order_of_influence_spread from memcache.
		$.getJSON("/locations_in_order_of_influence_spread", {}, function(data) {
			locations_in_order_of_influence_spread = data;
		});
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
}

function InitButtons() {

	function TogglePlayPauseActivation() {
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
	}

	function InitPlayButton() {
		$("#draw_spread_path_button").button({
			icons : {
				primary : "ui-icon-play"
			},
			disabled : false,
		}).click(function() {
			$("#draw_spread_path_button").button("option", "label", 'Re-start');
			TogglePlayPauseActivation();
			PlotSpreadPathOnMap.Start();
		});
	}

	function InitPauseButton() {
		$("#pause_spread_path_button").button({
			icons : {
				primary : "ui-icon-pause"
			},
			disabled : true,
		}).click(function() {
			TogglePlayPauseActivation();
		});
	}

	function InitStopButton() {
		$("#stop_spread_path_button").button({
			icons : {
				primary : "ui-icon-stop"
			},
			disabled : true,
		}).click(function() {
			$("#stop_spread_path_button").button("option", "disabled", true);
			$("#draw_spread_path_button").button("option", "disabled", false);
			$("#pause_spread_path_button").button("option", "disabled", true);
			$("#draw_spread_path_button").button("option", "label", 'Start');
			PlotSpreadPathOnMap.Stop();
		});
	}

	InitPlayButton();
	InitPauseButton();
	InitStopButton();
}

function InitSpreadPathMap() {
	$('#map_path').gmap3({
		action : 'init',
		options : {
			zoom : 3
		},
	});
}


$(document).ready(function() {
	// Init dropdown menu
	InitDropDown();

	// 	Init tabs
	InitTabs();

	// 	Init spread map
	InitSpreadMap();

	// Init buttons
	InitButtons();

	// 	Init path map
	InitSpreadPathMap();
});


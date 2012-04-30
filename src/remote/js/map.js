var locations = null;

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

function PlotSpreadPathOnMap(hashtag_id) {
	path_for_hashtag = ['37.509726,-113.291016', '45.089036,-102.041016', '33.358062,-91.230469', '40.713956,-76.025391']
	var iteration_counter = 0;
	$.each(path_for_hashtag, function(index, location) {
		var co_ordinates = GetLatLngFromLatLngStr(location);

		setTimeout(function() {
			$('#map_path').gmap3({
				action : 'addMarker',
				latLng : [co_ordinates[0], co_ordinates[1]],
				options : {
					// draggable : true,
					animation : google.maps.Animation.DROP
				},
				callback : function(marker) {
					$('#map_path').gmap3({
						action : 'panTo',
						args : [marker.position]
					});
				},
			});
		}, iteration_counter * 2000); 


		iteration_counter += 1
	});
}

$(document).ready(function() {
	// Init dropdown menu
	$('select#hashtags').selectmenu({
		maxHeight : 150,
		style : 'dropdown'
	}).change(function() {
		// $('select#hashtags').text('sada');
		PlotGlobalSpreadOnMap(this.value);
	});
	// 	Init tabs
	$('#tabs').tabs();
	$('#tabs2').tabs();
	// 	Init spread map
	$('#map_canvas').gmap();
	var hashtag_id = $('select#hashtags').val();
	if(hashtag_id != "None") {
		$.getJSON("/locations", {}, function(data) {
			locations = data;
			PlotGlobalSpreadOnMap(hashtag_id);
		});
	} else {
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

	// Init button
	$("#draw_spread_path_button").button({
		icons : {
			primary : "ui-icon-play"
		},
	}).click(function() {
		$('#map_path').gmap3({
			action : 'clear'
		});
		// $('#map_path').gmap3({
		// action : 'destroy'
		// });
		PlotSpreadPathOnMap(null);
	});

	// 	Init path map
	$('#map_path').gmap3({
		action : 'init',
		options : {
			zoom : 3
		},
	});

});

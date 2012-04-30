var locations = null;

function PlotOnMap(hashtag_id) {
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


$(document).ready(function() {
	// Init dropdown menu
	$('select#hashtags').selectmenu({
		maxHeight : 150,
		style : 'dropdown'
	}).change(function() {
		// $('select#hashtags').text('sada');
		PlotOnMap(this.value);
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
			PlotOnMap(hashtag_id);
			// $('#map_path').gmap3();
		});
	} else {
		// a workaround for a flaw in the demo system (http://dev.jqueryui.com/ticket/4375), ignore!
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
	// 	Init path map
	$('#map_path').gmap3({
		action : 'init',
		options : {
			center : [57.8, 14.0],
			zoom : 6
		},
		callback : function() {
			// $('#dropMarkers').click(dropMarkers);
			// $('#startDance').click(startDance);
			// $('#stopDance').click(stopDance);
		}
	});

});

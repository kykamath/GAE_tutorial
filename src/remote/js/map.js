var locations = null;

function PlotOnMap(hashtag_id){
	locations_for_hashtag = locations[hashtag_id];
	$('#map_canvas').gmap('clear', 'markers');
	$.each(locations_for_hashtag, function(index, location) {
		   $('#map_canvas')
     			.gmap(
	     			'addMarker', 
	     			{'position': location, 'bounds': true, 'icon': '/images/blu-blank.png'}
     			)
	 });
}

$(document).ready(function(){
// Init dropdown menu
	$('select#hashtags')
		.selectmenu({
				maxHeight: 150,
				style:'dropdown'
				})
			.change(function(){
				PlotOnMap(this.value);
    		});
// 	Init tabs
	$('#tabs').tabs();
// 	Init map
	var markers1 = [
				'37.509726,-113.291016',
				'45.089036,-102.041016',
				'33.358062,-91.230469',
				'40.713956,-76.025391'
			]
	$('#map_canvas').gmap();
	var hashtag_id = $('select#hashtags').val();
	if(hashtag_id!="None"){
		$.getJSON("/locations", {}, function(data) {
	  		locations = data;
			PlotOnMap(hashtag_id);
		});
	} else {
		// a workaround for a flaw in the demo system (http://dev.jqueryui.com/ticket/4375), ignore!
		$( "#dialog:ui-dialog" ).dialog( "destroy" );
		$( "#dialog-message" ).dialog({
			modal: true,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	}
});

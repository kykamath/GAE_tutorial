var markers = [
				'37.509726,-113.291016',
				'45.089036,-102.041016',
				'33.358062,-91.230469',
				'40.713956,-76.025391'
			]

$(document).ready(function(){
	
// Init dropdown menu
	$('select#speedAa')
		.selectmenu({
				// maxHeight: 150,
				style:'dropdown'
				})
			.change(function(){
        		alert(this.value);
    		});
	
// 	Init tabs
	$('#tabs').tabs();
	
// 	Init map
	var yourStartLatLng = '59.3426606750, 18.0736160278';
    $('#map_canvas').gmap().bind('init', function(event, map) {
     	$.each(markers, function(index, marker) {
		   $('#map_canvas')
     			.gmap(
	     			'addMarker', 
	     			{'position': marker, 'bounds': true, 'icon': '/images/blue_signal.png'}
     			)
		 });
    });
});

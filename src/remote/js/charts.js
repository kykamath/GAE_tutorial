// /*
 // * Dependencies: /js/maps.js (ObjectsFromMemcache)
 // */
// 
// var Charts = {
	// ChartButtons : {
		// Init : function() {
			// first_chart_id = 'SpreadViralityChart'
// 
			// var hashtag_id = $('select#hashtags').val();
			// Charts.LoadChart(hashtag_id, first_chart_id);
// 
			// $("#radioset").buttonset().change(function() {
				// var hashtag_id = $('select#hashtags').val();
				// var chart_id = $(("#radioset :radio:checked")).attr("id");
				// if(chart_id == 'SpreadViralityChart') {
					// Charts.LoadChart(hashtag_id, chart_id);
				// } else {
					// Charts['SpreadViralityChart'](series1);
				// }
			// });
		// },
	// },
	// FillChartFromMemcache : function(hashtag_id, chart_id) {
		// hashtag_data_to_plot = ObjectsFromMemcache.charts_data[chart_id][hashtag_id];
		// ltuo_occurrence_time_and_no_of_unique_locations = hashtag_data_to_plot.data;
		// if(ltuo_occurrence_time_and_no_of_unique_locations[0][0].length == 6) {
			// ltuo_occurrence_time_as_jsdateutc_and_no_of_unique_locations = [];
			// $.each(ltuo_occurrence_time_and_no_of_unique_locations, function(index, occurrence_time_and_no_of_unique_locations) {
				// occurrence_time = occurrence_time_and_no_of_unique_locations[0]
				// date_in_utc = Date.UTC(occurrence_time[0], occurrence_time[1], occurrence_time[2], occurrence_time[3], occurrence_time[4], occurrence_time[5])
				// ltuo_occurrence_time_as_jsdateutc_and_no_of_unique_locations.push([date_in_utc, occurrence_time_and_no_of_unique_locations[1]]);
			// });
			// hashtag_data_to_plot.data = ltuo_occurrence_time_as_jsdateutc_and_no_of_unique_locations;
		// }
		// Charts[chart_id]([hashtag_data_to_plot]);
	// },
	// LoadChart : function(hashtag_id, chart_id) {
		// if(ObjectsFromMemcache.charts_data == null) {
			// $.getJSON("/charts_data", {}, function(data) {
				// ObjectsFromMemcache.charts_data = data;
				// Charts.FillChartFromMemcache(hashtag_id, chart_id);
			// });
		// } else {
			// Charts.FillChartFromMemcache(hashtag_id, chart_id);
		// }
	// },
// 
	// SpreadViralityChart : function(chart_data) {
		// chart = new Highcharts.Chart({
			// chart : {
				// renderTo : 'chart',
				// type : 'spline'
			// },
			// title : {
				// text : 'Spread Virality'
			// },
			// subtitle : {
				// text : 'Number of unique locations the hashtag appears in every timeunit.'
			// },
			// xAxis : {
				// type : 'datetime',
				// // dateTimeLabelFormats : {// don't display the dummy year
				// // day : '%b',
				// // month : '%e. %b',
				// // year : '%b'
				// // }
			// },
			// yAxis : {
				// title : {
					// text : 'Number of unique locations'
				// },
				// min : 0
			// },
			// tooltip : {
				// formatter : function() {
					// // return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat('%e. %b', this.x) + ': ' + this.y + ' m';
					// return '<b>' + this.y + '</b>' + ' unique locations at ' + '<b>' + Highcharts.dateFormat('%e. %b, %H:00', this.x) + '</b>';
				// }
			// },
			// series : chart_data,
		// });
	// }
// }
// 
// series1 = [{
	// name : 'Winter 2007-2008',
	// data : [[Date.UTC(1970, 9, 27), 0], [Date.UTC(1970, 10, 10), 0.6], [Date.UTC(1970, 10, 18), 0.7], [Date.UTC(1970, 11, 2), 0.8], [Date.UTC(1970, 11, 9), 0.6], [Date.UTC(1970, 11, 16), 0.6], [Date.UTC(1970, 11, 28), 0.67], [Date.UTC(1971, 0, 1), 0.81], [Date.UTC(1971, 0, 8), 0.78], [Date.UTC(1971, 0, 12), 0.98], [Date.UTC(1971, 0, 27), 1.84], [Date.UTC(1971, 1, 10), 1.80], [Date.UTC(1971, 1, 18), 1.80], [Date.UTC(1971, 1, 24), 1.92], [Date.UTC(1971, 2, 4), 2.49], [Date.UTC(1971, 2, 11), 2.79], [Date.UTC(1971, 2, 15), 2.73], [Date.UTC(1971, 2, 25), 2.61], [Date.UTC(1971, 3, 2), 2.76], [Date.UTC(1971, 3, 6), 2.82], [Date.UTC(1971, 3, 13), 2.8], [Date.UTC(1971, 4, 3), 2.1], [Date.UTC(1971, 4, 26), 1.1], [Date.UTC(1971, 5, 9), 0.25], [Date.UTC(1971, 5, 12), 0]]
// }]
// //
// // series2 = [{
// // name : 'Winter 2007-2008',
// // data : [[Date.UTC(1970, 9, 27), 0], [Date.UTC(1970, 10, 10), 0.6], [Date.UTC(1970, 10, 18), 0.7], [Date.UTC(1970, 11, 2), 0.8], [Date.UTC(1970, 11, 9), 0.6], [Date.UTC(1970, 11, 16), 0.6], [Date.UTC(1970, 11, 28), 0.67], [Date.UTC(1971, 0, 1), 0.81], [Date.UTC(1971, 0, 8), 0.78], [Date.UTC(1971, 0, 12), 0.98], [Date.UTC(1971, 0, 27), 1.84], [Date.UTC(1971, 1, 10), 1.80], [Date.UTC(1971, 1, 18), 1.80], [Date.UTC(1971, 1, 24), 1.92], [Date.UTC(1971, 2, 4), 2.49], [Date.UTC(1971, 2, 11), 2.79], [Date.UTC(1971, 2, 15), 2.73], [Date.UTC(1971, 2, 25), 2.61], [Date.UTC(1971, 3, 2), 2.76], [Date.UTC(1971, 3, 6), 2.82], [Date.UTC(1971, 3, 13), 2.8], [Date.UTC(1971, 4, 3), 2.1], [Date.UTC(1971, 4, 26), 1.1], [Date.UTC(1971, 5, 9), 0.25], [Date.UTC(1971, 5, 12), 0]]
// // }, {
// // name : 'Winter 2008-2009',
// // data : [[Date.UTC(1970, 9, 18), 0], [Date.UTC(1970, 9, 26), 0.2], [Date.UTC(1970, 11, 1), 0.47], [Date.UTC(1970, 11, 11), 0.55], [Date.UTC(1970, 11, 25), 1.38], [Date.UTC(1971, 0, 8), 1.38], [Date.UTC(1971, 0, 15), 1.38], [Date.UTC(1971, 1, 1), 1.38], [Date.UTC(1971, 1, 8), 1.48], [Date.UTC(1971, 1, 21), 1.5], [Date.UTC(1971, 2, 12), 1.89], [Date.UTC(1971, 2, 25), 2.0], [Date.UTC(1971, 3, 4), 1.94], [Date.UTC(1971, 3, 9), 1.91], [Date.UTC(1971, 3, 13), 1.75], [Date.UTC(1971, 3, 19), 1.6], [Date.UTC(1971, 4, 25), 0.6], [Date.UTC(1971, 4, 31), 0.35], [Date.UTC(1971, 5, 7), 0]]
// // }, {
// // name : 'Winter 2009-2010',
// // data : [[Date.UTC(1970, 9, 9), 0], [Date.UTC(1970, 9, 14), 0.15], [Date.UTC(1970, 10, 28), 0.35], [Date.UTC(1970, 11, 12), 0.46], [Date.UTC(1971, 0, 1), 0.59], [Date.UTC(1971, 0, 24), 0.58], [Date.UTC(1971, 1, 1), 0.62], [Date.UTC(1971, 1, 7), 0.65], [Date.UTC(1971, 1, 23), 0.77], [Date.UTC(1971, 2, 8), 0.77], [Date.UTC(1971, 2, 14), 0.79], [Date.UTC(1971, 2, 24), 0.86], [Date.UTC(1971, 3, 4), 0.8], [Date.UTC(1971, 3, 18), 0.94], [Date.UTC(1971, 3, 24), 0.9], [Date.UTC(1971, 4, 16), 0.39], [Date.UTC(1971, 4, 21), 0]]
// // }]
// 
// $(document).ready(function() {
// 	
	// Charts.ChartButtons.Init();
// 
	// // first_chart_id = 'SpreadViralityChart'
	// //
	// // var hashtag_id = $('select#hashtags').val();
	// // Charts.LoadChart(hashtag_id, first_chart_id);
	// //
	// // $("#radioset").buttonset().change(function() {
	// // var hashtag_id = $('select#hashtags').val();
	// // var chart_id = $(("#radioset :radio:checked")).attr("id");
	// // if(chart_id == 'SpreadViralityChart') {
	// // Charts.LoadChart(hashtag_id, chart_id);
	// // } else {
	// // Charts['SpreadViralityChart'](series1);
	// // }
	// // });
// 
// });

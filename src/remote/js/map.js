// (function($) {
// $.widget("ui.combobox", {
// _create : function() {
// var input, self = this, select = this.element.hide(), selected = select.children(":selected"), value = selected.val() ? selected.text() : "", wrapper = $("<span>").addClass("ui-combobox").insertAfter(select);
//
// input = $("<input>").appendTo(wrapper).val(value).addClass("ui-state-default").autocomplete({
// delay : 0,
// minLength : 0,
// source : function(request, response) {
// var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
// response(select.children("option").map(function() {
// var text = $(this).text();
// if(this.value && (!request.term || matcher.test(text) ))
// return {
// label : text.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(request.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>"),
// value : text,
// option : this
// };
// }));
// },
// select : function(event, ui) {
// ui.item.option.selected = true;
// self._trigger("selected", event, {
// item : ui.item.option
// });
// },
// change : function(event, ui) {
// if(!ui.item) {
// var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"), valid = false;
// select.children("option").each(function() {
// if($(this).text().match(matcher)) {
// this.selected = valid = true;
// return false;
// }
// });
// if(!valid) {
// // remove invalid value, as it didn't match anything
// $(this).val("");
// select.val("");
// input.data("autocomplete").term = "";
// return false;
// }
// }
// }
// }).addClass("ui-widget ui-widget-content ui-corner-left");
//
// input.data("autocomplete")._renderItem = function(ul, item) {
// return $("<li></li>").data("item.autocomplete", item).append("<a>" + item.label + "</a>").appendTo(ul);
// };
//
// $("<a>").attr("tabIndex", -1).attr("title", "Show All Items").appendTo(wrapper).button({
// icons : {
// class : 'autocomplete-button',
// primary : "ui-icon-triangle-1-s"
// },
// text : false
// }).removeClass("ui-corner-all").addClass("ui-corner-right ui-button-icon").click(function() {
// // close if already visible
// if(input.autocomplete("widget").is(":visible")) {
// input.autocomplete("close");
// return;
// }
//
// // work around a bug (likely same cause as #5265)
// $(this).blur();
//
// // pass empty string as value to search for, displaying all results
// input.autocomplete("search", "");
// input.focus();
// });
// },
//
// destroy : function() {
// this.wrapper.remove();
// this.element.show();
// $.Widget.prototype.destroy.call(this);
// }
// });
// })(jQuery);

var ObjectsFromMemcache = {
	locations : null,
	// all_hashtags : null,
	locations_in_order_of_influence_spread : null,
	charts_data : null,
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
	// LoadAllHastags : function() {
		// $.getJSON("/all_hashtags", {}, function(data) {
			// ObjectsFromMemcache.all_hashtags = data;
		// });
	// },
	GetLocations : function(hashtag_id) {
		return this.locations[hashtag_id];
	},
	GetLocationsInOrderOfInfluenceSpread : function(hashtag_id) {
		return this.locations_in_order_of_influence_spread[hashtag_id];
	}
}

var HashtagsMenu = {
	Init : function() {
		// $("select#hashtags").combobox({
		// });
		$('select#hashtags').selectmenu({
			maxHeight : 150,
			style : 'dropdown'
		}).change(function() {
			function updatePropagationAnalysis() {
				PropagationAnalysis.SpreadPath.StopPlot();
				setTimeout(function() {
					PropagationAnalysis.Charts.UpdateCurrentChart()
				}, 750);
			}


			GlobalSpread.Plot(this.value, updatePropagationAnalysis);
		});

	}
}

// var AutoCompleteHashtag = {
	// Init : function() {
// 
		// // $("#all_hashtags_combobox").combobox({
		// // maxHeight : 30,
		// // });
		// // ObjectsFromMemcache.LoadAllHastags(fun);
		// // val all
		// // var all_hashtags = ["ActionScript", "AppleScript", "Asp", "BASIC", "C", "C++", "Clojure", "COBOL", "ColdFusion", "Erlang", "Fortran", "Groovy", "Haskell", "Java", "JavaScript", "Lisp", "Perl", "PHP", "Python", "Ruby", "Scala", "Scheme"];
		// $("#all_hashtags_autoselect").autocomplete({
			// source : '/all_hashtags'
		// }).click(function() {
			// $(this).val("");
		// });
	// }
// }

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
	Plot : function(hashtag_id, callback_function) {
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
		if(callback_function != null) {
			callback_function();
		}
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

var Charts = {
	is_loaded : false,
	Init : function() {
		Charts.ChartButtons.Init();
		Charts.is_loaded = true;
	},
	ChartButtons : {
		Init : function() {
			first_chart_id = 'TemporalDistribution'
			var hashtag_id = $('select#hashtags').val();
			Charts.LoadChart(hashtag_id, first_chart_id);
			$("#radioset").buttonset().change(function() {
				var hashtag_id = $('select#hashtags').val();
				var chart_id = $(("#radioset :radio:checked")).attr("id");
				Charts.LoadChart(hashtag_id, chart_id);
				// if(chart_id == 'SpreadViralityChart') {
				// Charts.LoadChart(hashtag_id, chart_id);
				// } else {
				// Charts['SpreadViralityChart'](series1);
				// }
			});
		},
	},
	FillChartFromMemcache : function(hashtag_id, chart_id) {
		hashtag_data_to_plot = ObjectsFromMemcache.charts_data[chart_id][hashtag_id];
		ltuo_occurrence_time_and_no_of_unique_locations = hashtag_data_to_plot.data;
		if(ltuo_occurrence_time_and_no_of_unique_locations[0][0].length == 6) {
			ltuo_occurrence_time_as_jsdateutc_and_no_of_unique_locations = [];
			$.each(ltuo_occurrence_time_and_no_of_unique_locations, function(index, occurrence_time_and_no_of_unique_locations) {
				occurrence_time = occurrence_time_and_no_of_unique_locations[0]
				date_in_utc = Date.UTC(occurrence_time[0], occurrence_time[1] - 1, occurrence_time[2], occurrence_time[3], occurrence_time[4], occurrence_time[5])
				ltuo_occurrence_time_as_jsdateutc_and_no_of_unique_locations.push([date_in_utc, occurrence_time_and_no_of_unique_locations[1]]);
			});
			hashtag_data_to_plot.data = ltuo_occurrence_time_as_jsdateutc_and_no_of_unique_locations;
		}
		Charts[chart_id]([hashtag_data_to_plot]);
	},
	LoadChart : function(hashtag_id, chart_id) {
		if(ObjectsFromMemcache.charts_data == null) {
			$.getJSON("/charts_data", {}, function(data) {
				ObjectsFromMemcache.charts_data = data;
				Charts.FillChartFromMemcache(hashtag_id, chart_id);
			});
		} else {
			Charts.FillChartFromMemcache(hashtag_id, chart_id);
		}
	},
	UpdateCurrentChart : function() {
		if(Charts.is_loaded) {
			$('#radioset').trigger('change');
		}
	},
	SpreadViralityChart : function(chart_data) {
		chart = new Highcharts.Chart({
			chart : {
				renderTo : 'chart',
				type : 'spline'
			},
			title : {
				text : 'Spatial Freshness'
			},
			subtitle : {
				text : 'Shows the ability of the hashtag to spread to new locations.'
			},
			xAxis : {
				type : 'datetime',
			},
			yAxis : {
				title : {
					text : 'Number of new locations added in the time unit'
				},
				min : 0
			},
			tooltip : {
				formatter : function() {
					return '<b>' + this.y + '</b>' + ' unique locations at ' + '<b>' + Highcharts.dateFormat('%e %b, %H:%M', this.x) + '</b>';
				}
			},
			series : chart_data,
		});
	},
	TemporalDistribution : function(chart_data) {
		chart = new Highcharts.Chart({
			chart : {
				renderTo : 'chart',
				type : 'spline'
			},
			title : {
				text : 'Temporal distribution'
			},
			subtitle : {
				text : 'Shows the temporal distribution of the hashtag.'
			},
			xAxis : {
				type : 'datetime',
			},
			yAxis : {
				title : {
					text : 'Number of occurrences in the time unit'
				},
				min : 0
			},
			tooltip : {
				formatter : function() {
					return '<b>' + this.y + '</b>' + ' occurrences during ' + '<b>' + Highcharts.dateFormat('%e %b, %H:%M', this.x) + '</b>';
				}
			},
			series : chart_data,
		});
	},
	LocationAccumulation : function(chart_data) {
		chart = new Highcharts.Chart({
			chart : {
				renderTo : 'chart',
				type : 'spline'
			},
			title : {
				text : 'Spatial Spread'
			},
			subtitle : {
				text : 'Shows how the hashtag has spread until now.'
			},
			xAxis : {
				type : 'datetime',
			},
			yAxis : {
				title : {
					text : 'Total no. of locations observed until the time unit.'
				},
				min : 0
			},
			tooltip : {
				formatter : function() {
					return 'Hashtag was observed in total of <b>' + this.y + '</b>' + ' locations until ' + '<b>' + Highcharts.dateFormat('%e %b, %H:%M', this.x) + '</b>';
				}
			},
			series : chart_data,
		});
	},
}

SpreadPath = {
	MARKER_DROP_TIME_LAG : 1000,
	intervals_for_marker_on_spread_path : [],
	Init : function() {
		$('#map_path').gmap3({
			action : 'init',
			options : {
				zoom : 3
			},
		});
		SpreadPath.Buttons.Init();
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
		spread_path_queue.queue(function() {
			SpreadPath.intervals_for_marker_on_spread_path.push(new Timeout(SpreadPath.Buttons.EndState, iteration_counter * SpreadPath.MARKER_DROP_TIME_LAG));
			$(this).dequeue();
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
	},
	StopPlot : function() {
		SpreadPath.Buttons.EndState();
		$.each(SpreadPath.intervals_for_marker_on_spread_path, function(index, interval) {
			if($.isArray(interval) == false) {
				interval.clear();
			}
		});
		SpreadPath.intervals_for_marker_on_spread_path = []
		$('#map_path').gmap3({
			action : 'clear'
		});
	},
}

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
							PropagationAnalysis.loaded_tabs.push(ui.index);
							PropagationAnalysis.Charts.Init();
							break;
						default:
							console.log();
					}
				}
			}
		});
	},
	Charts : Charts,
	SpreadPath : SpreadPath
}

$(document).ready(function() {
	//Init hashtags autocomplete
	// AutoCompleteHashtag.Init();

	// Init hashtags menu
	HashtagsMenu.Init();

	// 	Init global spread map
	GlobalSpread.Init();

	// 	Init spread path map
	PropagationAnalysis.Init();
});


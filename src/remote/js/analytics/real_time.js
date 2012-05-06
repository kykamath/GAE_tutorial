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
			// $("<a>").attr("tabIndex", -1).attr("title", "Show All Items").attr("id", "combo-button").appendTo(wrapper).button({
				// icons : {
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

// $(function() {
// $("#combobox").combobox();
// // $("#toggle").click(function() {
// // $("#combobox").toggle();
// // });
// });

var ObjectsFromMemcache = {
	locations : null,
	// all_hashtags : null,
	locations_in_order_of_influence_spread : null,
	charts_data : {},
	LoadLocations : function(callback_function, parameter) {
		$.post("/get_from_memcache", {
			'key' : 'locations'
		}, function(data) {
			ObjectsFromMemcache.locations = jQuery.parseJSON(data);
			callback_function(parameter);
		});
	},
	// LoadLocationsInOrderOfInfluenceSpread : function() {
	// $.post("/get_from_memcache", {
	// 'key' : 'locations_in_order_of_influence_spread'
	// }, function(data) {
	// // $.getJSON("/locations_in_order_of_influence_spread", {}, function(data) {
	// ObjectsFromMemcache.locations_in_order_of_influence_spread = jQuery.parseJSON(data);
	// });
	// },
	_GetChartDataKey : function(hashtag_id, chart_id) {
		return chart_id + '_' + hashtag_id
	},
	GetChartData : function(hashtag_id, chart_id, callback_function) {
		var chart_data_key = ObjectsFromMemcache._GetChartDataKey(hashtag_id, chart_id);
		if(ObjectsFromMemcache.charts_data[chart_data_key] == null) {
			$.post("/get_from_memcache", {
				'key' : chart_data_key
			}, function(data) {
				ObjectsFromMemcache.charts_data[chart_data_key] = jQuery.parseJSON(data);
				if(callback_function != null) {
					callback_function(chart_id, ObjectsFromMemcache.charts_data[chart_data_key]);
				}
			});
		} else {
			if(callback_function != null) {
				callback_function(chart_id, ObjectsFromMemcache.charts_data[chart_data_key]);
			}
		}
	},
	// LoadAllHastags : function() {
	// 		$.post("/get_from_memcache", {'key': 'all_hashtags'}, function(data) {
	//// $.getJSON("/all_hashtags", {}, function(data) {
	// ObjectsFromMemcache.all_hashtags = data;
	// });
	// },
	GetLocations : function(hashtag_id) {
		return this.locations[hashtag_id];
	},
	GetLocationsInOrderOfInfluenceSpread : function(hashtag_id, callback) {
		if(ObjectsFromMemcache.locations_in_order_of_influence_spread == null) {
			$.post("/get_from_memcache", {
				'key' : 'locations_in_order_of_influence_spread'
			}, function(data) {
				// $.getJSON("/locations_in_order_of_influence_spread", {}, function(data) {
				ObjectsFromMemcache.locations_in_order_of_influence_spread = jQuery.parseJSON(data);
				if(callback != null) {
					callback(ObjectsFromMemcache.locations_in_order_of_influence_spread[hashtag_id]);
				}
			});
		} else {
			if(callback != null) {
				callback(ObjectsFromMemcache.locations_in_order_of_influence_spread[hashtag_id]);
			}
		}
	}
}

// var HashtagsMenu = {
	// selected_val : null,
	// selected_text : null,
	// Init : function() {
		// UpdateHashtagInfo = function(element_id, offset) {
			// HashtagsMenu.SetValAndText(element_id, offset);
			// $("#title").text("#" + HashtagsMenu.GetHashtagsText());
			// // $("#title").fadeOut(500, function() {
				// // $("#title").text("#" + HashtagsMenu.GetHashtagsText())
				// // $("#title").fadeIn(500);
			// // })
			// var selected_tab_index = $('#tabs2').tabs('option', 'selected')
			// PropagationAnalysis.Reload(HashtagsMenu.GetHashtagsId(), selected_tab_index);
			// if(selected_tab_index == 2) {
				// PropagationAnalysis.SpreadPath.StopPlot();
			// } else {
				// PropagationAnalysis.SpreadPath.hashtag_changed = true;
			// }
		// };
		// // $('select#hashtags').selectmenu({
		// // maxHeight : 150,
		// // style : 'dropdown'
		// // }).change(function() {
		// // UpdateHashtagInfo('select#hashtags', 0);
		// // });
		// $('select#hashtags').combobox({
			// selected : function() {
				// UpdateHashtagInfo('select#hashtags', 0);
			// }
		// });
// 
		// $("#combobox").combobox({
			// selected : function() {
				// UpdateHashtagInfo('#combobox', 10);
			// }
		// });
		// HashtagsMenu.SetValAndText('select#hashtags', 0);
		// $("#title").text("#" + HashtagsMenu.GetHashtagsText());
	// },
	// GetHashtagsId : function() {
		// // return $('select#hashtags').val();
		// return HashtagsMenu.selected_val;
	// },
	// GetHashtagsText : function() {
		// return HashtagsMenu.selected_text;
	// },
	// SetValAndText : function(element_id, offset) {
		// var element_text = $(element_id).val();
		// var split_result = element_text.split(':ilab:');
		// HashtagsMenu.selected_val = '' + (parseInt(split_result[0]) + offset);
		// HashtagsMenu.selected_text = split_result[1];
	// }
	// // GetHashtagsId : function() {
	// // return $('select#hashtags').val();
	// // }
// }

var AutoCompleteHashtag = {
	Init : function() {

		$("#all_hashtags_combobox").combobox({
			maxHeight : 30,
		});
		// ObjectsFromMemcache.LoadAllHastags(fun);
		// val all
		// var all_hashtags = ["ActionScript", "AppleScript", "Asp", "BASIC", "C", "C++", "Clojure", "COBOL", "ColdFusion", "Erlang", "Fortran", "Groovy", "Haskell", "Java", "JavaScript", "Lisp", "Perl", "PHP", "Python", "Ruby", "Scala", "Scheme"];
		// $("#all_hashtags_autoselect").autocomplete({
		// source : '/all_hashtags'
		// }).click(function() {
		// $(this).val("");
		// });
	}
}

var HeatMap = {
	mf_element_id_to_heatmap : {},
	MAP_OPTIONS : {
		zoom : 2,
		// center : new google.maps.LatLng(40.410359, -3.68866),
		center : new google.maps.LatLng(20,8),
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		disableDefaultUI : false,
		scrollwheel : false,
		draggable : false,
		navigationControl : false,
		mapTypeControl : false,
		scaleControl : false,
		disableDoubleClickZoom : true,
		streetViewControl : false
	},
	_ConvertToHeatMapObjects : function(ltuo_lattice_and_no_of_occurrences) {
		var data = []
		var max = -1;
		$.each(ltuo_lattice_and_no_of_occurrences, function(index, lattice_and_no_of_occurrences) {
			data.push({
				'lat' : lattice_and_no_of_occurrences[0][0],
				'lng' : lattice_and_no_of_occurrences[0][1],
				'count' : lattice_and_no_of_occurrences[1]
			})
			if(max < lattice_and_no_of_occurrences[1]) {
				max = lattice_and_no_of_occurrences[1];
			}
		});
		return {
			'max' : max,
			'data' : data
		};
	},
	Init : function(map_element_id) {
		var map = new google.maps.Map(document.getElementById(map_element_id), HeatMap.MAP_OPTIONS);
		var heatmap = new HeatmapOverlay(map, {
			"radius" : 15,
			"visible" : true,
			"opacity" : 60
		});
		return [map, heatmap]
	},
	Plot : function(map_element_id, ltuo_lattice_and_no_of_occurrences, callback_function) {
		var initiated_objects = HeatMap.Init(map_element_id);
		var map = initiated_objects[0];
		map.my_heatmap_overlay = initiated_objects[1];
		map.my_heat_map_data_object = HeatMap._ConvertToHeatMapObjects(ltuo_lattice_and_no_of_occurrences);
		map.my_callback_function = callback_function;
		google.maps.event.addListenerOnce(map, "idle", function() {
			map.my_heatmap_overlay.setDataSet(map.my_heat_map_data_object);
			if(map.my_callback_function != null) {
				map.my_callback_function(map);
			}
		});
	}
}

var GlobalSpread = {
	current_hashtag_id : null,
	Init : function() {
		// $('#map_canvas').gmap();
		var hashtag_id = HashtagsMenu.GetHashtagsId();
		if(hashtag_id != "NaN") {
			// Memcache has valid data as hashtags are loaded in menu. Now load data structures.
			// Load locations from memcache.
			ObjectsFromMemcache.LoadLocations(GlobalSpread.Plot, hashtag_id)
			// Load locations_in_order_of_influence_spread from memcache.
			// ObjectsFromMemcache.LoadLocationsInOrderOfInfluenceSpread();

		} else {
			// Memcache doesn't have valid data as hashtags are not loaded in menu.
			// Show a dialog displaying the issue.
			alert('Looks like app is down. Please Try again in a few minutes.');
			// $("#dialog:ui-dialog").dialog("destroy");
			// $("#dialog-message").css('visibility', 'visible');
			// $("#dialog-message").dialog({
				// modal : true,
				// buttons : {
					// Ok : function() {
						// $(this).dialog("close");
						// $("#dialog-message").css('visibility', 'hidden');
					// }
				// }
			// });
		}
	},
	Plot : function(hashtag_id, callback_function) {
		GlobalSpread.current_hashtag_id = hashtag_id;
		ltuo_lattice_and_no_of_occurrences = ObjectsFromMemcache.GetLocations(hashtag_id);
		HeatMap.Plot('map_canvas', ltuo_lattice_and_no_of_occurrences);
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
			var hashtag_id = HashtagsMenu.GetHashtagsId();
			// Charts.LoadChart(hashtag_id, first_chart_id);
			ObjectsFromMemcache.GetChartData(hashtag_id, first_chart_id, Charts.FillChartFromMemcache)
			$("#radioset").buttonset().change(function() {
				var hashtag_id = HashtagsMenu.GetHashtagsId();
				var chart_id = $(("#radioset :radio:checked")).attr("id");
				// Charts.LoadChart(hashtag_id, chart_id);
				ObjectsFromMemcache.GetChartData(hashtag_id, chart_id, Charts.FillChartFromMemcache)
			});
		},
	},
	FillChartFromMemcache : function(chart_id, hashtag_data_to_plot) {
		// hashtag_data_to_plot = ObjectsFromMemcache.charts_data[chart_id][hashtag_id];
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
	// LoadChart : function(hashtag_id, chart_id) {
	// if(ObjectsFromMemcache.charts_data == null) {
	// $.post("/get_from_memcache", {
	// 'key' : 'charts_data'
	// }, function(data) {
	// ObjectsFromMemcache.charts_data = jQuery.parseJSON(data);
	// Charts.FillChartFromMemcache(hashtag_id, chart_id);
	// });
	// } else {
	// Charts.FillChartFromMemcache(hashtag_id, chart_id);
	// }
	// },
	Reload : function() {
		if(Charts.is_loaded) {
			$('#radioset').trigger('change');
		}
	},
	SpreadViralityChart : function(chart_data) {
		chart = new Highcharts.Chart({
			chart : {
				renderTo : 'chart',
				type : 'spline',
				height: 370
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
				type : 'spline',
				height: 370
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
				type : 'spline',
				height: 370
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
	Radius : function(chart_data) {
		chart = new Highcharts.Chart({
			chart : {
				renderTo : 'chart',
				type : 'spline',
				height: 370
			},
			title : {
				text : 'Spread Radius'
			},
			subtitle : {
				text : 'Shows how far the hashtag had spread at the time unit.'
			},
			xAxis : {
				type : 'datetime',
			},
			yAxis : {
				title : {
					text : 'Radius in miles'
				},
				min : 0
			},
			tooltip : {
				formatter : function() {
					return 'Hashtag had a radius of <b>' + this.y + '</b>' + ' miles at ' + '<b>' + Highcharts.dateFormat('%e %b, %H:%M', this.x) + '</b>';
				}
			},
			series : chart_data,
		});
	},
}

SpreadPath = {
	MARKER_DROP_TIME_LAG : 250,
	intervals_for_marker_on_spread_path : [],
	hashtag_changed : false,
	Init : function() {
		HeatMap.Init('map_path');
		SpreadPath.Buttons.Init();
	},
	StartPlot : function() {
		callback_function_to_animate = function(map) {
			queue_lattices_for_animation = function(ltuo_lattice_and_pure_influence_score) {
				var iteration_counter = 0;
				var spread_path_queue = $('#queue');
				SpreadPath.intervals_for_marker_on_spread_path = [];
				$.each(ltuo_lattice_and_pure_influence_score, function(index, lattice_and_pure_influence_score) {
					spread_path_queue.queue(function() {
						SpreadPath.intervals_for_marker_on_spread_path.push(new Timeout(function() {
							lattice = lattice_and_pure_influence_score[0]
							map.my_heatmap_overlay.addDataPoint(lattice[0], lattice[1], lattice_and_pure_influence_score[1]);
						}, iteration_counter * SpreadPath.MARKER_DROP_TIME_LAG));
						iteration_counter += 1
						$(this).dequeue();
					});
				});
				spread_path_queue.queue(function() {
					SpreadPath.intervals_for_marker_on_spread_path.push(new Timeout(SpreadPath.Buttons.EndState, iteration_counter * SpreadPath.MARKER_DROP_TIME_LAG));
					$(this).dequeue();
				});
			}
			var hashtag_id = HashtagsMenu.GetHashtagsId();
			ObjectsFromMemcache.GetLocationsInOrderOfInfluenceSpread(hashtag_id, queue_lattices_for_animation);
		}
		HeatMap.Plot('map_path', [[[-57.7, -145.8], 0]], callback_function_to_animate);
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
		HeatMap.Plot('map_path', [[[-57.7, -145.8], 0]]);
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
}

var PropagationAnalysis = {
	loaded_tabs : [],
	current_hashtag_id : null,
	Init : function() {
		$('#tabs2').tabs({
			show : function(event, ui) {
				if($.inArray(ui.index, PropagationAnalysis.loaded_tabs) == -1) {
					PropagationAnalysis.loaded_tabs.push(ui.index);
					switch (ui.index) {
						case 2:
							PropagationAnalysis.SpreadPath.Init();
							break;
						case 1:
							PropagationAnalysis.Charts.Init();
							break;
						case 0:
							PropagationAnalysis.GlobalSpread.Init();
							break;
						default:
							console.log();
					}
				} else {
					var hashtag_id = HashtagsMenu.GetHashtagsId();
					// if(current_hashtag_id != hashtag_id) {
					// current_hashtag_id = hashtag_id;
					PropagationAnalysis.Reload(hashtag_id, ui.index);
					// }
				}
			}
		});
	},
	Reload : function(hashtag_id, current_tab_index) {
		switch(current_tab_index) {
			case 2:
				// PropagationAnalysis.SpreadPath.StopPlot();
				if(PropagationAnalysis.SpreadPath.hashtag_changed) {
					PropagationAnalysis.SpreadPath.StopPlot();
					PropagationAnalysis.SpreadPath.hashtag_changed = false;
				}
				break;
			case 1:
				PropagationAnalysis.Charts.Reload();
				break;
			case 0:
				if(GlobalSpread.current_hashtag_id != hashtag_id) {
					PropagationAnalysis.GlobalSpread.Plot(hashtag_id);
				}
				break;
			default:
				console.log();
		}
	},
	GlobalSpread : GlobalSpread,
	Charts : Charts,
	SpreadPath : SpreadPath
}

$(document).ready(function() {
	//Init hashtags autocomplete
	// AutoCompleteHashtag.Init();

	// Init hashtags menu
	HashtagsMenu.Init();

	// 	Init spread path map
	PropagationAnalysis.Init();
});


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

AnimatedHeatMap = {
	map_id : null,
	queue_id : null,
	play_button_id : null,
	pause_button_id : null,
	stop_button_id : null,
	function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : null,
	MARKER_DROP_TIME_LAG : 250,
	intervals_for_marker_on_spread_path : [],
	hashtag_changed : false,
	Init : function(id, function_to_get_ltuo_lattice_and_pure_influence_score_and_animate) {
		args = [id, function_to_get_ltuo_lattice_and_pure_influence_score_and_animate]
		$.each(args, function(index, arg) {
			if(arg == null) {
				alert('Required argument not given for AnimatedHeatMap');
			}
		});
		AnimatedHeatMap.map_id = id + '_map';
		AnimatedHeatMap.queue_id = id + '_queue';
		AnimatedHeatMap.play_button_id = id + '_play';
		AnimatedHeatMap.pause_button_id = id + '_pause';
		AnimatedHeatMap.stop_button_id = id + '_stop';
		AnimatedHeatMap.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate = function_to_get_ltuo_lattice_and_pure_influence_score_and_animate;
		HeatMap.Init(AnimatedHeatMap.map_id);
		AnimatedHeatMap.Buttons.Init();
	},
	StartPlot : function() {
		callback_function_to_animate = function(map) {
			cbf_in_ltuo_lattice_and_pure_influence_score = function(ltuo_lattice_and_pure_influence_score) {
				var iteration_counter = 0;
				var spread_path_queue = $('#'+AnimatedHeatMap.queue_id);
				AnimatedHeatMap.intervals_for_marker_on_spread_path = [];
				$.each(ltuo_lattice_and_pure_influence_score, function(index, lattice_and_pure_influence_score) {
					spread_path_queue.queue(function() {
						AnimatedHeatMap.intervals_for_marker_on_spread_path.push(new Timeout(function() {
							lattice = lattice_and_pure_influence_score[0]
							map.my_heatmap_overlay.addDataPoint(lattice[0], lattice[1], lattice_and_pure_influence_score[1]);
						}, iteration_counter * AnimatedHeatMap.MARKER_DROP_TIME_LAG));
						iteration_counter += 1
						$(this).dequeue();
					});
				});
				spread_path_queue.queue(function() {
					AnimatedHeatMap.intervals_for_marker_on_spread_path.push(new Timeout(AnimatedHeatMap.Buttons.EndState, iteration_counter * AnimatedHeatMap.MARKER_DROP_TIME_LAG));
					$(this).dequeue();
				});
			}
			AnimatedHeatMap.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate(cbf_in_ltuo_lattice_and_pure_influence_score)
		}
		HeatMap.Plot(AnimatedHeatMap.map_id, [[[-57.7, -145.8], 0]], callback_function_to_animate);
	},
	ReStartPlot : function() {
		var intervals_for_marker_on_spread_path = [];
		$.each(AnimatedHeatMap.intervals_for_marker_on_spread_path, function(index, tuo_fn_and_interval) {
			intervals_for_marker_on_spread_path.push(new Timeout(tuo_fn_and_interval[0], tuo_fn_and_interval[1]));
		})
		AnimatedHeatMap.intervals_for_marker_on_spread_path = intervals_for_marker_on_spread_path;
	},
	PausePlot : function() {
		var uncleared_intervals_for_marker_on_spread_path = []
		var no_of_cleared = 0;
		$.each(AnimatedHeatMap.intervals_for_marker_on_spread_path, function(index, interval) {
			if(interval.cleared == false) {
				var tuo_fn_and_interval = [interval.fn, interval.interval - (no_of_cleared * AnimatedHeatMap.MARKER_DROP_TIME_LAG)];
				uncleared_intervals_for_marker_on_spread_path.push(tuo_fn_and_interval);
			} else {
				no_of_cleared += 1;
			}
			interval.clear();
		});
		AnimatedHeatMap.intervals_for_marker_on_spread_path = uncleared_intervals_for_marker_on_spread_path;
	},
	StopPlot : function() {
		AnimatedHeatMap.Buttons.EndState();
		$.each(AnimatedHeatMap.intervals_for_marker_on_spread_path, function(index, interval) {
			if($.isArray(interval) == false) {
				interval.clear();
			}
		});
		AnimatedHeatMap.intervals_for_marker_on_spread_path = []
		HeatMap.Plot(AnimatedHeatMap.map_id, [[[-57.7, -145.8], 0]]);
	},
	Buttons : {
		TogglePlayPauseButtons : function() {
			var disabled = $('#'+AnimatedHeatMap.play_button_id).button("option", "disabled");
			// Stop button can always be used except immediately after it is clicked.
			// Play and pause toggle.
			$('#'+AnimatedHeatMap.stop_button_id).button("option", "disabled", false);
			if(disabled) {
				$('#'+AnimatedHeatMap.play_button_id).button("option", "disabled", false);
				$('#'+AnimatedHeatMap.pause_button_id).button("option", "disabled", true);
			} else {
				$('#'+AnimatedHeatMap.play_button_id).button("option", "disabled", true);
				$('#'+AnimatedHeatMap.pause_button_id).button("option", "disabled", false);
			}
		},
		// Hide : function() {
			// alert('hide buttons');
		// },
		InitPlayButton : function() {
			$('#'+AnimatedHeatMap.play_button_id).button({
				icons : {
					primary : "ui-icon-play"
				},
				disabled : false,
			}).click(function() {
				var restart_label = 'Re-start';
				AnimatedHeatMap.Buttons.TogglePlayPauseButtons();
				var current_label = $('#'+AnimatedHeatMap.play_button_id).button("option", "label");
				if(current_label == restart_label) {
					AnimatedHeatMap.ReStartPlot();
				} else {
					$('#'+AnimatedHeatMap.play_button_id).button("option", "label", restart_label);
					AnimatedHeatMap.StartPlot();
				}
			});
		},

		InitPauseButton : function() {
			$('#'+AnimatedHeatMap.pause_button_id).button({
				icons : {
					primary : "ui-icon-pause"
				},
				disabled : true,
			}).click(function() {
				AnimatedHeatMap.Buttons.TogglePlayPauseButtons();
				AnimatedHeatMap.PausePlot();
			});
		},

		InitStopButton : function() {
			$('#'+AnimatedHeatMap.stop_button_id).button({
				icons : {
					primary : "ui-icon-stop"
				},
				disabled : true,
			}).click(function() {
				AnimatedHeatMap.StopPlot();
			});
		},
		Init : function() {
			this.InitPlayButton();
			this.InitPauseButton();
			this.InitStopButton();
		},
		EndState : function() {
			$('#'+AnimatedHeatMap.play_button_id).button("option", "disabled", false);
			$('#'+AnimatedHeatMap.pause_button_id).button("option", "disabled", true);
			$('#'+AnimatedHeatMap.stop_button_id).button("option", "disabled", true);
			$('#'+AnimatedHeatMap.play_button_id).button("option", "label", 'Start');
		}
	},
}
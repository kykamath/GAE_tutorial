LocationsInOrderOfSpread = {
	mf_model_id_hashtag_id_to_ltuo_lattice_and_pure_influence_score : {},
	Get : function(model_id, hashtag_id) {
		model_id_hashtag_id  = model_id+':ilab:'+hashtag_id;
		if(LocationsInOrderOfSpread.mf_model_id_hashtag_id_to_ltuo_lattice_and_pure_influence_score[model_id] == null) {
			//Load from memcache;
			$.ajax({
				type : 'POST',
				url : '/get_from_memcache',
				dataType : 'json',
				success : function(data) {
					LocationsInOrderOfSpread.mf_model_id_hashtag_id_to_ltuo_lattice_and_pure_influence_score[model_id_hashtag_id] = data;
				},
				data : {'key' : model_id_hashtag_id},
				async : false
			});
		}
		return LocationsInOrderOfSpread.mf_model_id_hashtag_id_to_ltuo_lattice_and_pure_influence_score[model_id_hashtag_id];
	}
} 

$(document).ready(function() {

	FirstOccurrenceModel = {
		id : 'first_occurrence_model',
		animated_heat_map : null,
		current_hashtag_id : null,
		Init : function(current_hashtag_id) {
			$('#' + FirstOccurrenceModel.id).hide()
			FirstOccurrenceModel.current_hashtag_id = current_hashtag_id;
			FirstOccurrenceModel.animated_heat_map = new AnimatedHeatMap(FirstOccurrenceModel.id, FirstOccurrenceModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate);
			FirstOccurrenceModel.animated_heat_map.point_add_time_lag = 20;
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score) {
			var ltuo_lattice_and_pure_influence_score = LocationsInOrderOfSpread.Get(FirstOccurrenceModel.id, FirstOccurrenceModel.current_hashtag_id);
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		},
		ReloadModel : function(hashtag_id, hashtag_text) {
			FirstOccurrenceModel.current_hashtag_id = hashtag_id;
			FirstOccurrenceModel.animated_heat_map.Reload();
		},
	}

	WeightedAggregateModel = {
		id : 'weighted_aggregate_model',
		animated_heat_map : null,
		current_hashtag_id : null,
		Init : function(current_hashtag_id) {
			$('#' + WeightedAggregateModel.id).hide();
			WeightedAggregateModel.current_hashtag_id = current_hashtag_id;
			WeightedAggregateModel.animated_heat_map = new AnimatedHeatMap(WeightedAggregateModel.id, WeightedAggregateModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate);
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score) {
			// var ltuo_lattice_and_pure_influence_score = [[[24.20689, 18.28125], 1]];
			var ltuo_lattice_and_pure_influence_score = LocationsInOrderOfSpread.Get(WeightedAggregateModel.id, WeightedAggregateModel.current_hashtag_id);
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		},
		ReloadModel : function(hashtag_id, hashtag_text) {
			WeightedAggregateModel.current_hashtag_id = hashtag_id;
			WeightedAggregateModel.animated_heat_map.Reload();
		},
	}

	var current_hashtag_id = HashtagsMenu.GetHashtagsId();
	FirstOccurrenceModel.Init(current_hashtag_id);
	WeightedAggregateModel.Init(current_hashtag_id);

	HashtagsMenu.AddFunctionToChangeChain(FirstOccurrenceModel.ReloadModel);
	HashtagsMenu.AddFunctionToChangeChain(WeightedAggregateModel.ReloadModel);

	function GetModelId(element) {
		var split_result = $(element).attr('id').split('_');
		return split_result[0] + '_' + split_result[1] + '_' + split_result[2]
	}


	$('.diffusion-models li a ').toggle(function() {
		model_id = GetModelId(this);
		$('#' + model_id).show(1000);
		// this.
		// alert(GetModelId(this));
	}, function() {
		model_id = GetModelId(this);
		$('#' + model_id).hide(1000);
	});

});


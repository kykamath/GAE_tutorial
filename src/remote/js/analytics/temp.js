$(document).ready(function() {
	
	FirstOccurrenceModel = {
		id : 'first_occurrence_model',
		Init : function(id){
			new AnimatedHeatMap(FirstOccurrenceModel.id, FirstOccurrenceModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate);
			$('#'+FirstOccurrenceModel.id).hide();
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score){
			var ltuo_lattice_and_pure_influence_score = [[[24.20689, 18.28125], 1], [[24.20689, 18.28125], 4], [[56.944974, -115.664062], 4]];
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		}
	}
	
	WeightedAggregateModel = {
		id : 'weighted_aggregate_model',
		Init : function(id){
			$('#'+WeightedAggregateModel.id).hide();
			new AnimatedHeatMap(WeightedAggregateModel.id, WeightedAggregateModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate);
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score){
			var ltuo_lattice_and_pure_influence_score = [[[24.20689, 18.28125], 1]];
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		}
	}
	
	FirstOccurrenceModel.Init();
	WeightedAggregateModel.Init();
	
	function GetModelId(element){
		var split_result = $(element).attr('id').split('_');
		return split_result[0]+'_'+split_result[1]+'_'+split_result[2]
	}
	$('.diffusion-models li a ').toggle(function() {
		model_id = GetModelId(this);
		$('#'+model_id).show(1000);
		// this.
		// alert(GetModelId(this));
	}, function() {
		model_id = GetModelId(this);
		$('#'+model_id).hide(1000);
	});
	
	
});


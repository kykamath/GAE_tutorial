$(document).ready(function() {
	
	FirstOccurrenceModel = {
		id : 'first_occurrence_model',
		Init : function(id){
			AnimatedHeatMap.Init(FirstOccurrenceModel.id, FirstOccurrenceModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate)
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score){
			var ltuo_lattice_and_pure_influence_score = [[[24.20689, 18.28125], 1], [[24.20689, 18.28125], 4], [[56.944974, -115.664062], 4]];
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		}
	}
	
	FirstOccurrenceModel.Init()
});


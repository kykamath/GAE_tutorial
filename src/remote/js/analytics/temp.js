$(document).ready(function() {
	
	FirstOccurrenceModel = {
		id : 'first_occurrence_model',
		Init : function(id){
			// AnimatedHeatMap.Init(FirstOccurrenceModel.id, FirstOccurrenceModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate)
			new AnimatedHeatMap(FirstOccurrenceModel.id, FirstOccurrenceModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate);
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score){
			var ltuo_lattice_and_pure_influence_score = [[[24.20689, 18.28125], 1], [[24.20689, 18.28125], 4], [[56.944974, -115.664062], 4]];
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		}
	}
	
	WeightedAggregateModel = {
		id : 'weighted_aggregate_model',
		Init : function(id){
			// AnimatedHeatMap.Init(WeightedAggregateModel.id, WeightedAggregateModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate)
			new AnimatedHeatMap(WeightedAggregateModel.id, WeightedAggregateModel.function_to_get_ltuo_lattice_and_pure_influence_score_and_animate);
		},
		function_to_get_ltuo_lattice_and_pure_influence_score_and_animate : function(cbf_in_ltuo_lattice_and_pure_influence_score){
			var ltuo_lattice_and_pure_influence_score = [[[24.20689, 18.28125], 1]];
			cbf_in_ltuo_lattice_and_pure_influence_score(ltuo_lattice_and_pure_influence_score);
		}
	}
	
	FirstOccurrenceModel.Init();
	WeightedAggregateModel.Init();
	
	
	
	// function C1(a){
		// var self = this;
		// this.a = a;
	// }
	// C1.prototype.add = function(val){
		// this.a+=val;
		// alert(this.a);
	// }
// 	
	// c1 = new C1(10);
	// c2 = new C1(0);
	// c1.add(5);
	// c2.add(10);
	
});


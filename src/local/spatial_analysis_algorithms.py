
'''
Created on May 2, 2012

@author: krishnakamath
'''
from settings import LATTICE_ACCURACY, MIN_OCCURRENCES_IN_A_LOCATION, \
    UNIT_TIME_UNIT_IN_SECONDS, UNIT_LATTICE_ACCURACY
from library.geo import getLattice, getLatticeLid, getLidFromLocation,\
    getRadiusOfGyration
import numpy as np
from operator import itemgetter
from itertools import groupby
from library.classes import GeneralMethods

LOCATIONS_ORDER_FIRST_OCCURRENCE_MODEL = 'first_occurrence_model'
LOCATIONS_ORDER_WEIGHTED_AVERAGE_MODEL = 'weighted_aggregate_model'

class SpatialAnalysisAlgorithms():
    @staticmethod
    def _get_occurrences_stats(occurrences1, occurrences2):
        no_of_occurrences_after_appearing_in_location, no_of_occurrences_before_appearing_in_location = 0., 0.
        occurrences1 = sorted(occurrences1)
        occurrences2 = sorted(occurrences2)
        no_of_total_occurrences_between_location_pair = len(occurrences1) * len(occurrences2) * 1.
        for occurrence1 in occurrences1:
            for occurrence2 in occurrences2:
                if occurrence1 < occurrence2: no_of_occurrences_after_appearing_in_location += 1
                elif occurrence1 > occurrence2: no_of_occurrences_before_appearing_in_location += 1
        return no_of_occurrences_after_appearing_in_location, no_of_occurrences_before_appearing_in_location, no_of_total_occurrences_between_location_pair
    @staticmethod
    def _weighted_aggregate_occurrence(location_occurrences, neighbor_location_occurrences):
        (no_of_occurrences_after_appearing_in_location, \
         no_of_occurrences_before_appearing_in_location, \
         no_of_total_occurrences_between_location_pair) = \
            SpatialAnalysisAlgorithms._get_occurrences_stats(location_occurrences, neighbor_location_occurrences)
        total_nof_occurrences = float(len(location_occurrences) + len(neighbor_location_occurrences))
        ratio_of_occurrences_in_location = len(location_occurrences) / total_nof_occurrences
        ratio_of_occurrences_in_neighbor_location = len(neighbor_location_occurrences) / total_nof_occurrences
        return (
                ratio_of_occurrences_in_location * no_of_occurrences_after_appearing_in_location \
                - ratio_of_occurrences_in_neighbor_location * no_of_occurrences_before_appearing_in_location
                ) / no_of_total_occurrences_between_location_pair
    @staticmethod
    def _get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time):
        return [(point, getLattice(point, UNIT_LATTICE_ACCURACY), GeneralMethods.approximateEpoch(occurrence_time, UNIT_TIME_UNIT_IN_SECONDS)) 
         for point, occurrence_time in ltuo_point_and_occurrence_time]
    @staticmethod
    def _get_valid_occurrences(ltuo_point_and_lattice_and_normalized_occurrence_time, min_occurrences = MIN_OCCURRENCES_IN_A_LOCATION):
        ltuo_lattice_and_no_of_occurrences = [(lattice, len(list(ito_ltuo_point_and_lattice_and_normalized_occurrence_time)))
            for lattice, ito_ltuo_point_and_lattice_and_normalized_occurrence_time in 
                groupby(
                    sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(1)),
                    key=itemgetter(1)
                )
         ]
        ltuo_valid_lattices_and_no_of_occurrences = filter(
                                lambda (lattice, no_of_occurrences):no_of_occurrences>=min_occurrences,
                                ltuo_lattice_and_no_of_occurrences
                                )
        if ltuo_valid_lattices_and_no_of_occurrences:
            valid_lattices = zip(*ltuo_valid_lattices_and_no_of_occurrences)[0]
            return filter(
                   lambda tuo_point_and_lattice_and_normalized_occurrence_time: tuo_point_and_lattice_and_normalized_occurrence_time[1] in valid_lattices,
                   ltuo_point_and_lattice_and_normalized_occurrence_time
                   )
        else:
            return []
    @staticmethod
    def GetLocationsInOrderOfInfluenceSpread(model_id, ltuo_point_and_occurrence_time):
        if model_id==LOCATIONS_ORDER_FIRST_OCCURRENCE_MODEL: 
            return SpatialAnalysisAlgorithms._GetLocationsInOrderOfInfluenceSpreadFirstOccurrenceModel(ltuo_point_and_occurrence_time)
        else:
            return SpatialAnalysisAlgorithms._GetLocationsInOrderOfInfluenceSpreadWeightedAverageModel(ltuo_point_and_occurrence_time)
#    @staticmethod
#    def _GetLocationsInOrderOfInfluenceSpreadWeightedAverageModel(ltuo_point_and_occurrence_time):
#        def _shift_range(score):
#            if score==-1: score=-0.99
#            return 1./(score+1)
#        ltuo_point__lattice__normalized_occurrence_time = \
#            SpatialAnalysisAlgorithms._get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time)
#        ltuo_point_and_lattice_and_normalized_occurrence_time = SpatialAnalysisAlgorithms._get_valid_occurrences(ltuo_point__lattice__normalized_occurrence_time)
#        ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time =\
#                                            [(lattice, sorted(ito_ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(2)))
#                                                for lattice, ito_ltuo_point_and_lattice_and_normalized_occurrence_time in
#                                                    groupby(
#                                                            sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(1)),
#                                                            key=itemgetter(1)
#                                                    )
#                                            ]
#        ltuo_lattice_and_points = []
#        ltuo_lattice_and_normalized_occurrence_times = []
#        for lattice, ltuo_point_and_lattice_and_normalized_occurrence_time in \
#                ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time:
#            points, _, normalized_occurrence_times = zip(*ltuo_point_and_lattice_and_normalized_occurrence_time)
#            ltuo_lattice_and_points.append([lattice, points])
#            ltuo_lattice_and_normalized_occurrence_times.append([lattice, normalized_occurrence_times])
#        ltuo_lattice_and_pure_influence_score = []
#        for lattice, lattice_occurrence_times in ltuo_lattice_and_normalized_occurrence_times:
#            pure_influence_scores = []
#            for neighbor_lattice, neighbor_lattice_occurrence_times in ltuo_lattice_and_normalized_occurrence_times:
#                if lattice != neighbor_lattice:
#                    pure_influence_score = SpatialAnalysisAlgorithms._weighted_aggregate_occurrence(neighbor_lattice_occurrence_times, lattice_occurrence_times)
#                    pure_influence_scores.append(pure_influence_score)
#            ltuo_lattice_and_pure_influence_score.append([lattice, np.mean(pure_influence_scores)])
#        ltuo_lattice_and_range_shifted_score = \
#            [(lattice, _shift_range(pure_influence_score))for lattice, pure_influence_score in ltuo_lattice_and_pure_influence_score]
#        return filter(lambda (lattice, range_shifted_score): str(range_shifted_score)!='nan', ltuo_lattice_and_range_shifted_score)
    @staticmethod
    def _GetLocationsInOrderOfInfluenceSpreadWeightedAverageModel(ltuo_point_and_occurrence_time):
        def _shift_range(score):
            if score==-1: score=-0.99
            return 1./(score+1)
        total_no_of_occurrences = float(len(ltuo_point_and_occurrence_time))
        ltuo_point__lattice__normalized_occurrence_time = \
            SpatialAnalysisAlgorithms._get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time)
        ltuo_point_and_lattice_and_normalized_occurrence_time = SpatialAnalysisAlgorithms._get_valid_occurrences(ltuo_point__lattice__normalized_occurrence_time)
        ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time =\
                                            [(lattice, sorted(ito_ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(2)))
                                                for lattice, ito_ltuo_point_and_lattice_and_normalized_occurrence_time in
                                                    groupby(
                                                            sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(1)),
                                                            key=itemgetter(1)
                                                    )
                                            ]
        ltuo_lattice_and_no_of_occurrences = []
        ltuo_lattice_and_normalized_occurrence_times = []
        for lattice, ltuo_point_and_lattice_and_normalized_occurrence_time in \
                ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time:
            points, _, normalized_occurrence_times = zip(*ltuo_point_and_lattice_and_normalized_occurrence_time)
            ltuo_lattice_and_no_of_occurrences.append([lattice, len(points)])
            ltuo_lattice_and_normalized_occurrence_times.append([lattice, normalized_occurrence_times])
        mf_lattice_to_no_of_occurrences = dict([(getLatticeLid(lattice), no_of_occurrences)
                                                for lattice, no_of_occurrences in ltuo_lattice_and_no_of_occurrences])
        ltuo_lattice_and_pure_influence_score = []
        for lattice, lattice_occurrence_times in ltuo_lattice_and_normalized_occurrence_times:
            pure_influence_scores = []
            for neighbor_lattice, neighbor_lattice_occurrence_times in ltuo_lattice_and_normalized_occurrence_times:
                if lattice != neighbor_lattice:
                    pure_influence_score = SpatialAnalysisAlgorithms._weighted_aggregate_occurrence(neighbor_lattice_occurrence_times, lattice_occurrence_times)
                    pure_influence_scores.append(pure_influence_score)
            ltuo_lattice_and_pure_influence_score.append([lattice, np.mean(pure_influence_scores)])
        ltuo_lattice_and_range_shifted_score = \
            [(lattice, _shift_range(pure_influence_score))for lattice, pure_influence_score in ltuo_lattice_and_pure_influence_score]
        ltuo_lattice_and_range_shifted_score = filter(lambda (lattice, range_shifted_score): str(range_shifted_score)!='nan', ltuo_lattice_and_range_shifted_score)
        ltuo_lattice_and_normalized_range_shifted_score = [(lattice, range_shifted_score*(mf_lattice_to_no_of_occurrences[getLatticeLid(lattice)]/total_no_of_occurrences)) 
                for lattice, range_shifted_score in ltuo_lattice_and_range_shifted_score]
        return sorted(ltuo_lattice_and_normalized_range_shifted_score, key=itemgetter(1), reverse=True)
    @staticmethod
    def _GetLocationsInOrderOfInfluenceSpreadFirstOccurrenceModel(ltuo_point_and_occurrence_time):
        ltuo_point__lattice__normalized_occurrence_time = \
            SpatialAnalysisAlgorithms._get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time)
        ltuo_point_and_lattice_and_normalized_occurrence_time = SpatialAnalysisAlgorithms._get_valid_occurrences(ltuo_point__lattice__normalized_occurrence_time)
#        ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time =\
#                                            [(lattice, sorted(ito_ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(2)))
#                                                for lattice, ito_ltuo_point_and_lattice_and_normalized_occurrence_time in
#                                                    groupby(
#                                                            sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(1)),
#                                                            key=itemgetter(1)
#                                                    )
#                                            ]
        return [(lattice, 1)
         for _, lattice, _ in  
         sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(2))
         ]
#        ltuo_lattice_and_points = []
#        ltuo_lattice_and_min_normalized_occurrence_times_and_no_of_occurrences = []
#        for lattice, ltuo_point_and_lattice_and_normalized_occurrence_time in \
#                ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time:
#            points, _, normalized_occurrence_times = zip(*ltuo_point_and_lattice_and_normalized_occurrence_time)
#            ltuo_lattice_and_points.append([lattice, points])
#            ltuo_lattice_and_min_normalized_occurrence_times_and_no_of_occurrences.append([lattice, min(normalized_occurrence_times), len(normalized_occurrence_times)])
#        ltuo_lattice_sorted_by_occurrence_time_and_no_of_occurrences \
#            = [(lattice, no_of_occurrences) for lattice, _, no_of_occurrences in 
#                sorted(ltuo_lattice_and_min_normalized_occurrence_times_and_no_of_occurrences, key=itemgetter(1))]
#        return ltuo_lattice_sorted_by_occurrence_time_and_no_of_occurrences    
#    @staticmethod
#    def _GetLocationsInOrderOfInfluenceSpreadFirstOccurrenceModel(ltuo_point_and_occurrence_time):
#        ltuo_point__lattice__normalized_occurrence_time = \
#            SpatialAnalysisAlgorithms._get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time)
#        ltuo_point_and_lattice_and_normalized_occurrence_time = SpatialAnalysisAlgorithms._get_valid_occurrences(ltuo_point__lattice__normalized_occurrence_time)
#        ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time =\
#                                            [(lattice, sorted(ito_ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(2)))
#                                                for lattice, ito_ltuo_point_and_lattice_and_normalized_occurrence_time in
#                                                    groupby(
#                                                            sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(1)),
#                                                            key=itemgetter(1)
#                                                    )
#                                            ]
#        ltuo_lattice_and_points = []
#        ltuo_lattice_and_min_normalized_occurrence_times_and_no_of_occurrences = []
#        for lattice, ltuo_point_and_lattice_and_normalized_occurrence_time in \
#                ltuo_lattice_and_ltuo_point_and_lattice_and_normalized_occurrence_time:
#            points, _, normalized_occurrence_times = zip(*ltuo_point_and_lattice_and_normalized_occurrence_time)
#            ltuo_lattice_and_points.append([lattice, points])
#            ltuo_lattice_and_min_normalized_occurrence_times_and_no_of_occurrences.append([lattice, min(normalized_occurrence_times), len(normalized_occurrence_times)])
#        ltuo_lattice_sorted_by_occurrence_time_and_no_of_occurrences \
#            = [(lattice, no_of_occurrences) for lattice, _, no_of_occurrences in 
#                sorted(ltuo_lattice_and_min_normalized_occurrence_times_and_no_of_occurrences, key=itemgetter(1))]
#        return ltuo_lattice_sorted_by_occurrence_time_and_no_of_occurrences    
    @staticmethod
    def GetSpreadRadiusByTime(ltuo_point_and_occurrence_time):
        ltuo_point__lattice__normalized_occurrence_time = \
            SpatialAnalysisAlgorithms._get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time)
        ltuo_point__lattice__normalized_occurrence_time = SpatialAnalysisAlgorithms._get_valid_occurrences(ltuo_point__lattice__normalized_occurrence_time)
        ltuo_normalized_occurrence_time_and_points = [(normalized_occurrence_time, zip(*ito_ltuo_point__lattice__normalized_occurrence_time)[0])
            for normalized_occurrence_time, ito_ltuo_point__lattice__normalized_occurrence_time in
                groupby(
                        sorted(ltuo_point__lattice__normalized_occurrence_time, key=itemgetter(2)),
                        key=itemgetter(2)
                )
        ]
        return [(normalized_occurrence_time, getRadiusOfGyration(points)) 
                    for normalized_occurrence_time, points in ltuo_normalized_occurrence_time_and_points]
    @staticmethod
    def GetSpatialDistribution(ltuo_point_and_occurrence_time):
        ltuo_point__lattice__normalized_occurrence_time = \
            SpatialAnalysisAlgorithms._get_ltuo_point_and_lattice_and_normalized_occurrence_time(ltuo_point_and_occurrence_time)
        ltuo_point_and_lattice_and_normalized_occurrence_time = SpatialAnalysisAlgorithms._get_valid_occurrences(ltuo_point__lattice__normalized_occurrence_time, 3)
        ltuo_lattice_and_no_of_occurrences = [(lattice, len(list(ito_ltuo_point_and_lattice_and_normalized_occurrence_time)))
            for lattice, ito_ltuo_point_and_lattice_and_normalized_occurrence_time in 
                groupby(
                    sorted(ltuo_point_and_lattice_and_normalized_occurrence_time, key=itemgetter(1)),
                    key=itemgetter(1)
                )
        ]
#        return ltuo_lattice_and_no_of_occurrences
        return [(lattice, np.log(no_of_occurrences)) for lattice, no_of_occurrences in ltuo_lattice_and_no_of_occurrences]
        
        

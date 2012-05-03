
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
    def GetLocationsInOrderOfInfluenceSpread(ltuo_point_and_occurrence_time):
        ltuo_lattice_and_occurrence_time = [[getLattice(point, LATTICE_ACCURACY), occurrence_time]for point, occurrence_time in ltuo_point_and_occurrence_time]
        ltuo_lattice_and_occurrence_times = [(location, sorted(zip(*ito_location_and_occurrence_time)[1]))
                                                for location, ito_location_and_occurrence_time in
                                                    groupby(
                                                            sorted(ltuo_lattice_and_occurrence_time, key=itemgetter(0)),
                                                            key=itemgetter(0)
                                                    )
                                            ] 
        ltuo_lattice_and_pure_influence_score = []
        for lattice, lattice_occurrence_times in ltuo_lattice_and_occurrence_times:
            pure_influence_scores = []
            for neighbor_lattice, neighbor_lattice_occurrence_times in ltuo_lattice_and_occurrence_times:
                if lattice != neighbor_lattice:
                    pure_influence_score = SpatialAnalysisAlgorithms._weighted_aggregate_occurrence(neighbor_lattice_occurrence_times, lattice_occurrence_times)
                    pure_influence_scores.append(pure_influence_score)
            ltuo_lattice_and_pure_influence_score.append([lattice, np.mean(pure_influence_scores)])
        lattices = zip(*sorted(ltuo_lattice_and_pure_influence_score, key=itemgetter(1)))[0]
        return [[lattice, 1] for lattice in lattices]
#        return sorted(ltuo_lattice_and_pure_influence_score, key=itemgetter(1))
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
        return ltuo_lattice_and_no_of_occurrences
        
        

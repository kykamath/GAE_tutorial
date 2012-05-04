'''
Created on Apr 29, 2012

@author: kykamath


location => lattice id for point based on UNIT_LATTICE_ACCURACY

'''
import urllib, urllib2, cjson, time, os, json
from datetime import datetime, timedelta
from settings import INTERVAL_IN_MINUTES, \
        TOP_HASHTAGS_WINDOW_IN_MINUTES, \
        NO_OF_TOP_HASHTAGS, BLOCKED_HASHTAGS, \
        f_hashtags_geo_distribution, MACHINE_NAME, \
        UPDATE_FREQUENCY_IN_MINUTES, APPLICATION_URL, \
        UNIT_TIME_UNIT_IN_SECONDS, \
        UNIT_LATTICE_ACCURACY, TOTAL_ANALYSIS_WINDOW_IN_MINUTES, \
        NO_OF_EXTRA_HASHTAGS
from library.file_io import FileIO
from library.twitter import getDateTimeObjectFromTweetTimestamp
from collections import defaultdict
from operator import itemgetter
from itertools import groupby
from library.geo import getLatticeLid
from library.classes import GeneralMethods
from spatial_analysis_algorithms import SpatialAnalysisAlgorithms

dummy_mf_hashtag_to_ltuo_point_and_occurrence_time = {
                                                      'ht1': [([40.245992, -114.082031], 1), ([42.032974, -99.052734], 3)],
                                                      'ht2': [([24.20689, 18.28125], 1), ([24.20689, 18.28125], 4), ([56.944974, -115.664062], 4)],
                                                      'ht3': [([-10.833306, -54.84375], 3), ([40.178873, -2.8125], 4)],
                                                      'ht4': [([37.509726, -113.291016], 1), ([45.089036, -102.041016], 4), ([33.358062, -91.230469], 5), ([40.713956, -76.025391], 6)]
                                                      }

def GetOutputFile(t):
    return f_hashtags_geo_distribution % (t.year, t.month, t.day, t.hour, (int(t.minute) / INTERVAL_IN_MINUTES) * INTERVAL_IN_MINUTES)

def get_chart_data_key(chart_id, hashtag_id):
    return '%s_%s'%(chart_id, hashtag_id)

class TweetStreamDataProcessing:
    @staticmethod
    def _ParseHashtagObjects(checkin):
        if 'geo' in checkin: point = checkin['geo']
        else: point = checkin['bb']
        # Adding 30 minutes because stream appears to be delayed by 30 minutes
        t = time.mktime(getDateTimeObjectFromTweetTimestamp(checkin['t']).timetuple()) + 1800.
        for h in checkin['h']: yield h.lower(), [point, t]
    @staticmethod
    def get_tuo_hashtag_and_ltuo_occurrence_time_and_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        hashtag_and_ltuo_occurrence_time_and_locations = \
            [(
              top_hashtag.split()[0],
              [ (GeneralMethods.approximateEpoch(occurrence_time, UNIT_TIME_UNIT_IN_SECONDS), getLatticeLid(point, UNIT_LATTICE_ACCURACY))
                     for point, occurrence_time in mf_hashtag_to_ltuo_point_and_occurrence_time[top_hashtag.split()[0]]
                 ]
              )
                for top_hashtag in top_hashtags
            ]
        tuo_hashtag_and_ltuo_occurrence_time_and_locations = []
        for hashtag, ltuo_occurrence_time_and_locations in hashtag_and_ltuo_occurrence_time_and_locations:
            ltuo_occurrence_time_and_locations = [(occurrence_time, zip(*ito_ltuo_occurrence_time_and_locations)[1])
                for occurrence_time, ito_ltuo_occurrence_time_and_locations in 
                    groupby(
                            sorted(ltuo_occurrence_time_and_locations, key=itemgetter(0)),
                            key=itemgetter(0)
                    )
             ]
            tuo_hashtag_and_ltuo_occurrence_time_and_locations.append((hashtag, ltuo_occurrence_time_and_locations))
        return tuo_hashtag_and_ltuo_occurrence_time_and_locations
    @staticmethod
    def load_mf_hashtag_to_ltuo_point_and_occurrence_time(WINDOW_IN_MINUTES):
        def is_unicode(hashtag):
            try:
                hashtag.decode('ascii')
            except Exception: return False
            return True
        mf_hashtag_to_ltuo_point_and_occurrence_time = defaultdict(list)
        # Subtracting because stream appears to be delayed by an hour
        dt_current_time = datetime.fromtimestamp(time.mktime(time.gmtime(time.time()))) - timedelta(hours=1)
        td_interval = timedelta(seconds=INTERVAL_IN_MINUTES * 60)
        td_window = timedelta(seconds= WINDOW_IN_MINUTES * 60)
        dt_next_time = dt_current_time - td_window
        while dt_next_time < dt_current_time:
            f_input = GetOutputFile(dt_next_time)
            if os.path.exists(f_input):
                print 'Processing:', f_input
                for checkin in FileIO.iterateJsonFromFile(f_input):
                    for hashtag, point_and_occurrence_time in \
                            TweetStreamDataProcessing._ParseHashtagObjects(checkin):
                        if hashtag not in BLOCKED_HASHTAGS and is_unicode(hashtag):
                            mf_hashtag_to_ltuo_point_and_occurrence_time[hashtag].append(point_and_occurrence_time)
            dt_next_time += td_interval
        return mf_hashtag_to_ltuo_point_and_occurrence_time
    @staticmethod
    def get_top_hashtags(no_of_hashtags):
        mf_hashtag_to_ltuo_point_and_occurrence_time = TweetStreamDataProcessing.load_mf_hashtag_to_ltuo_point_and_occurrence_time(TOP_HASHTAGS_WINDOW_IN_MINUTES)
        return [ '%s (%s)' % (hashtag, len(ltuo_point_and_occurrence_time))
                    for hashtag, ltuo_point_and_occurrence_time in 
                       sorted(
                          mf_hashtag_to_ltuo_point_and_occurrence_time.iteritems(),
                          key=lambda (hashtag, ltuo_point_and_occurrence_time): len(ltuo_point_and_occurrence_time),
                          reverse=True
                          )[:no_of_hashtags]
                ]
    @staticmethod
    def get_extra_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags, no_of_hashtags):
        extra_hastags = []
        hashtags = [ '%s (%s)' % (hashtag, len(ltuo_point_and_occurrence_time))
                                                for hashtag, ltuo_point_and_occurrence_time in 
                                                   sorted(
                                                        mf_hashtag_to_ltuo_point_and_occurrence_time.iteritems(), 
                                                        key=lambda (hashtag, ltuo_point_and_occurrence_time): len(ltuo_point_and_occurrence_time),
                                                        reverse=True
                                                    )
                                              ]
        for hashtag in hashtags:
            if len(extra_hastags) < no_of_hashtags:
                if hashtag not in top_hashtags: extra_hastags.append(hashtag)
            else: break
        return extra_hastags
                
    @staticmethod
    def get_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        return [
                ['%s,%s' % tuple(point) for point, _ in mf_hashtag_to_ltuo_point_and_occurrence_time[top_hashtag.split()[0]]]
                for top_hashtag in top_hashtags
                ]
    @staticmethod
    def get_locations_in_order_of_influence_spread(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        locations_in_order_of_influence_spread = []
        for top_hashtag in top_hashtags:
            ltuo_point_and_occurrence_time = mf_hashtag_to_ltuo_point_and_occurrence_time[top_hashtag.split()[0]]
            locations_in_order_of_influence_spread.append(
                  SpatialAnalysisAlgorithms.GetLocationsInOrderOfInfluenceSpread(ltuo_point_and_occurrence_time)
            )
        return locations_in_order_of_influence_spread

    @staticmethod
    def SpatialDistribution(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        ltuo_lattice_and_no_of_occurrences = []
        for top_hashtag in top_hashtags:
            ltuo_point_and_occurrence_time = mf_hashtag_to_ltuo_point_and_occurrence_time[top_hashtag.split()[0]]
            ltuo_lattice_and_no_of_occurrences.append(
                                                        SpatialAnalysisAlgorithms.GetSpatialDistribution(ltuo_point_and_occurrence_time)
                                                  )
        return ltuo_lattice_and_no_of_occurrences
class Charts:
    ID_SPREAD_VIRALITY_CHART = 'SpreadViralityChart'
    ID_TEMPORAL_DISTRIBUTION_CHART = 'TemporalDistribution'
    ID_LOCATION_ACCUMULATION = 'LocationAccumulation'
    ID_RADIUS = 'Radius'
    @staticmethod
    def getTimeTuple(t):
        t_struct = time.localtime(t - 19800)
        return (t_struct.tm_year, t_struct.tm_mon, t_struct.tm_mday, t_struct.tm_hour, t_struct.tm_min, t_struct.tm_sec)
    @staticmethod
    def _SpreadViralityChart(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        '''
        [{
            name : 'Winter 2007-2008',
            data : [[Date.UTC(1970, 9, 27), 0], [Date.UTC(1970, 10, 10), 0.6]]
        }]
        '''
        tuo_hashtag_and_ltuo_occurrence_time_and_total_no_of_observed_locations = []
        tuo_hashtag_and_ltuo_occurrence_time_and_locations = \
            TweetStreamDataProcessing.get_tuo_hashtag_and_ltuo_occurrence_time_and_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags)
        for hashtag, ltuo_occurrence_time_and_locations in \
                tuo_hashtag_and_ltuo_occurrence_time_and_locations:
            so_observed_locations = set()
            ltuo_occurrence_time_and_total_no_of_observed_locations = []
            for occurrence_time, locations in ltuo_occurrence_time_and_locations:
                no_of_new_locations = len(set(locations).difference(so_observed_locations))
                so_observed_locations = so_observed_locations.union(set(locations))
                ltuo_occurrence_time_and_total_no_of_observed_locations.append([occurrence_time, no_of_new_locations])
            tuo_hashtag_and_ltuo_occurrence_time_and_total_no_of_observed_locations.append([hashtag, ltuo_occurrence_time_and_total_no_of_observed_locations])
        chart_data = []
        for hashtag, ltuo_occurrence_time_and_total_no_of_observed_locations in \
                tuo_hashtag_and_ltuo_occurrence_time_and_total_no_of_observed_locations:
            chart_data.append({
                               'name': hashtag,
                               'data': [ (Charts.getTimeTuple(occurrence_time), total_no_of_observed_locations) 
                                            for occurrence_time, total_no_of_observed_locations in ltuo_occurrence_time_and_total_no_of_observed_locations],
                               'showInLegend': False
                               })
        return chart_data
#        tuo_hashtag_and_ltuo_occurrence_time_and_locations = \
#            TweetStreamDataProcessing.get_tuo_hashtag_and_ltuo_occurrence_time_and_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags)
#        char_data = []
#        for hashtag, ltuo_occurrence_time_and_locations in tuo_hashtag_and_ltuo_occurrence_time_and_locations:
#            ltuo_occurrence_time_and_no_of_unique_locations = [(Charts.getTimeTuple(occurrence_time), len(set(locations))) for occurrence_time, locations in ltuo_occurrence_time_and_locations]
#            char_data.append({
#                                  'name': hashtag, 
#                                  'data': ltuo_occurrence_time_and_no_of_unique_locations, 
#                                  'showInLegend': False
#                              })
#        return char_data
    @staticmethod
    def _TemporalDistribution(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        tuo_hashtag_and_ltuo_occurrence_time_and_no_of_occurrences = []
        mf_occurrence_time_to_no_of_occurrences = defaultdict(float)
        for hashtag in top_hashtags:
            hashtag = hashtag.split()[0]
            ltuo_point_and_occurrence_time = mf_hashtag_to_ltuo_point_and_occurrence_time[hashtag]
            for _, occurrence_time in ltuo_point_and_occurrence_time:
                mf_occurrence_time_to_no_of_occurrences[GeneralMethods.approximateEpoch(occurrence_time, UNIT_TIME_UNIT_IN_SECONDS)] += 1
            tuo_hashtag_and_ltuo_occurrence_time_and_no_of_occurrences.append([
                                      hashtag,
                                      sorted(
                                             mf_occurrence_time_to_no_of_occurrences.iteritems(),
                                             key=itemgetter(0)
                                             )
                            ])
        chart_data = []
        for hashtag, ltuo_occurrence_time_and_no_of_occurrences in \
                tuo_hashtag_and_ltuo_occurrence_time_and_no_of_occurrences:
            chart_data.append({
                               'name': hashtag,
                               'data': [ (Charts.getTimeTuple(occurrence_time), no_of_occurrences) for occurrence_time, no_of_occurrences in ltuo_occurrence_time_and_no_of_occurrences],
                               'showInLegend': False
                               })
        return chart_data
    @staticmethod
    def _LocationAccumulation(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        tuo_hashtag_and_ltuo_occurrence_time_and_total_no_of_observed_locations = []
        tuo_hashtag_and_ltuo_occurrence_time_and_locations = \
            TweetStreamDataProcessing.get_tuo_hashtag_and_ltuo_occurrence_time_and_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags)
        for hashtag, ltuo_occurrence_time_and_locations in \
                tuo_hashtag_and_ltuo_occurrence_time_and_locations:
            so_observed_locations = set()
            ltuo_occurrence_time_and_total_no_of_observed_locations = []
            for occurrence_time, locations in ltuo_occurrence_time_and_locations:
                so_observed_locations = so_observed_locations.union(set(locations))
                ltuo_occurrence_time_and_total_no_of_observed_locations.append([occurrence_time, len(so_observed_locations)])
            tuo_hashtag_and_ltuo_occurrence_time_and_total_no_of_observed_locations.append([hashtag, ltuo_occurrence_time_and_total_no_of_observed_locations])
        chart_data = []
        for hashtag, ltuo_occurrence_time_and_total_no_of_observed_locations in \
                tuo_hashtag_and_ltuo_occurrence_time_and_total_no_of_observed_locations:
            chart_data.append({
                               'name': hashtag,
                               'data': [ (Charts.getTimeTuple(occurrence_time), total_no_of_observed_locations) 
                                            for occurrence_time, total_no_of_observed_locations in ltuo_occurrence_time_and_total_no_of_observed_locations],
                               'showInLegend': False
                               })
        return chart_data
    @staticmethod
    def _Radius(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        tuo_hashtag_and_ltuo_normalized_occurrence_time_and_radius = []
        for top_hashtag in top_hashtags:
            ltuo_point_and_occurrence_time = mf_hashtag_to_ltuo_point_and_occurrence_time[top_hashtag.split()[0]]
            tuo_hashtag_and_ltuo_normalized_occurrence_time_and_radius.append([
                                                                               top_hashtag,
                                                                  SpatialAnalysisAlgorithms.GetSpreadRadiusByTime(ltuo_point_and_occurrence_time)
                                                                  ])
        chart_data = []
        for hashtag, ltuo_normalized_occurrence_time_and_radius in \
                tuo_hashtag_and_ltuo_normalized_occurrence_time_and_radius:
            chart_data.append({
                               'name': hashtag,
                               'data': [ (Charts.getTimeTuple(normalized_occurrence_time), radius) 
                                            for normalized_occurrence_time, radius in ltuo_normalized_occurrence_time_and_radius],
                               'showInLegend': False
                               })
        return chart_data
    @staticmethod
    def get_charts_data(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        return {
                Charts.ID_SPREAD_VIRALITY_CHART: Charts._SpreadViralityChart(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags),
                Charts.ID_TEMPORAL_DISTRIBUTION_CHART: Charts._TemporalDistribution(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags),
                Charts.ID_LOCATION_ACCUMULATION: Charts._LocationAccumulation(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags),
                Charts.ID_RADIUS: Charts._Radius(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags),
                }
def update_memcache(key, value):
#    value = cjson.encode(value)
    value = json.dumps(value, separators=(',',':'))
    url = APPLICATION_URL + 'update_memcache'
    req = urllib2.Request(url)
    req.add_data(urllib.urlencode({'key': key, 'value': value}))
    return urllib2.urlopen(req)

def update_remote_data():
#    if MACHINE_NAME == 'kykamath.cs.tamu.edu':
#        if APPLICATION_URL=='http://localhost:8080/': 
#            print 'Wrong remote application url: ', APPLICATION_URL
#            print 'Remote memcache not updated. Change remote application url. Program exiting.'
#            exit()
    mf_hashtag_to_ltuo_point_and_occurrence_time = TweetStreamDataProcessing.load_mf_hashtag_to_ltuo_point_and_occurrence_time(TOTAL_ANALYSIS_WINDOW_IN_MINUTES)
#    else: 
#        mf_hashtag_to_ltuo_point_and_occurrence_time = dummy_mf_hashtag_to_ltuo_point_and_occurrence_time
    top_hashtags = TweetStreamDataProcessing.get_top_hashtags(NO_OF_TOP_HASHTAGS)
    extra_hashtags = TweetStreamDataProcessing.get_extra_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags, NO_OF_EXTRA_HASHTAGS)
    required_hashtags = top_hashtags+extra_hashtags
    locations = TweetStreamDataProcessing.get_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, required_hashtags)
    locations_in_order_of_influence_spread = TweetStreamDataProcessing.get_locations_in_order_of_influence_spread(mf_hashtag_to_ltuo_point_and_occurrence_time, required_hashtags)
    charts_data = Charts.get_charts_data(mf_hashtag_to_ltuo_point_and_occurrence_time, required_hashtags)
    mf_memcache_key_to_value = dict([
                                 ('hashtags', top_hashtags),
                                 ('all_hashtags', required_hashtags),
                                 ('locations', TweetStreamDataProcessing.SpatialDistribution(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags)),
                                 ('locations_in_order_of_influence_spread', locations_in_order_of_influence_spread),
                                 ]) 
    for memcache_key, value in mf_memcache_key_to_value.iteritems(): 
        print 'Updating: ', memcache_key
        update_memcache(key=memcache_key, value=value)
    for chart_id, data in charts_data.iteritems():
        print 'Updating: ', chart_id
        for hashtag_id, item in enumerate(data): update_memcache(key=get_chart_data_key(chart_id, hashtag_id), value=item)
    print '%s Updated remote cache at %s from %s' % (datetime.fromtimestamp(time.time()), APPLICATION_URL, MACHINE_NAME)
    
if __name__ == '__main__':
    while True:
        try:
            update_remote_data()
#            exit()
            time.sleep(UPDATE_FREQUENCY_IN_MINUTES * 60)
        except Exception as e: 
            print e
            pass

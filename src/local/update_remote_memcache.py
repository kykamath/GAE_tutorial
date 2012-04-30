'''
Created on Apr 29, 2012

@author: kykamath
'''
import urllib, urllib2, cjson, time, os
from datetime import datetime, timedelta
from settings import INTERVAL_IN_MINUTES,\
        HASHTAG_OBSERVING_WINDOW_IN_MINUTES, \
        NO_OF_HASHTAGS_TO_SHOW, BLOCKED_HASHTAGS, \
        f_hashtags_geo_distribution, MACHINE_NAME, \
        UPDATE_FREQUENCY_IN_MINUTES, APPLICATION_URL
from library.file_io import FileIO
from library.twitter import getDateTimeObjectFromTweetTimestamp
from collections import defaultdict
from operator import itemgetter

dummy_mf_hashtag_to_ltuo_point_and_occurrence_time = {
                                                      'ht1': [([40.245992, -114.082031], 1), ([42.032974,-99.052734], 3)],
                                                      'ht2': [([24.20689,18.28125], 1), ([24.20689,18.28125], 4), ([56.944974,-115.664062], 4)],
                                                      'ht3': [([-10.833306,-54.84375], 3), ([40.178873,-2.8125], 4)],
                                                      'ht4': [([37.509726,-113.291016],1), ([45.089036,-102.041016],4), ([33.358062,-91.230469],5), ([40.713956,-76.025391],6)]
                                                      }

def GetOutputFile(t):
    return f_hashtags_geo_distribution%(t.year, t.month, t.day, t.hour, (int(t.minute)/INTERVAL_IN_MINUTES)*INTERVAL_IN_MINUTES)

class TweetStreamDataProcessing:
    @staticmethod
    def _ParseHashtagObjects(checkin):
        if 'geo' in checkin: point = checkin['geo']
        else: point = checkin['bb']
        t = time.mktime(getDateTimeObjectFromTweetTimestamp(checkin['t']).timetuple())
        for h in checkin['h']: yield h.lower(), [point, t]
    @staticmethod
    def load_mf_hashtag_to_ltuo_point_and_occurrence_time():
        mf_hashtag_to_ltuo_point_and_occurrence_time = defaultdict(list)
        dt_current_time = datetime.fromtimestamp(time.mktime(time.gmtime(time.time())))
        td_interval = timedelta(seconds = INTERVAL_IN_MINUTES*60)
        td_window = timedelta(seconds = HASHTAG_OBSERVING_WINDOW_IN_MINUTES*60)
        dt_next_time = dt_current_time-td_window
        while dt_next_time<dt_current_time:
            f_input = GetOutputFile(dt_next_time)
            if os.path.exists(f_input):
                print 'Processing:', f_input
                for checkin in FileIO.iterateJsonFromFile(f_input):
                    for hashtag, point_and_occurrence_time in \
                            TweetStreamDataProcessing._ParseHashtagObjects(checkin):
                        if hashtag not in BLOCKED_HASHTAGS:
                            mf_hashtag_to_ltuo_point_and_occurrence_time[hashtag].append(point_and_occurrence_time)
            dt_next_time+=td_interval
        return mf_hashtag_to_ltuo_point_and_occurrence_time
    @staticmethod
    def get_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, no_of_hashtags):
        return zip(*sorted(
                      mf_hashtag_to_ltuo_point_and_occurrence_time.iteritems(), 
                      key=lambda (hashtag, ltuo_point_and_occurrence_time): len(ltuo_point_and_occurrence_time),
                      reverse=True
                      )[:no_of_hashtags]
                   )[0]
    @staticmethod
    def get_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, top_hashtags):
        return [
                ['%s,%s'%tuple(point) for point, _ in mf_hashtag_to_ltuo_point_and_occurrence_time[top_hashtag]]
                for top_hashtag in top_hashtags
                ]

def update_memcache(key, value):
    value = cjson.encode(value)
    url = APPLICATION_URL + 'update_memcache'
    req = urllib2.Request(url)
    req.add_data(urllib.urlencode({'key': key, 'value': value}))
    return urllib2.urlopen(req)

def update_remote_data():
    if MACHINE_NAME=='kykamath.cs.tamu.edu':
        if APPLICATION_URL=='http://localhost:8080/': 
            print 'Wrong application url: ', APPLICATION_URL
            print 'Remote memcache not updated. Program exiting.'
            exit()
        mf_hashtag_to_ltuo_point_and_occurrence_time = TweetStreamDataProcessing.load_mf_hashtag_to_ltuo_point_and_occurrence_time()
    else: mf_hashtag_to_ltuo_point_and_occurrence_time = dummy_mf_hashtag_to_ltuo_point_and_occurrence_time
    hashtags = TweetStreamDataProcessing.get_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, NO_OF_HASHTAGS_TO_SHOW)
    locations = TweetStreamDataProcessing.get_locations(mf_hashtag_to_ltuo_point_and_occurrence_time, hashtags)
    mf_memcache_key_to_value = dict([
                                 ('hashtags', hashtags),
                                 ('locations', locations)
                                 ]) 
    for memcache_key, value in \
            mf_memcache_key_to_value.iteritems():
        update_memcache(key=memcache_key, value=value)
    print '%s Updated remote cache at %s from %s'%(datetime.fromtimestamp(time.time()), APPLICATION_URL, MACHINE_NAME)
    
if __name__ == '__main__':
    while True:
        update_remote_data()
#        exit()
        time.sleep(UPDATE_FREQUENCY_IN_MINUTES*60)
        
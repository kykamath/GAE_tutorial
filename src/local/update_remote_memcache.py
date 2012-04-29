'''
Created on Apr 29, 2012

@author: kykamath
'''
import urllib, urllib2, cjson, time, os
from datetime import datetime, timedelta
from settings import INTERVAL_IN_MINUTES,\
        HASHTAG_OBSERVING_WINDOW_IN_MINUTES, \
        NO_OF_HASHTAGS_TO_SHOW
from twitter_stream_parser import GetOutputFile
from library.file_io import FileIO
from library.twitter import getDateTimeObjectFromTweetTimestamp
from collections import defaultdict
from operator import itemgetter

#APPLICATION_URL = 'http://localhost:8080/'
APPLICATION_URL = 'http://kykamath-hw.appspot.com/'

UPDATE_FREQUENCY_IN_SECONDS = 60*1


class TweetStreamDataProcessing:
    @staticmethod
    def get_current_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, no_of_hashtags):
#        current_timestamp = datetime.fromtimestamp(time.time())
#        time_id = '%s_%s_%s'%(current_timestamp.day, current_timestamp.hour, current_timestamp.minute)
#        return ['hashtag_%s_%s'%(i, time_id)for i in range(10)]
        return zip(*sorted(
                      mf_hashtag_to_ltuo_point_and_occurrence_time.iteritems(), 
                      key=lambda (hashtag, ltuo_point_and_occurrence_time): len(ltuo_point_and_occurrence_time)
                      )[-no_of_hashtags:]
                   )[0]
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
                        mf_hashtag_to_ltuo_point_and_occurrence_time[hashtag].append(point_and_occurrence_time)
            dt_next_time+=td_interval
        return mf_hashtag_to_ltuo_point_and_occurrence_time
    

def update_memcache(key, value):
    value = cjson.encode(value)
    url = APPLICATION_URL + 'update_memcache'
    req = urllib2.Request(url)
    req.add_data(urllib.urlencode({'key': key, 'value': value}))
    return urllib2.urlopen(req)

def update_remote_data():
    mf_hashtag_to_ltuo_point_and_occurrence_time = TweetStreamDataProcessing.load_mf_hashtag_to_ltuo_point_and_occurrence_time()
    print TweetStreamDataProcessing.get_current_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, NO_OF_HASHTAGS_TO_SHOW)
    exit()
    mf_memcache_key_to_value = dict([
                                 ('hashtags', TweetStreamDataProcessing.get_current_hashtags(mf_hashtag_to_ltuo_point_and_occurrence_time, NO_OF_HASHTAGS_TO_SHOW))
                                 ]) 
    for memcache_key, value in \
            mf_memcache_key_to_value.iteritems():
        update_memcache(key=memcache_key, value=value)
    
    
if __name__ == '__main__':
    while True:
        print '%s Updating remote cache.'%(datetime.fromtimestamp(time.time()))
        update_remote_data()
        exit()
        time.sleep(UPDATE_FREQUENCY_IN_SECONDS)
        
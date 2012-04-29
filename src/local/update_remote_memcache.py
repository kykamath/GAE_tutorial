'''
Created on Apr 29, 2012

@author: kykamath
'''
import urllib, urllib2, cjson, time, os
from datetime import datetime, timedelta
from settings import INTERVAL_IN_MINUTES,\
        HASHTAG_OBSERVING_WINDOW_IN_MINUTES
from twitter_stream_parser import GetOutputFile
from library.file_io import FileIO

APPLICATION_URL = 'http://localhost:8080/'
#APPLICATION_URL = 'http://kykamath-hw.appspot.com/'

UPDATE_FREQUENCY_IN_SECONDS = 60*1


class LoadDataStructures:
    @staticmethod
    def get_current_hashtags():
        current_timestamp = datetime.fromtimestamp(time.time())
        time_id = '%s_%s_%s'%(current_timestamp.day, current_timestamp.hour, current_timestamp.minute)
        return ['hashtag_%s_%s'%(i, time_id)for i in range(10)]
    @staticmethod
    def temp():
        dt_current_time = datetime.fromtimestamp(time.mktime(time.gmtime(time.time())))
        td_interval = timedelta(seconds = INTERVAL_IN_MINUTES*60)
        td_window = timedelta(seconds = HASHTAG_OBSERVING_WINDOW_IN_MINUTES*60)
        dt_next_time = dt_current_time-td_window
        while dt_next_time<dt_current_time:
            f_input = GetOutputFile(dt_next_time)
            if os.path.exists(f_input):
                for data in FileIO.iterateJsonFromFile(f_input):
                    print data
            dt_next_time+=td_interval
#        print  datetime.fromtimestamp(time.time()), td_interval, td_window
    

def update_memcache(key, value):
    value = cjson.encode(value)
    url = APPLICATION_URL + 'update_memcache'
    req = urllib2.Request(url)
    req.add_data(urllib.urlencode({'key': key, 'value': value}))
    return urllib2.urlopen(req)

def update_remote_data():
    mf_memcache_key_to_value = dict([
                                 ('hashtags', LoadDataStructures.get_current_hashtags())
                                 ]) 
    for memcache_key, value in \
            mf_memcache_key_to_value.iteritems():
        update_memcache(key=memcache_key, value=value)
    
    
if __name__ == '__main__':
    LoadDataStructures.temp()
#    while True:
#        print '%s Updating remote cache.'%(datetime.fromtimestamp(time.time()))
#        update_remote_data()
#        exit()
#        time.sleep(UPDATE_FREQUENCY_IN_SECONDS)
        
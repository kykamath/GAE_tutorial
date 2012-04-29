'''
Created on Apr 29, 2012

@author: kykamath
'''
import urllib, urllib2, cjson, time
from datetime import datetime
from mongo_interface import get_current_hashtags

APPLICATION_URL = 'http://localhost:8080/'
#APPLICATION_URL = 'http://kykamath-hw.appspot.com/'

UPDATE_FREQUENCY_IN_SECONDS = 60*1

def update_memcache(key, value):
    value = cjson.encode(value)
    url = APPLICATION_URL + 'update_memcache'
    req = urllib2.Request(url)
    req.add_data(urllib.urlencode({'key': key, 'value': value}))
    return urllib2.urlopen(req)

def update_remote_data():
    mf_memcache_key_to_value = dict([
                                 ('hashtags', get_current_hashtags())
                                 ]) 
    for memcache_key, value in \
            mf_memcache_key_to_value.iteritems():
        update_memcache(key=memcache_key, value=value)
    
    
if __name__ == '__main__':
    while True:
        print '%s Updating remote cache.'%(datetime.fromtimestamp(time.time()))
        update_remote_data()
        time.sleep(UPDATE_FREQUENCY_IN_SECONDS)
        
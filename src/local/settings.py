'''
Created on Apr 29, 2012

@author: kykamath
'''

import socket

MACHINE_NAME = socket.gethostname()
INTERVAL_IN_MINUTES = 5

#f_hashtags_geo_distribution = '/mnt/chevron/kykamath/data/geo/hashtags_geo_distribution/%s/%s/%s/%s_%s'
f_hashtags_geo_distribution = '/data/chevron/kykamath/data/geo/hashtags_geo_distribution/%s/%s/%s/%s_%s'


# Remote update settings
#APPLICATION_URL = 'http://localhost:8080/'
#APPLICATION_URL = 'http://kykamath-hw.appspot.com/'
APPLICATION_URL = 'http://social-media-spread.appspot.com/'
UPDATE_FREQUENCY_IN_MINUTES = 5
TOTAL_ANALYSIS_WINDOW_IN_MINUTES = INTERVAL_IN_MINUTES*12*24
TOP_HASHTAGS_WINDOW_IN_MINUTES = INTERVAL_IN_MINUTES*12*1
NO_OF_HASHTAGS_TO_SHOW = 10 
LATTICE_ACCURACY = 4.0

UNIT_LATTICE_ACCURACY = 0.735 #50.78 miles
UNIT_TIME_UNIT_IN_SECONDS = 60*5

BLOCKED_HASHTAGS = ['rt', 'np', 'jagadtrack', 'nowplaying', 'followback', 'jobs',
                    'teamfollowback', 'fb', 'job', 'tweetmyjobs', 'oomf', 'futown',
                    u'\u98a8\u4fd7', u'\u901f\u5831', u'\u30cb\u30e5\u30fc\u30b9',
                     u'\u30c7\u30ea\u30d8\u30eb', 'coupon', u'\u95a2\u6771', u'\u95a2\u897f']



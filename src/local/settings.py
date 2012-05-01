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
APPLICATION_URL = 'http://localhost:8080/'
#APPLICATION_URL = 'http://kykamath-hw.appspot.com/'
#APPLICATION_URL = 'http://social-media-spread.appspot.com/'
UPDATE_FREQUENCY_IN_MINUTES = 5
HASHTAG_OBSERVING_WINDOW_IN_MINUTES = INTERVAL_IN_MINUTES*12*3
NO_OF_HASHTAGS_TO_SHOW = 10 
LATTICE_ACCURACY = 4.0

BLOCKED_HASHTAGS = ['rt', 'np', 'jagadtrack', 'nowplaying', 'followback', 'jobs',
                    'teamfollowback', 'fb', 'job', 'tweetmyjobs', 'oomf', 'futown']



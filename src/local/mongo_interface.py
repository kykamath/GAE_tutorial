'''
Created on Apr 29, 2012

@author: kykamath
'''
import time
from datetime import datetime

def get_current_hashtags():
    current_timestamp = datetime.fromtimestamp(time.time())
    time_id = '%s_%s_%s'%(current_timestamp.day, current_timestamp.hour, current_timestamp.minute)
    return ['hashtag_%s_%s'%(i, time_id)for i in range(10)]

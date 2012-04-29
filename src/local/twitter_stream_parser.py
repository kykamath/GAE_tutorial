'''
Created on Apr 29, 2012

@author: kykamath
'''
import tweetstream
import cjson
from settings import f_hashtags_geo_distribution
from library.geo import getCenterOfMass
from library.twitter import getDateTimeObjectFromTweetTimestamp
from library.file_io import FileIO

USER_NAME = 'worldw_crawler'
PASSWORD = 'krishna'
LOCATIONS = ['-180.0,-90.0', '180.0,90.0']
OUTPUT_FILE_ACCURACY_IN_MINUTES = 5

def ParseGeoData(data):
    if 'geo' in data and data['geo']!=None: return ('geo', data['geo']['coordinates'])
    elif 'place' in data: 
        point = getCenterOfMass(data['place']['bounding_box']['coordinates'][0])
        return ('bb', [point[1], point[0]])
def ParseHashtags(tweet):
    hashtags = []
    for h in tweet['entities']['hashtags']: hashtags.append(h['text'])
    return hashtags
def GetCheckinObject(data):
    checkin = {'user': {'id': data['user']['id'], 'l': data['user']['location']}, 'id': data['id'], 't': data['created_at'], 'h': [], 'tx': data['text']}
    return checkin
def GetOutputFile(tweet):
    t = getDateTimeObjectFromTweetTimestamp(tweet['created_at'])
    return f_hashtags_geo_distribution%(t.year, t.month, t.day, t.hour, (int(t.minute)/OUTPUT_FILE_ACCURACY_IN_MINUTES)*OUTPUT_FILE_ACCURACY_IN_MINUTES)

def parse_stream():    
    stream = tweetstream.FilterStream(USER_NAME, PASSWORD, locations=LOCATIONS) 
    for tweet in stream:
        try:
            geo = ParseGeoData(tweet)
            if geo: 
                hashtags = ParseHashtags(tweet)
                if hashtags: 
                    checkin_object = GetCheckinObject(tweet)
                    checkin_object['h'] = hashtags
                    checkin_object[geo[0]] = geo[1]
                    FileIO.writeToFileAsJson(checkin_object, GetOutputFile(tweet))
        except Exception as e: print e

if __name__ == '__main__':
    parse_stream()
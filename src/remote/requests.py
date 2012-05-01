import os
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

fld_templates = 'templates/'

memcache_client = memcache.Client()        

def GetObjectFromMemcache(key):
    json_object = memcache_client.get(key)
    if json_object: return json.loads(json_object)

class Map(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+'map.html')
        self.response.out.write(template.render(path, {'hashtags': GetObjectFromMemcache('hashtags')}))
        
class Temp(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+'temp.html')
        self.response.out.write(template.render(path, {}))

class Locations(webapp.RequestHandler):
    def get(self):
        locations = memcache_client.get('locations')
        self.response.out.write(locations)
        
class LocationsInOrderOfInfluenceSpread(webapp.RequestHandler):
    def get(self):
        locations_in_order_of_influence_spread = memcache_client.get('locations_in_order_of_influence_spread')
        self.response.out.write(locations_in_order_of_influence_spread)

class ChartsData(webapp.RequestHandler):
    def get(self):
        charts_data = memcache_client.get('charts_data')
        self.response.out.write(charts_data)

class UpdateMemcache(webapp.RequestHandler):
    def __init__(self):
        self.memcache_client = memcache.Client()
    def post(self):
        key = self.request.get('key')
        value = self.request.get('value')
        self.memcache_client.set(key=key, value=value, time=3600)

application = webapp.WSGIApplication([
  ('/', Map),
  ('/temp', Temp),
  ('/update_memcache', UpdateMemcache),
  ('/locations', Locations),
  ('/locations_in_order_of_influence_spread', LocationsInOrderOfInfluenceSpread),
  ('/charts_data', ChartsData),
], debug=False)


def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()

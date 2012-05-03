import os
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

fld_templates = 'templates/'
memcache_client = memcache.Client()        

class Map(webapp.RequestHandler):
    def _GetObjectFromMemcache(self, key):
        json_object = memcache_client.get(key)
        if json_object: return json.loads(json_object)
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+'map.html')
        self.response.out.write(template.render(path, {'hashtags': self._GetObjectFromMemcache('hashtags')}))
        
class Temp(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+'temp.html')
        self.response.out.write(template.render(path, {}))

class UpdateMemcache(webapp.RequestHandler):
    def post(self):
        key = self.request.get('key')
        value = self.request.get('value')
        memcache_client.set(key=key, value=value, time=3600)
        
class GetFromMemcache(webapp.RequestHandler):
    def post(self):
        key = self.request.get('key')
        self.response.out.write(memcache_client.get(key))

application = webapp.WSGIApplication([
  ('/', Map),
  ('/temp', Temp),
  ('/update_memcache', UpdateMemcache),
  ('/get_from_memcache', GetFromMemcache),
], debug=False)


def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()

import os
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

fld_templates = 'templates/'
memcache_client = memcache.Client()

URL_TEMP = '/temp'


ltuo_url_and_title = [(URL_TEMP, 'Home'), ('/social_trails', 'Social Trails')]   


class ViewRequestObject(webapp.RequestHandler):
    def render(self, selected_url, path, parameters):
        ltuo_url_and_title_and_is_selected = []
        for url, title in ltuo_url_and_title: 
            is_selected = False
            if url==selected_url: is_selected = True
            ltuo_url_and_title_and_is_selected.append([url, title, is_selected])
            parameters['details'] = ltuo_url_and_title_and_is_selected
        self.response.out.write(template.render(path, parameters))

class SocialTrails(webapp.RequestHandler):
    def _GetObjectFromMemcache(self, key):
        json_object = memcache_client.get(key)
        if json_object: return json.loads(json_object)
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+'map.html')
        all_hashtags = self._GetObjectFromMemcache('all_hashtags')
        if all_hashtags: all_hashtags=all_hashtags[10:]
        self.response.out.write(template.render(path, 
                                                {
                                                 'hashtags': self._GetObjectFromMemcache('hashtags'),
                                                 'all_hashtags': all_hashtags
                                                 }
                                                ))
class Temp(ViewRequestObject):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+'temp.html')
        self.render(URL_TEMP, path, {})

class UpdateMemcache(webapp.RequestHandler):
    def post(self):
        key = self.request.get('key')
        value = self.request.get('value')
        memcache_client.set(key=key, value=value, time=3600)
        
class GetFromMemcache(webapp.RequestHandler):
    def post(self):
        key = self.request.get('key')
        self.response.out.write(memcache_client.get(key))
        
class AllHashtags(webapp.RequestHandler):
    def get(self):
        all_hashtags = memcache_client.get('all_hashtags')
        self.response.out.write(all_hashtags)

application = webapp.WSGIApplication([
  ('/social_trails', SocialTrails),
  (URL_TEMP, Temp),
  ('/update_memcache', UpdateMemcache),
  ('/get_from_memcache', GetFromMemcache),
  ('/all_hashtags', AllHashtags),
], debug=False)


def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()

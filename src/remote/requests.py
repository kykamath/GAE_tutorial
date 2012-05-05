import os
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

# CONFIG
fld_templates = 'templates/'
PAGE_ID_HOME = 0
PAGE_ID_ANALYTICS = 1
#PAGE_ID_ABOUT = 1
CONFIG = {
            PAGE_ID_HOME : dict(url='/', title='Home', template='index.html'),
#            dict(url='/about', title='About', template='about.html'),   
            PAGE_ID_ANALYTICS : dict(url='/analytics', title='Analytics', template='analytics.html'),
        }

# Common variables
memcache_client = memcache.Client()
               
class ViewRequestObject(webapp.RequestHandler):
    def render(self, selected_url, title, path, parameters):
        ltuo_url_and_title_and_is_selected = []
        for page_id in CONFIG: 
            url, title = CONFIG[page_id]['url'], CONFIG[page_id]['title'] 
            is_selected = ''
            if url==selected_url: is_selected ='selected'
            ltuo_url_and_title_and_is_selected.append([url, title, is_selected])
            parameters['ltuo_url_and_title_and_is_selected'] = ltuo_url_and_title_and_is_selected
            parameters['title'] = title
        self.response.out.write(template.render(path, parameters))
        
class Home(ViewRequestObject):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+CONFIG[PAGE_ID_HOME]['template'])
        self.render(CONFIG[PAGE_ID_HOME]['url'], CONFIG[PAGE_ID_HOME]['title'], path, {})

class Analytics(ViewRequestObject):
    def _GetObjectFromMemcache(self, key):
        json_object = memcache_client.get(key)
        if json_object: return json.loads(json_object)
    def get(self):
        path = os.path.join(os.path.dirname(__file__), fld_templates+CONFIG[PAGE_ID_ANALYTICS]['template'])
        all_hashtags = self._GetObjectFromMemcache('all_hashtags')
        if all_hashtags: all_hashtags=all_hashtags[10:]
        self.render(CONFIG[PAGE_ID_ANALYTICS]['url'], 
                    CONFIG[PAGE_ID_ANALYTICS]['title'], 
                    path, 
                    {
                         'hashtags': self._GetObjectFromMemcache('hashtags'),
                         'all_hashtags': all_hashtags
                     })
#        self.response.out.write(template.render(path, 
#                                                {
#                                                 'hashtags': self._GetObjectFromMemcache('hashtags'),
#                                                 'all_hashtags': all_hashtags
#                                                 }
#                                                ))

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
  (CONFIG[PAGE_ID_HOME]['url'], Home),
  (CONFIG[PAGE_ID_ANALYTICS]['url'], Analytics),
  ('/update_memcache', UpdateMemcache),
  ('/get_from_memcache', GetFromMemcache),
  ('/all_hashtags', AllHashtags),
], debug=False)


def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()

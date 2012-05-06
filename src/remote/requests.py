import os
from django.utils import simplejson as json
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

# NAVIGATION
fld_templates = 'templates/'
PAGE_ID_HOME = 0
PAGE_ID_ABOUT = 1
PAGE_ID_ANALYTICS = 2
PAGE_ID_CONTACT = 4

#ANALYTICS_URL = '/analytics'
PAGE_ID_REAL_TIME_ANALYTICS = '%s_%s'%(PAGE_ID_ANALYTICS, 0)
PAGE_ID_HISTORICAL_ANALYTICS = '%s_%s'%(PAGE_ID_ANALYTICS, 1)
PAGE_ID_TEMP_ANALYTICS = '%s_%s'%(PAGE_ID_ANALYTICS, 2)

NAVIGATION = {
            PAGE_ID_HOME : dict(url='/', title='Home', template='index.html'),
            PAGE_ID_ABOUT : dict(url='/about', title='About', template='about.html'),
            PAGE_ID_ANALYTICS : dict(url='/analytics', title='Analytics', template='analytics.html'),
            PAGE_ID_CONTACT : dict(url='/contact', title='Contact', template='contact.html'),
            
            PAGE_ID_REAL_TIME_ANALYTICS : dict(url='/analytics_real_time', title='Realtime Analytics', template='analytics_real_time.html'),
            PAGE_ID_HISTORICAL_ANALYTICS : dict(url='/historical_analytics', title='Historical Analytics', template='analytics_historical.html'),
            PAGE_ID_TEMP_ANALYTICS : dict(url='/temp_analytics', title='Temp', template='temp.html'),
        }

ANALYTICS_DESCRIPTION = {
                     PAGE_ID_REAL_TIME_ANALYTICS : 'Here is a real time quotation here is a long quotation here is a long quotation here is a \
                                                     long quotation here is a long quotation here is a long quotation here is a long quotation \
                                                     here is a long quotation here is a long quotation.',
                     PAGE_ID_HISTORICAL_ANALYTICS : 'Here is a historical quotation here is a long quotation here is a long quotation here is a \
                                                     long quotation here is a long quotation here is a long quotation here is a long quotation \
                                                     here is a long quotation here is a long quotation.',
                     PAGE_ID_TEMP_ANALYTICS : 'Here is a historical quotation here is a long quotation here is a long quotation here is a \
                                                     long quotation here is a long quotation here is a long quotation here is a long quotation \
                                                     here is a long quotation here is a long quotation.',
                     }

# Common variables
memcache_client = memcache.Client()
def IsInt(s):
    try: 
        int(s)
        return True
    except ValueError: return False
def ito_of_analytics_page_ids(): 
    for page_id in NAVIGATION: 
        if not IsInt(page_id): yield page_id

class ViewRequestObject(webapp.RequestHandler):
    def render(self, page_id_to_show, parameters = {}):
        page_to_render = NAVIGATION[page_id_to_show]
        ltuo_url_and_title_and_is_selected = []
        for page_id in NAVIGATION: 
            url, title = NAVIGATION[page_id]['url'], NAVIGATION[page_id]['title'] 
            is_selected = ''
            if url==page_to_render['url']: is_selected ='selected'
#            if not self._RepresentsInt(page_id) and page_id==PAGE_ID_ANALYTICS: is_selected ='selected'
            if IsInt(page_id): ltuo_url_and_title_and_is_selected.append([url, title, is_selected])
        temp_ltuo_url_and_title_and_is_selected = []
        if not IsInt(page_id_to_show): 
            for url, title, is_selected in ltuo_url_and_title_and_is_selected:
                if url==NAVIGATION[PAGE_ID_ANALYTICS]['url']: temp_ltuo_url_and_title_and_is_selected.append([url, title, 'selected'])
                else: temp_ltuo_url_and_title_and_is_selected.append([url, title, ''])
            ltuo_url_and_title_and_is_selected = temp_ltuo_url_and_title_and_is_selected
        parameters['ltuo_url_and_title_and_is_selected'] = ltuo_url_and_title_and_is_selected
        parameters['title'] = page_to_render['title']
        path = os.path.join(os.path.dirname(__file__), fld_templates+NAVIGATION[page_id_to_show]['template'])
        self.response.out.write(template.render(path, parameters))
        
class AnalyticsViewRequestObject(ViewRequestObject):
    def _GetObjectFromMemcache(self, key):
        json_object = memcache_client.get(key)
        if json_object: return json.loads(json_object)
    def render(self, page_id_to_show, parameters = {}):
        page_to_render = NAVIGATION[page_id_to_show]
        
        parameters['hashtags'] = self._GetObjectFromMemcache('hashtags')
        all_hashtags = self._GetObjectFromMemcache('all_hashtags')
        if all_hashtags: all_hashtags=all_hashtags[10:]
        parameters['all_hashtags'] = all_hashtags
#        self.render(PAGE_ID_REAL_TIME_ANALYTICS,
#                    {
#                         'hashtags': self._GetObjectFromMemcache('hashtags'),
#                         'all_hashtags': all_hashtags
#                     })
        analytics_ltuo_url_and_title_and_is_selected = []
        for page_id in ito_of_analytics_page_ids():
            url, title = NAVIGATION[page_id]['url'], NAVIGATION[page_id]['title'] 
            is_selected = ''
            if url==page_to_render['url']: is_selected ='selected'
            analytics_ltuo_url_and_title_and_is_selected.append([url, title, is_selected])
        parameters['analytics_ltuo_url_and_title_and_is_selected'] = analytics_ltuo_url_and_title_and_is_selected
        super(AnalyticsViewRequestObject, self).render(page_id_to_show, parameters)

class Home(ViewRequestObject):
    def get(self):
        self.render(PAGE_ID_HOME)

class About(ViewRequestObject):
    def get(self):
        self.render(PAGE_ID_ABOUT)

class Contact(ViewRequestObject):
    def get(self):
        self.render(PAGE_ID_CONTACT)

class Analytics(ViewRequestObject):
    def get(self):
        ltuo_url_title_description = []
        for page_id in ito_of_analytics_page_ids():
            url, title = NAVIGATION[page_id]['url'], NAVIGATION[page_id]['title']
            ltuo_url_title_description.append([url, title, ANALYTICS_DESCRIPTION[page_id]])
        parameters = {}
        parameters['ltuo_url_title_description'] = ltuo_url_title_description
        self.render(PAGE_ID_ANALYTICS, parameters)
        
class AnalyticsRealTime(AnalyticsViewRequestObject):
    def get(self):
#        all_hashtags = self._GetObjectFromMemcache('all_hashtags')
#        if all_hashtags: all_hashtags=all_hashtags[10:]
#        self.render(PAGE_ID_REAL_TIME_ANALYTICS,
#                    {
#                         'hashtags': self._GetObjectFromMemcache('hashtags'),
#                         'all_hashtags': all_hashtags
#                     })
        self.render(PAGE_ID_REAL_TIME_ANALYTICS)

class AnalyticsHistorical(AnalyticsViewRequestObject):
    def get(self):
        self.render(PAGE_ID_HISTORICAL_ANALYTICS)

class AnalyticsTemp(AnalyticsViewRequestObject):
    def get(self):
        self.render(PAGE_ID_TEMP_ANALYTICS)
        

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
  (NAVIGATION[PAGE_ID_HOME]['url'], Home),
  (NAVIGATION[PAGE_ID_ABOUT]['url'], About),
  (NAVIGATION[PAGE_ID_ANALYTICS]['url'], Analytics),
  (NAVIGATION[PAGE_ID_CONTACT]['url'], Contact),
  (NAVIGATION[PAGE_ID_REAL_TIME_ANALYTICS]['url'], AnalyticsRealTime),
  (NAVIGATION[PAGE_ID_HISTORICAL_ANALYTICS]['url'], AnalyticsHistorical),
  (NAVIGATION[PAGE_ID_TEMP_ANALYTICS]['url'], AnalyticsTemp),
  ('/update_memcache', UpdateMemcache),
  ('/get_from_memcache', GetFromMemcache),
  ('/all_hashtags', AllHashtags),
], debug=False)


def main():
    run_wsgi_app(application)

if __name__ == '__main__':
    main()

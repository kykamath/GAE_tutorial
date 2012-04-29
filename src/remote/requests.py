import cgi
import datetime
import urllib
import wsgiref.handlers
import os
from django.utils import simplejson as json
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

fld_templates = 'templates/'

class MemecacheObject(object):
    def load(self, json_object):
        self.__dict__ = json.loads(json_object)
        return self
    def dump(self):
        return json.dumps(self.__dict__)
    def printo(self):
        print self.__dict__

class Person(MemecacheObject):
    def __init__(self):
        self.name = None
        self.age = None
        
#class Person(db.Model):
#    name = db.StringProperty()
#    age = db.IntegerProperty()

#class MainPage(webapp.RequestHandler):
#    def get(self):
#        memcache_client = memcache.Client()
#        self.response.out.write('<html><body>')
##        persons = db.GqlQuery("SELECT * FROM Person")
#        persons = []
#        json_person = memcache_client.get('current_person')
#        if json_person: persons.append(Person().load(memcache_client.get('current_person')))
#        template_values = {
#            'persons': persons,
#        }

#        path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
#        self.response.out.write(template.render(path, template_values))
#        
#        for person in persons:
#            self.response.out.write('%s %s <br/>'%(cgi.escape(person.name), person.age))
#        self.response.out.write('<br/><br/>')
#        self.response.out.write("""
#              <form action="/add" method="post">
#                <div><textarea name="name" rows="1" cols="60"></textarea></div>
#                <div><textarea name="age" rows="1" cols="60"></textarea></div>
#                <div><input type="submit" value="Add user"></div>
#              </form>
#              <hr>
#
#            </body>
#          </html>""" )

#class Guestbook(webapp.RequestHandler):
#    def post(self):
#        person = Person()
#        person.name = self.request.get('name')
#        person.age = int(self.request.get('age'))
##        person.put()
#        memcache_client = memcache.Client()
#        memcache_client.set(key="current_person", value=person.dump(), time=3600)
#        self.redirect('/')
        
class Map(webapp.RequestHandler):
    def __init__(self):
        self.memcache_client = memcache.Client()
    def _InitMemcache(self):
        hashtags = ['hashtag1', 'hashtag2', 'hashtag3']
        self.memcache_client.set(key="hashtags", value=json.dumps(hashtags), time=3600)
    def _GetObjectFromMemcache(self, key):
        json_object = self.memcache_client.get(key)
        if json_object: return json.loads(json_object)
    def get(self):
        # Initializing memcache for development. Remove in production.
#        self._InitMemcache()
        template_variables = ['hashtags']
        mf_template_variable_to_value = dict([(template_variable, self._GetObjectFromMemcache(template_variable))
                                              for template_variable in template_variables])
        path = os.path.join(os.path.dirname(__file__), fld_templates+'map.html')
        self.response.out.write(template.render(path, mf_template_variable_to_value))

#class PostMemcache(webapp.RequestHandler):
#    def get(self):
#        self.response.out.write("""
##              <form action="/update_memcache" method="post">
##                <div><textarea name="name" rows="1" cols="60"></textarea></div>
##                <div><textarea name="age" rows="1" cols="60"></textarea></div>
##                <div><input type="submit" value="Add user"></div>
##              </form>
##              <hr>
##
##            </body>
##          </html>""" )
        
class UpdateMemcache(webapp.RequestHandler):
    def __init__(self):
        self.memcache_client = memcache.Client()
    def post(self):
        key = self.request.get('key')
        value = self.request.get('value')
        self.memcache_client.set(key=key, value=value, time=3600)

application = webapp.WSGIApplication([
#  ('/', MainPage),
#  ('/add', Guestbook),
  ('/', Map),
#  ('/temp', PostMemcache),
  ('/update_memcache', UpdateMemcache),
#  ('/update_memcache/(\w+)/(\w+)', UpdateMemcache),
], debug=True)


def main():
    run_wsgi_app(application)


if __name__ == '__main__':
    main()
#    p = Person().load('{"age": 12, "name": "ssd"}')
##    p.name = 'ssd'
##    p.age = 12
#    p.printo()

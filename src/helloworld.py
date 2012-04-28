import cgi
import datetime
import urllib
import wsgiref.handlers
import os
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

class Person(db.Model):
    name = db.StringProperty()
    age = db.IntegerProperty()

class MainPage(webapp.RequestHandler):
    def get(self):
        self.response.out.write('<html><body>')
        persons = db.GqlQuery("SELECT * FROM Person")
        
        template_values = {
            'persons': persons,
        }

        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))
        
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

class Guestbook(webapp.RequestHandler):
    def post(self):
        person = Person()
        person.name = self.request.get('name')
        person.age = int(self.request.get('age'))
        person.put()
        self.redirect('/')


application = webapp.WSGIApplication([
  ('/', MainPage),
  ('/add', Guestbook)
], debug=True)


def main():
    run_wsgi_app(application)


if __name__ == '__main__':
    main()

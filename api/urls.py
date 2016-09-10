from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^get_book/(?P<book_id>[-&\w]+)$', "api.views.get_book"),
    url(r'^$', "api.views.load_frontend")
)

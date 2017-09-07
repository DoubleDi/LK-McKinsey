from django.conf.urls import url
from project import views

urlpatterns = [
    url(r'^teams/?$', views.teams),
    url(r'^team/?$', views.my_team),
    url(r'^teams/(\d{1,10})/?$', views.team_profile),
    url(r'^$', views.index),
    # url(r'', include('project.urls')),
]

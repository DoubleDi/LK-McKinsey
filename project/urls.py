from django.conf.urls import url
from project import views
import lk_user

urlpatterns = [
    url(r'^teams/?$', views.teams),
    url(r'^test/?$', views.test),
    url(r'^teams/search/?$', views.search_teams),
    url(r'^team/edit_avatar/?$', lk_user.views.edit_avatar),
    url(r'^team/edit/?$', views.edit_team),
    url(r'^team/create/?$', views.create_team),
    url(r'^team/request/?$', views.request_team),
    url(r'^team/leave/?$', views.leave_team),
    url(r'^team/?$', views.my_team),
    url(r'^teams/(\d{1,10})/?$', views.team_profile),
    url(r'^$', views.index),
]

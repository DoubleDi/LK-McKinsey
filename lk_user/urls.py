from django.conf.urls import url
from lk_user import views

urlpatterns = [
    url(r'^register/?$', views.register),
    url(r'^login/?$', views.login),
    url(r'^logout/?$', views.logout),
    url(r'^profile/edit/?$', views.edit_user),
    url(r'^profile/del_experience/?$', views.del_experience),
    url(r'^profile/edit_experience/?$', views.edit_experience),
    url(r'^profile/?$', views.my_profile),
    url(r'^(\d{1,10})/?$', views.profile),
    url(r'^$', views.participants),
    # url(r'', include('project.urls')),
]

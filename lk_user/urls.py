from django.conf.urls import url
from lk_user import views

urlpatterns = [
    url(r'^profile/?$', views.my_profile),
    url(r'^(\d{1,10})/?$', views.profile),
    url(r'^$', views.participants),
    # url(r'', include('project.urls')),
]

from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from ui import views

urlpatterns = [
    url(r'^sensors/(?P<vs>[\w_-]+)/(?P<data>[\w_-]+)', views.sensors_get, name='get_sensor_data'),
    url(r'^sensors/(?P<vs>[\w_-]+)', views.sensors_get, name='get_sensor_vs'),
    url(r'^sensors/', views.sensors_get, name='get_sensors_list)'),
    url(r'^chart/add', views.chart_add, name='add_chart'),
    url(r'^chart/del/(?P<pk>\d+)', views.chart_del,  name='del_chart'),
    url(r'^chart/list', views.chart_list,  name='list_chart'),
]

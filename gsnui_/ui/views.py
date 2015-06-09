from django.shortcuts import render
from django.http import HttpResponse
from django.core import serializers
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from ui.models import Chart
import requests


def sensors_get(request, vs="", data=""):

    d = ""
    if vs:
        vs = "/" + vs
    if data == "data":
        d = "/data"
    _from = ""
    _to = ""
    if "from" in request.GET:
        _from = "&from="+request.GET["from"]
    if "to" in request.GET:
        _to = "&to="+request.GET["to"]
    r = requests.get('http://montblanc.slf.ch:22002/ws/api/sensors%s%s?a=1%s%s' % (vs, d, _from, _to,))
    return HttpResponse(r)


def chart_list(request):

    data = serializers.serialize("json", Chart.objects.all())
    return HttpResponse(data)


@csrf_exempt
def chart_add(request):

    m = "no data"
    if "data" in request.POST:
        for o in serializers.deserialize("json", request.POST["data"]):
            o.save()
            
            m = "saved"
    return HttpResponse('{"message":"%s"}' % (m,))


def chart_del(request, pk):

    o = get_object_or_404(Chart, pk=pk)
    o.delete()
    return HttpResponse('{"message":"deleted"}')

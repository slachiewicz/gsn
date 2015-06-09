from django.db import models
from django.contrib.auth.models import User


class Chart(models.Model):

    user = models.ForeignKey(User)
    time_start = models.DateTimeField(null=True, blank=True)
    time_end = models.DateTimeField(null=True, blank=True)
    fields = models.TextField()

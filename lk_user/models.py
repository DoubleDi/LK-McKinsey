# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from project.models import Team, Skill


# Create your models here.
class LkUser(User):
    phone_number = models.CharField(max_length = 20, null = True, default = None)
    is_hidden    = models.BooleanField(default = False)
    team         = team = models.ForeignKey(Team, verbose_name = "Команда", blank = True, null = True, related_name = 'team')
    want_join    = models.ManyToManyField(Team, verbose_name = "В какие команды хочет вступить", null = True, blank = True)
    skills       = models.ManyToManyField(Skill, verbose_name = "Навыки", null = True, blank = True)

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.username

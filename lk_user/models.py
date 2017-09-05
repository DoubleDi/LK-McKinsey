# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from project.models import Team, Skill


# Create your models here.
class LkUser(User):
    phone_number = models.CharField(max_length = 20, null = True, default = None, verbose_name = "Номер телефона")
    is_hidden    = models.BooleanField(default = False, verbose_name = "Cкрыть команду")
    team         = team = models.ForeignKey(Team, blank = True, null = True, related_name = "team", verbose_name = "Команда")
    want_join    = models.ManyToManyField(Team, null = True, blank = True, verbose_name = "В какие команды хочет вступить")
    skills       = models.ManyToManyField(Skill, null = True, blank = True, verbose_name = "Навыки")

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.username

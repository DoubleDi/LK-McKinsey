# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from project.models import LkUser, Team, Experience, Skill, SkillGroup  

admin.site.register(LkUser)
admin.site.register(Team)
admin.site.register(Experience)
admin.site.register(Skill)
admin.site.register(SkillGroup)

# Register your models here.

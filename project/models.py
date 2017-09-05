# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class LkUser(User):
    phone_number = models.CharField(max_length = 20, null = True, default = None)
    is_hidden    = models.BooleanField(default = False)
    team_id      = models.PositiveIntegerField(blank = True, null = True, default = None)
    want_join    = models.ManyToManyField("Team", verbose_name = "want join team", null = True, blank = True)

    class Meta:
        verbose_name = "LK User"
        verbose_name_plural = "LK Users"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.username
    
    
class Team(models.Model):
    name         = models.CharField(max_length = 50)
    member_count = models.PositiveIntegerField(default = 1)
    is_hidden    = models.BooleanField(default = False)
    creater_id   = models.PositiveIntegerField()
    want_accept  = models.ManyToManyField(LkUser, verbose_name = "want accept member", blank = True, null = True)

    class Meta:
        verbose_name = "Team"
        verbose_name_plural = "Teams"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.name
        
        
class Experience(models.Model):
    text  = models.TextField("text")
    owner = models.ForeignKey(LkUser, verbose_name = "owner") 
    
    class Meta:
        verbose_name = "Experience"
        verbose_name_plural = "Experiences"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.owner.username
    
        
class Skill(models.Model):
    name  = models.CharField(max_length = 50)
    group = models.ForeignKey("SkillGroup", verbose_name = "group")
    
    class Meta:
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        
    def __unicode__(self):
        return self.name
    
        
class SkillGroup(models.Model):
    name = models.CharField(max_length = 50)
        
    class Meta:
        verbose_name = "Skill Group"
        verbose_name_plural = "Skill Groups"
        
    def __unicode__(self):
        return self.name

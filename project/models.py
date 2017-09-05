# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


# Create your models here.
    
class Team(models.Model):
    name         = models.CharField(max_length = 50, verbose_name = "Название Команды")
    member_count = models.PositiveIntegerField(default = 1, verbose_name = "Количество участников")
    is_hidden    = models.BooleanField(default = False, verbose_name = "Скрыть пользователя")
    creater_id   = models.PositiveIntegerField(verbose_name = "ID Создателя")
    want_accept  = models.ManyToManyField("lk_user.LkUser", blank = True, null = True, 
        related_name = "want_accept_member", verbose_name = "Кого хотят принять в команду",)

    class Meta:
        verbose_name = "Команда"
        verbose_name_plural = "Команды"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.name
        
        
class Experience(models.Model):
    text  = models.TextField("text")
    owner = models.ForeignKey("lk_user.LkUser", verbose_name = "Владелец") 
    
    class Meta:
        verbose_name = "Опыт"
        verbose_name_plural = "Опыт"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.owner.username
    
        
class Skill(models.Model):
    name  = models.CharField(max_length = 50, verbose_name = "Название")
    group = models.ForeignKey("SkillGroup", verbose_name = "Группа")
    
    class Meta:
        verbose_name = "Навык"
        verbose_name_plural = "Навыки"
        
    def __unicode__(self):
        return self.name
    
        
class SkillGroup(models.Model):
    name = models.CharField(max_length = 50, verbose_name = "Название")
        
    class Meta:
        verbose_name = "Группа Навыков"
        verbose_name_plural = "Группы Навыков"
        
    def __unicode__(self):
        return self.name

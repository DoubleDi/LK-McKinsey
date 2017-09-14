# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


# Create your models here.
    
class Team(models.Model):
    name         = models.CharField(max_length = 50, verbose_name = "Название Команды")
    member_count = models.PositiveIntegerField(default = 1, verbose_name = "Количество участников")
    is_hidden    = models.BooleanField(default = False, verbose_name = "Скрыть команду")
    creater_id   = models.PositiveIntegerField(verbose_name = "ID Создателя")
    avatar       = models.ImageField(upload_to= u'avatars/', blank = True, verbose_name="avatar", null = True)
    about        = models.TextField("text", blank = True, null = True)
    want_accept  = models.ManyToManyField("lk_user.LkUser", blank = True, 
        related_name = "want_accept_member", verbose_name = "Кого хотят принять в команду",)
    need_skills  = models.ManyToManyField("Skill", blank = True, verbose_name = "Требуемые навыки")
    


    class Meta:
        verbose_name = "Команда"
        verbose_name_plural = "Команды"
        indexes = [ models.Index(fields=[ 'name' ]), models.Index(fields=[ 'is_hidden', 'member_count' ]) ]
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.name
    
    def get_search_name(self):
        return "".join(self.name.lower().split())

        
        
class Experience(models.Model):
    text  = models.TextField("text")
    owner = models.ForeignKey("lk_user.LkUser", verbose_name = "Владелец") 
    
    class Meta:
        verbose_name = "Опыт"
        verbose_name_plural = "Опыт"
        
    def __unicode__(self):
        return str(self.id) + ' ' + self.owner.email
    
        
class Skill(models.Model):
    name  = models.CharField(max_length = 50, verbose_name = "Название")
    group = models.ForeignKey("SkillGroup", verbose_name = "Группа")
    
    class Meta:
        verbose_name = "Навык"
        verbose_name_plural = "Навыки"
        
    def __unicode__(self):
        return str(self.id) + ' ' + str(self.name)
    
        
class SkillGroup(models.Model):
    name = models.CharField(max_length = 50, verbose_name = "Название")
        
    class Meta:
        verbose_name = "Группа Навыков"
        verbose_name_plural = "Группы Навыков"
        
    def __unicode__(self):
        return str(self.id) + ' ' + str(self.name)

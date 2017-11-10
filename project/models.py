# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.utils import timezone


# Create your models here.
    
class Team(models.Model):
    name         = models.CharField(max_length = 50, verbose_name = "Название Команды")
    member_count = models.PositiveIntegerField(default = 1, verbose_name = "Количество участников")
    is_hidden    = models.BooleanField(default = False, verbose_name = "Скрыть команду")
    creater_id   = models.PositiveIntegerField(verbose_name = "ID Создателя")
    avatar       = models.ImageField(upload_to= 'teams/', blank = True, verbose_name="avatar", null = True)
    about        = models.TextField("text", blank = True, null = True)
    want_accept  = models.ManyToManyField("lk_user.LkUser", blank = True, 
        related_name = "want_accept_member", verbose_name = "Кого хотят принять в команду",)
    need_skills  = models.ManyToManyField("Skill", blank = True, verbose_name = "Требуемые навыки")
    file_1       = models.FileField(blank = True, null = True)
    file_2       = models.FileField(blank = True, null = True)
    link         = models.CharField(max_length=100, verbose_name="Ссылка на профиль команды", blank = True, null = True)



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

class Timer(models.Model):
    team_stop = models.DateTimeField(verbose_name = "Время остановки формирования команд", blank = True, null = True)
    file_stop = models.DateTimeField(verbose_name = "Время остановки загрузки файлов у команд", blank = True, null = True)
    
    class Meta:
        verbose_name = "Дедлайн"
        verbose_name_plural = "Дедлайн"
        
    def __unicode__(self):
        return "Дедлайн"
        
    def is_now_team_stop(self):
        return self.team_stop < timezone.now()
            
    def is_now_file_stop(self):
        return self.file_stop < timezone.now()

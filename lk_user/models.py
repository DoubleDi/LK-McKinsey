# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User, UserManager
from project.models import Team, Skill
import logging
from django.contrib.auth.models import ( BaseUserManager, AbstractBaseUser )

## Create your models here.
#class LkUser(User):
#    email        = models.EmailField(unique=True)
#    phone_number = models.CharField(max_length = 20, null = True, default = None, verbose_name = "Номер телефона")
#    is_hidden    = models.BooleanField(default = False, verbose_name = "Cкрыть команду")
##    team         = team = models.ForeignKey(Team, blank = True, null = True, related_name = "team", verbose_name = "Команда")
##    want_join    = models.ManyToManyField(Team, blank = True, verbose_name = "В какие команды хочет вступить")
##    skills       = models.ManyToManyField(Skill, blank = True, verbose_name = "Навыки")
#
#    objects = UserManager()
#    USERNAME_FIELD = 'email'
#
#    class Meta:
#        verbose_name = "Пользователь"
#        verbose_name_plural = "Пользователи"
#        
#    def __unicode__(self):
#        return str(self.id) + ' ' + self.username
#


logger = logging.getLogger('django')

class LkUserManager(BaseUserManager):
    def create_user(self, email, password1, password2):
        if not email:
            raise ValueError('Users must have a email')
        user = self.model(
            email=email,
        )
        if password1 != password2:
            return None
        user.set_password(password1)
        try:
            user.save()
        except:
            logger.error("Create user error")
            return None
        return user

    def create_superuser(self, email, password):
        user = self.model(
            email=email,
        )
        user.set_password(password)
        user.is_admin = True
        user.save()
        return user


class LkUser(AbstractBaseUser):
    email        = models.EmailField(verbose_name='Email',unique=True)
    is_active    = models.BooleanField(default=True)
    is_admin     = models.BooleanField(default=False)
    name         = models.CharField(max_length = 50, null = True, blank=True, verbose_name = "Имя")
    last_name    = models.CharField(max_length = 50, null = True, blank=True, verbose_name = "Фамилия")
    phone_number = models.CharField(max_length = 20, null = True, blank=True, verbose_name = "Номер телефона")
    is_hidden    = models.BooleanField(default = False, verbose_name = "Cкрытый профиль")
    team         = team = models.ForeignKey(Team, blank = True, null = True, related_name = "team", verbose_name = "Команда")
    want_join    = models.ManyToManyField(Team, blank = True, verbose_name = "В какие команды хочет вступить")
    skills       = models.ManyToManyField(Skill, blank = True, verbose_name = "Навыки")
    objects      = LkUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def get_full_name(self):
        return self.name + ' ' + self.last_name

    def get_short_name(self):
        return self.email

    def __str__(self):
        return self.email
    
    def __unicode__(self):
        return u'{} {}'.format(self.name, self.email)

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

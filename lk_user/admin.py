# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from lk_user.models import LkUser
from django.contrib.auth.admin import UserAdmin #to protect password
from project.models import Team, Skill
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

class LkUserAdmin(UserAdmin):
    add_form_template = 'admin/auth/user/add_form.html'
    change_user_password_template = None
    fieldsets = (
        (None, {'fields': ('email', 'password', 'is_active', 'is_admin', 'is_hidden', 'name', 'last_name', 'phone_number', 'skills', 'want_join', 'team', 'avatar' )}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'is_active', 'is_admin', 'is_hidden', 'name', 'password1', 'password2', 'skills', 'want_join', 'team', 'avatar' ),
        }),
    )
    list_display = (
        'email',
        'name',
        'id',
        'last_name',
        'is_admin',
        'team',
        'avatar',
    )
    list_filter = ()
    search_fields = ('email','name', 'last_name', )
    filter_horizontal = ('skills', 'want_join',)
    ordering = ()
    inlines = [ ]


admin.site.register(LkUser, LkUserAdmin)

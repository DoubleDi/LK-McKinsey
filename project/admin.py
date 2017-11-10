# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from lk_user.models import LkUser 
from project.models import Team, Experience, Skill, SkillGroup, Timer
from django import forms

admin.site.register(Experience)
admin.site.register(Skill)
admin.site.register(SkillGroup)

# Register your models here.
class MemberInline(admin.TabularInline):
    model = LkUser
    extra = 0
    show_change_link = True
    fieldsets = (
        (None, {'fields': ( 'email','phone_number', 'name', 'team', )}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email','phone_number', 'name', 'team'),
        }),
    )
    readonly_fields = ('email','phone_number', 'name', )
   
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False

class AddUserForm(forms.ModelForm):
    class Meta:
        model = LkUser
        fields = '__all__'

    users = forms.ModelMultipleChoiceField(queryset=LkUser.objects.all(), label = 'Добавить участника', required=False)
    def __init__(self, *args, **kwargs):
        super(AddUserForm, self).__init__(*args, **kwargs)
        if self.instance and len(self.instance.lkuser_set.all()):
            self.fields['users'].initial = self.instance.lkuser_set.all()

    def save(self, *args, **kwargs):
        # FIXME: 'commit' argument is not handled
        # TODO: Wrap reassignments into transaction
        instance = super(AddUserForm, self).save(commit=False)
        self.fields['users'].initial.update(team=None)
        self.cleaned_data['users'].update(team=instance)
        return instance

class TeamAdmin(admin.ModelAdmin):
    inlines = [MemberInline]
    # form = AddUserForm

admin.site.register(Team, TeamAdmin)
admin.site.register(Timer)

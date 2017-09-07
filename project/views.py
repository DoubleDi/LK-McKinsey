# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
import logging
from django.http import Http404, HttpResponseRedirect
from django.contrib.auth.decorators import login_required


logger = logging.getLogger('django')


def index(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        return render(request, 'index.html', params)      
    
        
#TODO: Pagination
def teams(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            if not request.user.team is None: 
                params['teams'] = Team.objects.filter(id != user.team.id, is_hidden = False).order_by('id')[0:10]
        if params.get('teams') is None:
            params['teams'] = Team.objects.filter(is_hidden = False).order_by('id')[0:10]
            
        return render(request, 'teams.html', params)  
        
        
def teams_next_page(request):
    if request.method == 'GET':
        params = request.GET
        offset = int(params['offset'])
        
        if request.user.is_authenticated:
            if not request.user.team is None: 
                teams = Team.objects.filter(id != user.team.id, is_hidden = False).order_by('id')[str(offset):str(offset + 10)]
        
        if teams is None: 
            teams = Team.objects.filter(is_hidden = False).order_by('id')[str(offset):str(offset + 10)]  
            
        return HttpResponse(json.dumps({ 'status': 'ok', 'teams': teams }), content_type='application/json')

           
def team_profile(request, team_id):
    team_id = int(team_id)
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        try:
            params['team'] = Team.objects.get(id = team_id)
            if params['team'].is_hidden:
                raise Http404("Команда не существует")
            else:
                return render(request, 'team_profile.html', params)  
        except Exception,e:
            raise Http404("Команда не существует")


def my_team(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated():
            params['user'] = request.user
            params['team'] = request.user.team
            if params['team'] is None:
                return HttpResponseRedirect('/')  
            return render(request, 'participants/cabinet.html', params) 
        else:
            return HttpResponseRedirect('/')  


@login_required
def add_experience(request):
    if request.method == 'POST':
        params = request.POST
        Experience.objects.create(
            text = params['text'], 
            owner = request.user,
        )
        return HttpResponse(json.dumps({ 'status': 'ok' }), content_type='application/json')

@login_required
def add_skills(request):
    if request.method == 'POST':
        params = request.POST
        user = request.user
        skill_ids = json.loads(params['skills'])
        if len(skill_ids) == 0:
            result = {'status': 'error', 'message': 'Непредвиденная ошибка'}
        skills = list(Skill.objects.filter(id__in = skill_ids))
        if len(skills) != len(skill_ids):
            result = {'status': 'error', 'message': 'Такое умение не найдено'}
        user.skills.add(skills)
        user.save()
        return HttpResponse(json.dumps({ 'status': 'ok' }), content_type='application/json')
    

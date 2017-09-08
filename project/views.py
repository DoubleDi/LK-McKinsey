# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
from django.http import Http404, HttpResponseRedirect
from django.contrib.auth.decorators import login_required

import logging
import json

logger = logging.getLogger('django')


def index(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        return render(request, 'index.html', params)      
    
        
def teams(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            if not request.user.team is None: 
                params['teams'] = Team.objects.all().exclude(id = user.team.id).filter(is_hidden = False).exclude(member_count__gte = 5).order_by('id')[0:10]
        if params.get('teams') is None:
            params['teams'] = Team.objects.filter(is_hidden = False).exclude(member_count__gte = 5).order_by('id')[0:10]
            
        return render(request, 'teams.html', params)  

        
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
            params['members'] = LkUser.objects.filter(team = params['team'])
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

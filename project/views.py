# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required

import logging
import json
import sys 

reload(sys)
sys.setdefaultencoding('utf-8')
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
                params['teams'] = Team.objects.all().exclude(id = request.user.team.id).filter(is_hidden = False).exclude(member_count__gte = 5).order_by('id')[0:10]
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
            
#TODO: is this pagination ok????

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

#TODO: change get to post
#TODO: logger add
#TODO: russian message

def create_team(request):
    if request.method == 'POST': #POST
        params = request.POST
        if not request.user.is_authenticated:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пожалуйста авторизируйтесь'}), content_type='application/json')
        
        if not request.user.team is None:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Вы не можете создать команду если уже состоите в команде'}), content_type='application/json')
            
        if not params.get('name'):
            result = {'status': 'error', 'message': 'no data'}
            logger.error('No enough data for create team')
        else:
            new_team = Team.objects.create(
                name = params['name'], 
                member_count = 1, 
                creater_id = request.user.id,
            ) 
            new_team.save()
            
            request.user.team = new_team
            request.user.save()
            result = {'status': 'ok'}
            
        return HttpResponse(json.dumps(result), content_type='application/json')


def edit_team(request):
    if request.method == 'POST': #POST
        params = request.POST
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
        
        team = request.user.team
        if team is None:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Создайте команду'}), content_type='application/json')  
        
        if team.creater_id != request.user.id:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Команду может редактировать только ее создатель'}), content_type='application/json')  

        if params.get('name'):
            team.name = params['name']  
        if params.get('is_hidden'):
            team.is_hidden = bool(params['is_hidden']) 
        if params.get('delete') and int(params['delete']):
            members = LkUser.objects.filter(team = team)
            for member in members:
                member.team = None
                member.save()
            team.delete()
        else:
            team.save()
            
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')  


def request_team(request):
    if request.method == 'POST': #POST
        params = request.POST
        if not request.user.is_authenticated:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')
        
        if not request.user.team is None and request.user.team.member_count > 1:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Вы уже состоите в команде'}), content_type='application/json')
            
        if not params.get('id'):
            result = {'status': 'error', 'message': 'no data'}
            logger.error('No enough data to join team')
        else:
            try:
                team = Team.objects.filter(id = params['id']).prefetch_related('want_accept')[0]
            except Exception, e:
                logger.error(e)
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Команда не найдена'}), content_type='application/json')
            
            if team.member_count >= 5 or team.is_hidden:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Команда переполнена или не существует'}), content_type='application/json')
            
            if request.user in team.want_accept.all():
                team.want_accept.remove(request.user)    
                team.member_count += 1
                if team.member_count >= 5:
                    team.want_accept.clear()
                if request.user.team:
                    request.user.team.delete()
                request.user.team = team
                request.user.want_join.clear()
                
                request.user.save()
                team.save()
            else:
                request.user.want_join.add(team)
                request.user.save()
                
            
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')
    
    
def leave_team(request):
    if request.method == 'POST': #POST
        params = request.POST
        if not request.user.is_authenticated:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пожалуйста авторизируйтесь'}), content_type='application/json')
        
        if request.user.team is None:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Вы не можете покинуть команду если у вас нет команды'}), content_type='application/json')
            
        team = request.user.team
        if request.user.id == team.creater_id:
            edit_team(request)
        else:
            team.member_count -= 1
            request.user.team = None
            team.save()
            request.user.save()
            
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')
    

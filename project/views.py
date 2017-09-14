# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.mail import send_mail
from lk_user.views import build_skills
from django.db.models import Q, Prefetch

import logging
import json
import sys 

reload(sys)
sys.setdefaultencoding('utf-8')
logger = logging.getLogger('django')

#TODO:
# team objects prefetch

def test(request):
    if request.method == 'GET':
        params = {}
        
        return render(request, 'test.html', params)      
            

def index(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        return render(request, 'index.html', params)      
    
    
@login_required(login_url='/participants/auth')
def teams(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        return render(request, 'teams.html', params)  


@login_required(login_url='/participants/auth')        
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
                params['team'].accept = False
                params['team'].join = False
                if request.user.is_authenticated and params['team'] in request.user.want_join.all():
                    params['team'].join = True
                
                if request.user.is_authenticated and request.user in params['team'].want_accept.all():
                    params['team'].accept = True
                
                params['members'] = LkUser.objects.filter(team = params['team']).prefetch_related('skills')
                for member in params['members']:
                    member.user_skills = member.skills.all()
                
                params['team'].skills = params['team'].need_skills.all()
                params['team'].accept = params['team'].want_accept.all()
                if request.GET.get('popup'):
                    return render(request, 'ajax/team_page.html', params)  
                else:
                    return render(request, 'team_profile.html', params) 
                     
        except Exception,e:
            logger.error('Team with id ' + str(id) + 'does not exist' + str(e))
            raise Http404("Команда не существует")
        
    
@login_required(login_url='/participants/auth')    
def my_team(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated():
            params['user'] = request.user
            params['team'] = request.user.team
            
            if not params['team'] is None:
                params['members'] = LkUser.objects.filter(team = params['team'])
                for member in params['members']:
                    member.user_skills = member.skills.all()
            
                params['team'].skills = params['team'].need_skills.all()
                params['team'].accept = params['team'].want_accept.all()
                
            params['skills'] = build_skills()
            return render(request, 'team_cabinet.html', params) 
        else:
            return HttpResponseRedirect('/')  
            
            
def create_team(request):
    if request.method == 'POST': #POST
        params = request.POST
        if not request.user.is_authenticated:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пожалуйста авторизируйтесь'}), content_type='application/json')
        
        if not request.user.team is None:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Вы не можете создать команду если уже состоите в команде'}), content_type='application/json')
            
        if not params.get('name'):
            result = {'status': 'error', 'message': 'Нет названия команды'}
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
            result = {'status': 'ok', 'redirect': '/team'}
            logger.info('Created team' + str(new_team.id))
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
        if params.get('delete_users'):
            user_ids = json.loads(params['delete_users'])
            members = LkUser.objects.filter(id__in = user_ids, team = team)
            
            for member in members:
                member.team = None
                member.save()
            team.member_count -= len(members)   
        
        if params.get('about'):
            team.about = params['about']
            
        if params.get('skills'):    
            skill_ids = json.loads(params['skills'])
            if len(skill_ids) == 0 or len(skill_ids) > 5:
                result = {'status': 'error', 'message': 'Непредвиденная ошибка'}
            skills = Skill.objects.filter(id__in = skill_ids).distinct()
            
            team.need_skills.clear()
            team.need_skills.add(*skills)
                
        if params.get('delete') and int(params['delete']):
            members = LkUser.objects.filter(team = team)
            for member in members:
                member.team = None
                member.save()
            team.delete()
            logger.info('Team ' + str(team.id) + ' is deleted by ' + str(request.user.id))
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
                result = 'joined'
                request.user.save()
                team.save()
                logger.info('User' + str(request.user.id) + 'joined team' + str(team.id))
            elif team in request.user.want_join.all():
                request.user.want_join.remove(team)
                result = 'removed'
                request.user.save()
            else:
                request.user.want_join.add(team)
                result = 'requested'
                request.user.save()
                logger.info('User ' + str(request.user.id) + ' requested team ' + str(team.id))
                
            
        return HttpResponse(json.dumps({'status': 'ok', 'result': result }), content_type='application/json')
    
    
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
            logger.info('Creator ' + str(request.user.id) + ' left his team ' + str(team.id)+', deleting it')
        else:
            team.member_count -= 1
            request.user.team = None
            team.save()
            request.user.save()
            logger.info('User ' + str(request.user.id) + ' left team ' + str(team.id))
            
        return HttpResponse(json.dumps({'status': 'ok', 'redirect': '/teams'}), content_type='application/json')

import datetime
@login_required(login_url='/participants/auth')
def search_teams(request):
    start = datetime.datetime.now()
    logger.info(start)
    if request.method == 'GET':
        params = request.GET
        
        query = Q(member_count__lte=5) & Q(is_hidden=False)

        if request.user.team:
            query = query & ~Q(id=request.user.team.id)

        if params.get('name'):
            query = query & Q(name__contains=params['name'])
        
        if params.get('member_count'):
            member_counts = json.loads(params['member_count'])
            query = query & Q(member_count__in=member_counts)

        teams = Team.objects.filter(query).prefetch_related(Prefetch('need_skills', to_attr='need_s'))

        if params.get('team_need'):
            need_teams = []
            user_skills = set(request.user.skills.all())
            for i in range(len(teams)):
                if len(user_skills & set(teams[i].need_s)) >= 1:
                    need_teams.append(teams[i])
                    
            teams = need_teams
            
        offset = int(params.get('offset') or 0)
        limit = int(params.get('limit') or 10)
        teams = teams[offset : offset + limit]
        
        want_join_set = set(request.user.want_join.all())
        want_user_set = set(Team.objects.filter(want_accept__id=request.user.id))
        for team in teams:
            team.accept = False
            team.join = False
            if team in want_join_set:
                team.join = True
            
            if team in want_user_set:
                team.accept = True
        
        logger.info("Python execution time: {}".format(datetime.datetime.now() - start))
        
        if params.get('want_html'):
            return render(request, 'ajax/team.html', { 'teams': teams })

        logger.info(datetime.datetime.now() - start)
        
        return HttpResponse(json.dumps({'status': 'ok', 'teams': serializers.serialize("json", teams)}), content_type='application/json')

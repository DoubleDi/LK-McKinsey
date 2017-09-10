# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib import auth
from django.db.models import Q
from django.core import serializers

import logging
import json
import sys 

reload(sys)
sys.setdefaultencoding('utf-8')
logger = logging.getLogger('django')

#TODO:
# создатель удаляет участников из своей команды
# выпригласить юзера из команды и обратно 
# forgetpassword, confirm email


def build_skills():
    skill_groups = SkillGroup.objects.all()
    for skill_group in skill_groups:
        skill_group.skills = Skill.objects.filter(group = skill_group)
    return skill_groups
    

def profile(request, user_id):
    user_id = int(user_id)
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        try:
            params['profile_user'] = LkUser.objects.get(id = user_id)
            if params['profile_user'].is_hidden and not request.user.team is None and request.user.team.id != params['profile_user'].team.id:
                raise Http404("Пользователя не существует")
            else:
                params['profile_user'].skills = params['profile_user'].skills.all()
                params['skills'] = build_skills()
                params['experience'] = Experience.objects.filter(owner = params['profile_user'])
                
                if request.user.is_authenticated and (params['profile_user'] in request.user.team.want_accept.all() or request.user.team in params['profile_user'].want_join.all()):
                    params['want'] = 1
                
                return render(request, 'participants/cabinet.html', params)  
        except Exception,e:
            raise Http404("Пользователя не существует")


@login_required(login_url='/participants/auth')
def my_profile(request):
    if request.method == 'GET':
        params = {}
        if request.user.is_authenticated():
            params['user'] = request.user
            params['user'].skills = request.user.skills.all()
            params['skills'] = build_skills()
            params['experience'] = Experience.objects.filter(owner = params['user'])
            return render(request, 'participants/cabinet.html', params) 
        
        
def participants(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
        params['skills'] = build_skills()
        return render(request, 'participants/participants.html', params)      
        

def auth_page(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            if params.get('next'):
                return HttpResponseRedirect(params['next'])
            return HttpResponseRedirect('/participants/profile')
            
        return render(request, 'participants/authorization.html', params)      


def register(request):
    if request.method == 'POST':
        reg_info = request.POST
        logger.info(reg_info)
        if reg_info.get('email') is None or reg_info.get('password') is None or reg_info.get('phone_number') is None or reg_info.get('name') is None or reg_info.get('last_name') is None or reg_info.get('password_confirm') is None:
            result = {'status': 'error', 'message': 'Не введены все данные'}
            logger.error('No enough data for create account')
            return HttpResponse(json.dumps(result), content_type='application/json')

        if str(reg_info['password']) == str(reg_info['password_confirm']):
            if LkUser.objects.filter(email = reg_info['email']):
                result = {'status': 'error', 'message': 'Пользователь с таким email уже существует'}
                logger.error('Duplicate email' + reg_info['email'])
            else:
                new_user = LkUser.objects.create_user(
                    reg_info['email'], reg_info['password'], reg_info['password_confirm']
                ) 
                new_user.name = str(reg_info['name']) 
                new_user.last_name = str(reg_info['last_name'])
                new_user.phone_number = str(reg_info['phone_number'])
                new_user.set_password(reg_info['password'])
                new_user.save()
                
                #TODO: confirm email
                logger.info('User ' + new_user.email + ' created successfully')
                result = {'status': 'ok', 'redirect': '/participants/profile'}
        else:
            result = {'status': 'error', 'message': 'Пароли не совпадают'}
            logger.error('Wrong password checking')
        
        return HttpResponse(json.dumps(result), content_type='application/json')

    
def login(request):
    if request.method == 'POST': #POST
        login_info = request.POST
        if not (login_info.get('email') and login_info.get('password')):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Неправильные данные для авторизации'}), content_type='application/json' ,)
        
        if request.user.is_authenticated():
            auth.logout(request)
                
        user = auth.authenticate(email = login_info['email'], password = login_info['password'])
        result = {}
        if user is None:
            result = {'status': 'error', 'message': 'Пользователь не найден или были введены неверные данные'}
        elif not user.is_active:
            result = {'status': 'error', 'message': 'Пользователь не подтвержден'}
        else:
            auth.login(request, user)
            return HttpResponse(json.dumps({ 'status' : 'ok', 'redirect' : '/participants/profile' }), content_type='application/json')
        
        return HttpResponse(json.dumps(result), content_type='application/json')


def logout(request):
    if request.method == 'POST':
        if request.user.is_authenticated():
            auth.logout(request)
        return HttpResponseRedirect('/')


def edit_user(request):
    if request.method == 'POST': #POST
        update_info = request.POST
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
        
        user = request.user
        if update_info.get('password'):
            user.set_password(update_info['password'])  
        if update_info.get('phone_number'):
            user.phone_number = update_info['phone_number']  
        if update_info.get('name'):
            user.name = update_info['name']  
        if update_info.get('last_name'):
            user.last_name = update_info['last_name']  
        if update_info.get('is_hidden'):
            user.is_hidden = bool(update_info['is_hidden'])  
        
        user.save()
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')  
 

def del_experience(request):
    if request.method == 'POST': #POST
        params = request.POST
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
        
        if not params.get('id'):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Нет указателя на удаляемый опыт'}), content_type='application/json')  
        try:
            experience = Experience.objects.get(id = params['id'])
            experience.delete()

            logger.error('Experience deleted ' + str(params['id']) + 'by user' + str(request.user.id))
            return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')  
        except Exception,e:
            logger.error('Experience not found ' + str(params['id']) + 'by user' + str(request.user.id))
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Неверны идентификатор опыта'}), content_type='application/json')  
                


def edit_experience(request):
    if request.method == 'POST': #POST
        params = request.POST
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
        
        if not params.get('text'):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пустое текстовое поле'}), content_type='application/json')  

        if params.get('id'):
            try:
                experience = Experience.objects.get(id = params['id'])
                experience.text = params['text']
                experience.save()
            except Exception,e: 
                logger.warning('Not found experience id' + str(params['id']))
                Experience.objects.create(text = params['text'], owner = request.user)
        else:
            experience = Experience.objects.create(text = params['text'], owner = request.user)
            logger.info('Experience created' + str(experience.id))
            
            
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')  


def edit_skills(request):
    if request.method == 'POST': #POST
        params = request.POST
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
        
        if not params.get('ids'):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пустое текстовое поле'}), content_type='application/json')  

        skill_ids = json.loads(params['ids'])
        if len(skill_ids) == 0:
            result = {'status': 'error', 'message': 'Непредвиденная ошибка'}
        skills = Skill.objects.filter(id__in = skill_ids).distinct()
        
        request.user.skills.clear()
        request.user.skills.add(skills)
        request.user.save()
        return HttpResponse(json.dumps(result), content_type='application/json')
    

def search_users(request):
    if request.method == 'GET':
        params = request.GET
        
        name = "".join(params['name'].lower().split())
        users = LkUser.objects.all().prefetch_related('skills')
        users = filter((lambda u: u.team is None or u.team.member_count <= 1), users)
        users = filter((lambda u: not u.is_hidden), users)
        if request.user.is_authenticated:
            users = filter((lambda u: u.team is None or u.team != request.user.team), users)
            users = filter((lambda u: u != request.user), users)
        
        if params.get('name'):
            users = list(filter((lambda u: str(u.get_search_name()).find(name) != -1 ), users))

        if params.get('skills'):
            skill_ids = json.loads(params['skills'])
            
            if len(skill_ids) == 0:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Непредвиденная ошибка'}), content_type='application/json')
            
            skilled_users = []
            for u in users:
                user_skills = set(u.skills.all())
                if user_skills >= skills:
                    skilled_users.append(u)
            users = skilled_users
        
        if params.get('team_need'):
            if not request.user.is_authenticated:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')
            if request.user.team is None:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'У вас нет команды'}), content_type='application/json')
            
            team_users = [] 
            teammates = LkUser.objects.filter(team = request.user.team).prefetch_related('skills')
            teammates_skills = set()
            for teammate in teammates:
                teammates_skills |= set(teammate.skills.all())
            
            all_skills = set(Skill.objects.all())
            need_skills = all_skills - teammates_skills
            
            for u in users:
                user_skills = set(u.skills.all())
                if len(user_skills & need_skills) >= 2:
                    team_users.append(u)
            
            users = team_users
            
        offset = int(params.get('offset') or 0)
        limit = int(params.get('limit') or 20)
        users = users[offset : offset + limit]
        return HttpResponse(json.dumps({'status': 'ok', 'users': serializers.serialize("json", users)}), content_type='application/json')


def invite_user(request):
    if request.method == 'POST': #POST
        params = request.POST
        if not request.user.is_authenticated:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')
        
        team = request.user.team
        
        if team is None:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Создайте команду'}), content_type='application/json')
        
        if team.creater_id != request.user.id:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Приглашать в команду может только создатель'}), content_type='application/json')
            
        if team.member_count >= 5:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Команда заполнена'}), content_type='application/json')
            
        if not params.get('id'):
            logger.error('No enough data to invite user')
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Нет данных'}), content_type='application/json')

        else:
            try:
                user = LkUser.objects.filter(id = params['id']).prefetch_related('want_join')[0]
            except Exception, e:
                logger.error(e)
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Пользователь не найден'}), content_type='application/json')
            
            if team in user.want_join.all():
                if not user.is_hidden and (not user.team or user.team and user.team.member_count == 1):
                    team.want_accept.remove(user)    
                    team.member_count += 1
                    if team.member_count >= 5:
                        team.want_accept.clear()
                    
                    if user.team:
                        user.team.delete()
                    user.team = team
                    user.want_join.clear()
                    
                    user.save()
                    team.save()
                else:
                    return HttpResponse(json.dumps({'status': 'error', 'message': 'У пользователя уже есть команда или его не существует'}), content_type='application/json')
            else:
                team.want_accept.add(user)
                team.save()
                logger.info('Team ' + str(team.id) + ' invited user ' + str(user.id))
                
            
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')

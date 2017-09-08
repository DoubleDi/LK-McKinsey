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
                params['skills'] = build_skills()
                params['experience'] = Experience.objects.filter(owner = params['profile_user'])
                return render(request, 'participants/cabinet.html', params)  
        except Exception,e:
            raise Http404("Пользователя не существует")


def my_profile(request):
    if request.method == 'GET':
        params = {}
        if request.user.is_authenticated():
            params['user'] = request.user
            params['skills'] = build_skills()
            params['experience'] = Experience.objects.filter(owner = params['user'])
            return render(request, 'participants/cabinet.html', params) 
        else:
            return HttpResponseRedirect('/')    
        
def participants(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            params['users'] = LkUser.objects.all().exclude(id = request.user.id).filter(is_hidden = False).filter(Q(team__isnull = True) | Q(team__member_count__lte = 1)).order_by('id')[0:10]
        else:
            params['users'] = LkUser.objects.filter(is_hidden = False).filter(Q(team__isnull = True) | Q(team__member_count__lte = 1)).order_by('id')[0:10]
        params['skills'] = build_skills()
        return render(request, 'participants/participants.html', params)      
        

def auth_page(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            return HttpResponseRedirect('/')
        return render(request, 'participants/authorization.html', params)      


def register(request):
    if request.method == 'POST':
        reg_info = request.POST

        if reg_info.get('email') is None or reg_info.get('password') is None or reg_info.get('phone_number') is None or reg_info.get('name') is None or reg_info.get('last_name') is None or reg_info.get('password_confirm') is None:
            result = {'status': 'error', 'message': 'no data'}
            logger.error('No enough data for create account')

        if str(reg_info['password']) == str(reg_info['password_confirm']):
            if LkUser.objects.filter(email = reg_info['email']):
                result = {'status': 'error', 'message': 'duplicate email'}
                logger.error('Duplicate email')
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
                result = {'status': 'ok'}
        else:
            result = {'status': 'error', 'message': 'passwords dont match'}
            logger.info('Wrong password checking')
        
        return HttpResponse(json.dumps(result), content_type='application/json')

    
def login(request):
    if request.method == 'POST': #POST
        login_info = request.POST
        if not (login_info.get('email') and login_info.get('password')):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Неправильные данные для авторизации'}), content_type='application/json' ,)
        
        if request.user.is_authenticated():
            auth.logout(request)
                
        user = auth.authenticate(email = login_info['email'], password = login_info['password'])
        if user is None:
            result = {'status': 'error', 'message': 'user not found'}
        elif not user.is_active:
            result = {'status': 'error', 'message': 'user not confirmed'}
        else:
            auth.login(request, user)
            return HttpResponseRedirect('profile')
        
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
                logger.warning('Not found experience id ' + str(params['id']))
                Experience.objects.create(text = params['text'], owner = request.user)
        else:
            Experience.objects.create(text = params['text'], owner = request.user)
            
            
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
        skills = list(Skill.objects.filter(id__in = skill_ids))
            
        user.skills.add(skills)
        user.save()
        return HttpResponse(json.dumps(result), content_type='application/json')
    

def search_users_by_name(request):
    if request.method == 'GET':
        params = request.GET
        
        if not params.get('name'):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пустое поле для поиска'}), content_type='application/json')  
        
        name = "".join(params['name'].lower().split())
        users = LkUser.objects.all()
        users = list(filter((lambda u: str(u.get_search_name()).find(name) != -1 ), users))
        return HttpResponse(json.dumps({'status': 'ok', 'users': serializers.serialize("json", users)}), content_type='application/json')


#TODO: PAGINATION
#TODO: change get to post
#TODO: select_related!!!!!!!

def search_users_by_skills(request):
    if request.method == 'GET':
        params = request.GET
        
        if not params.get('ids'):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пустое поле для навыков'}), content_type='application/json')  
        
        skill_ids = json.loads(params['ids'])
        
        if len(skill_ids) == 0:
            result = {'status': 'error', 'message': 'Непредвиденная ошибка'}
        
        skills = set(Skill.objects.filter(id__in = skill_ids))
        users = LkUser.objects.all()
        result_users = []
        for u in users:
            user_skills = set(u.skills.all())
            if user_skills >= skills:
                result_users.append(u)
        
        return HttpResponse(json.dumps({'status': 'ok', 'users': serializers.serialize("json", result_users)}), content_type='application/json')


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
                
            
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')

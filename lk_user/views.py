# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib import auth

import logging
import json
# Create your views here.

logger = logging.getLogger('django')


def build_skills():
    skill_groups = SkillGroup.objects.all()
    for skill_group in skill_groups:
        skill_group.skills = Skill.objects.filter(group = skill_group)
    return skill_groups
    
    #TODO: teammate view
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
        
#TODO: only users with team 2 and more people
def participants(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            params['users'] = LkUser.objects.all().exclude(id = request.user.id).filter(is_hidden = False).order_by('id')[0:10]
        else:
            params['users'] = LkUser.objects.filter(is_hidden = False).order_by('id')[0:10]
            
        return render(request, 'participants/participants.html', params)      
        

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
    if request.method == 'GET': #POST
        login_info = request.GET
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
    if request.method == 'GET': #POST
        update_info = request.GET
        
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
        
        user.save()
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')  
 

def del_experience(request):
    if request.method == 'GET': #POST
        params = request.GET
        
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
    if request.method == 'GET': #POST
        params = request.GET
        
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
    if request.method == 'GET': #POST
        params = request.GET
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
        
        if not params.get('ids'):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пустое текстовое поле'}), content_type='application/json')  

        skill_ids = json.loads(params['ids'])
        if len(skill_ids) == 0:
            result = {'status': 'error', 'message': 'Непредвиденная ошибка'}
        skills = list(Skill.objects.filter(id__in = skill_ids))
        if len(skills) != len(skill_ids):
            result = {'status': 'error', 'message': 'Такое умение не найдено'}
            
        user.skills.add(skills)
        user.save()
        return HttpResponse(json.dumps(result), content_type='application/json')
    

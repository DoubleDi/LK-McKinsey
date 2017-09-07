# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup
import logging
from django.http import Http404, HttpResponseRedirect
from django.contrib.auth.decorators import login_required

# Create your views here.

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
            if params['profile_user'].is_hidden:
                raise Http404("Пользователя не существует")
            else:
                params['skills'] = build_skills()
                params['experience'] = Experience.objects.filter(owner = params['profile_user'])
                return render(request, 'participants/cabinet.html', params)  
        except Exception,e:
            raise Http404("Пользователя не существует")


@login_required
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
            params['users'] = LkUser.objects.filter(id != request.user, is_hidden = False)
        else:
            params['users'] = LkUser.objects.filter(is_hidden = False)
            
        return render(request, 'participants/participants.html', params)      
        

def register(request):
    if request.method == 'POST':
        reg_info = request.POST

        if reg_info['username'] is None or reg_info['password'] is None or reg_info['phone_number'] is None or reg_info['first_name'] is None or reg_info['last_name'] is None or reg_info['password_confirm'] is None:
            result = {'status': 'error', 'message': 'no data'}
            logger.error('No enough data for create account')

        if str(reg_info['password']) == str(reg_info['password_confirm']):
            if LkUser.objects.filter(username = reg_info['username']):
                result = {'status': 'error', 'message': 'duplicate username'}
                logger.error('Duplicate username')
            else:
                new_user = LkUser.objects.create(
                    username = reg_info['username'], 
                    first_name = reg_info['first_name'], 
                    last_name = reg_info['last_name'], 
                    phone_number = reg_info['phone_number'],
                ) 
                new_user.set_password(reg_info['password'])
                new_user.save()
                #TODO: confirm email
                logger.info('User ' + username + ' created successfully')
                result = {'status': 'ok'}
        else:
            result = {'status': 'error', 'message': 'passwords dont match'}
            logger.info('Wrong password checking')
        
        return HttpResponse(json.dumps(result), content_type='application/json')

    
def login(request):
    if request.method == 'POST':
        login_info = request.POST
        if request.user.is_authenticated():
            auth.logout(request)
            
        user = auth.authenticate(username = login_info['username'], password = login_info['password'])
        if user is None:
            result = {'status': 'error', 'message': 'user not found'}
        elif not user.is_active:
            result = {'status': 'error', 'message': 'user not confirmed'}
        else:
            auth.login(request, user)
            result = {'status': 'ok', 'redirect': '/profile'}
        
        return HttpResponse(json.dumps(result), content_type='application/json')


@login_required
def logout(request):
    if request.method == 'POST':
        auth.logout(request)
        return HttpResponseRedirect('/')


@login_required
def edit_user(request):
    if request.method == 'POST':
        update_info = request.POST
        user = LkUser.objects.get(username = update_info['username'])

        if user is None: 
            result = {'status': 'error', 'message': 'bad username'}
        if update_info['password']:
            user.set_password(update_info['password'])  
        if update_info['phone_number']:
            user.phone_number = update_info['phone_number']  
        if update_info['first_name']:
            user.first_name = update_info['first_name']  
        if update_info['last_name']:
            user.last_name = update_info['last_name']  
        
        user.save()
        return HttpResponse(json.dumps({'status': 'ok'}), content_type='application/json')  
 

def public_profile(request, user_id):
    if request.method == 'GET':
        user = LkUser.objects.filter(id = user_id)
        experience = Experience.objects.filter(owner = user)
        if len(user) == 0: 
            logger.warning('User ' + user_id + ' not found')
            raise Http404("Пользователя не существует")
        else:
            if user.is_hidden:
                raise Http404("Пользователя не существует")
            else:
                return render(request, '___.html', { 
                    'user': user,
                    'experience': experience
                })

# @login_required
# def my_profile(request):    
#     if request.method == 'GET':
#         user = request.user
#         experience = Experience.objects.filter(owner = user)
#         if user == None: 
#             logger.warning('User ' + user_id + ' not found')
#             raise Http404("User does not exist")
#         else:
#             if user.is_hidden:
#                 raise Http404("User does not exist")
#             else:
#                 return render(request, '___.html', { 
#                     'user': user,
#                     'experience': experience
#                 })        
            

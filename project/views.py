# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from lk_user.models import LkUser
from project.models import Team, Experience, Skill, SkillGroup, Timer
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.mail import send_mail
from lk_user.views import build_skills, get_timer, handle_uploaded_file
from django.db.models import Q, Prefetch
from django.template.loader import render_to_string
from mckinslk.settings import BASE_DIR

import logging
import json
import sys 
import os
import datetime



reload(sys)
sys.setdefaultencoding('utf-8')
logger = logging.getLogger('django')

def test(request):
    if request.method == 'GET':
        params = {}
        
        return render(request, 'test.html', params)      
            

def index(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
        
        timer = get_timer()
        params['is_time'] = timer['is_time']
        params['post_time'] = timer['post_time']
        
        return render(request, 'index.html', params)      
    
    
@login_required(login_url='/participants/auth')
def teams(request):
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
        
        timer = get_timer()
        params['is_time'] = timer['is_time']
        params['post_time'] = timer['post_time']
        logger.info(params)
        return render(request, 'teams.html', params)  


@login_required(login_url='/participants/auth')        
def team_profile(request, team_id):
    team_id = int(team_id)
    if request.method == 'GET':
        params = {}
        
        if request.user.is_authenticated:
            params['user'] = request.user
            
        try:
            params['team'] = Team.objects.filter(id = team_id).prefetch_related(Prefetch('need_skills', to_attr='skills'))[0]
            if params['team'].is_hidden:
                raise Http404("Команда не существует")
            else:
                try:
                    params['profile_user'] = LkUser.objects.get(id = params['team'].creater_id)
                except Exception as e:
                    logger.error('Team with id has no owner', params['team'].id)

                params['team'].accept = False
                params['team'].join = False
                if request.user.is_authenticated and params['team'] in request.user.want_join.all():
                    params['team'].join = True
                
                if request.user.is_authenticated and request.user in params['team'].want_accept.all():
                    params['team'].accept = True
                
                params['members'] = LkUser.objects.filter(team = params['team']).prefetch_related(Prefetch('skills', to_attr='user_skills'))
                
                timer = get_timer()
                params['is_time'] = timer['is_time']
                params['post_time'] = timer['post_time']
                
                if request.GET.get('popup', None):
                    return render(request, 'ajax/team_page.html', params)  
                else:
                    return render(request, 'team_profile.html', params) 
                     
        except Exception as e:
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
                params['members'] = LkUser.objects.filter(team = params['team']).prefetch_related(Prefetch('skills', to_attr='user_skills'))
            
                params['team'].skills = params['team'].need_skills.all()
                params['team'].accept = params['team'].want_accept.all()
                
                params['team'].join = LkUser.objects.filter(want_join__id = params['team'].id)
                params['user'].is_admin = request.user.team.creater_id == request.user.id
                if params['team'].member_count <= 1:
                    params['accept'] = Team.objects.filter(want_accept__id = params['user'].id)
            else:
                params['accept'] = Team.objects.filter(want_accept__id = params['user'].id)
            params['skill_groups'] = build_skills()
            
            timer = get_timer()
            params['is_time'] = timer['is_time']
            params['post_time'] = timer['post_time']
            
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
            
        if Team.objects.filter(name = params['name']):
            result = {'status': 'error', 'message': 'Данное название уже занято'}
            logger.error('Duplicated team name')
        elif len(params['name']) > 20:
            result = {'status': 'error', 'message': 'Название команды должно иметь максимум 20 символов'}
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

            if len(params['name']) > 20:
               return HttpResponse(json.dumps({'status': 'error', 'message': 'Название команды должно иметь максимум 20 символов'}), content_type='application/json')
            
            teams = Team.objects.filter(name=params['name'])
            if len(teams) > 0 and teams[0].id != team.id:
               return HttpResponse(json.dumps({'status': 'error', 'message': 'Данное название команды уже занято'}), content_type='application/json')  
            
            team.name = params['name']


        if params.get('is_hidden'):
            if params['is_hidden'] == 'true':
                team.is_hidden = True 
            elif params['is_hidden'] == 'false':    
                team.is_hidden = False 
        if params.get('delete_users'):
            user_ids = json.loads(params['delete_users'])
            members = LkUser.objects.filter(id__in = user_ids, team = team)
            
            for member in members:
                member.team = None
                member.save()
                
                letter_header = 'Выход из команды'
                letter_body = render_to_string(BASE_DIR + "/templates/letter/delete_from_team.html", {
                    'name': member.name,
                    'team': team,
                })
                
                letter = render_to_string(BASE_DIR + "/templates/letter.html", {
                    'body': letter_body,
                    'header': letter_header,
                })
                
                send_mail(
                    letter_header, 
                    '',
                    'info@bigdata-hack.ru', 
                    [member.email], 
                    fail_silently=False, 
                    html_message = letter
                ) 
                
                
            team.member_count -= len(members)   
        
        if params.get('about'):
            team.about = params['about']

        if params.get('link'):
            team.link = params['link']
            
        if params.get('skills'):    
            skill_ids = json.loads(params['skills'])
            if len(skill_ids) == 0 or len(skill_ids) > 5:
                result = {'status': 'error', 'message': 'Непредвиденная ошибка'}
            skills = Skill.objects.filter(id__in = skill_ids).distinct()
            
            team.need_skills.clear()
            team.need_skills.add(*skills)
                
        if params.get('delete', None):
            members = LkUser.objects.filter(team = team)
            for member in members:
                member.team = None
                member.save()
                
                letter_header = 'Выход из команды'
                letter_body = render_to_string(BASE_DIR + "/templates/letter/delete_from_team.html", {
                    'name': member.name,
                    'team': team,
                })
                
                letter = render_to_string(BASE_DIR + "/templates/letter.html", {
                    'body': letter_body,
                    'header': letter_header,
                })
                
                send_mail(
                    letter_header, 
                    '',
                    'info@bigdata-hack.ru', 
                    [member.email], 
                    fail_silently=False, 
                    html_message = letter
                ) 
            
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
                team = Team.objects.filter(id = params['id']).prefetch_related(Prefetch('want_accept', to_attr='accept'))[0]
            except Exception, e:
                logger.error(e)
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Команда не найдена'}), content_type='application/json')
            
            if team.member_count >= 5:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'В этой команде не осталось свободных мест'}), content_type='application/json')
            
            if team.is_hidden:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Команда не существует'}), content_type='application/json')
            
            try:
                team_owner = LkUser.objects.get(id = team.creater_id)
            except Exception, e:
                logger.error(e)
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Непредвиденная ошибка'}), content_type='application/json')
            
            if request.user in team.accept:
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
                
                letter_header = 'Принятие приглашения в команду'
                letter_body = render_to_string(BASE_DIR + "/templates/letter/joined_team.html", {
                    'name': team_owner.name,
                    'user': request.user,
                })
                
                letter = render_to_string(BASE_DIR + "/templates/letter.html", {
                    'body': letter_body,
                    'header': letter_header,
                })
                
                send_mail(
                    letter_header, 
                    '',
                    'info@bigdata-hack.ru', 
                    [team_owner.email], 
                    fail_silently=False, 
                    html_message = letter
                )
                
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
                
                letter_header = 'Новый запрос в команду'
                letter_body = render_to_string(BASE_DIR + "/templates/letter/request_for_team.html", {
                    'name': team_owner.name,
                    'user': request.user,
                })
                
                letter = render_to_string(BASE_DIR + "/templates/letter.html", {
                    'body': letter_body,
                    'header': letter_header,
                })
                
                send_mail(
                    letter_header, 
                    '',
                    'info@bigdata-hack.ru', 
                    [team_owner.email], 
                    fail_silently=False, 
                    html_message = letter
                )
                
            
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
            try:
                owner = LkUser.objects.get(id = team.creater_id)
            except Exception, e:
                logger.error(e)
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Непредвиденная ошибка'}), content_type='application/json')

                
            
            letter_header = 'Выход из команды'
            letter_body = render_to_string(BASE_DIR + "/templates/letter/leave_team.html", {
                'name': owner.name,
                'user': request.user,
            })
            
            letter = render_to_string(BASE_DIR + "/templates/letter.html", {
                'body': letter_body,
                'header': letter_header,
            })
            
            send_mail(
                letter_header, 
                '',
                'info@bigdata-hack.ru', 
                [owner.email], 
                fail_silently=False, 
                html_message = letter
            ) 
            
            team.member_count -= 1
            request.user.team = None
            team.save()
            request.user.save()
            logger.info('User ' + str(request.user.id) + ' left team ' + str(team.id))
            
        return HttpResponse(json.dumps({'status': 'ok', 'redirect': '/teams'}), content_type='application/json')


def edit_files(request):
    if request.method == 'POST': #POST
        params = request.POST
        
        logger.info(request.FILES)
        logger.info(request)
        logger.info(params)
        
        if not request.user.is_authenticated(): 
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Войдите в свою учетную запись'}), content_type='application/json')  
            
        if not request.user.team or request.user.team.creater_id != request.user.id:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'У пользователя нет команды или прав на ее редактирование'}), content_type='application/json')  
            
        if not (request.FILES.get('file_1') or request.FILES.get('file_2')):
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Пустое поле с файлами'}), content_type='application/json')  
        
        file = request.FILES.get('file_1') or request.FILES.get('file_2')
        
        name = str(file.name) 
        
        if file.size > 10 * 1024 * 1024:
            return HttpResponse(json.dumps({'status': 'error', 'message': 'Слишком большой файл'}), content_type='application/json')  
            
          
        path = os.path.join(BASE_DIR, 'media/files/' + str(request.user.team.id) + '/'+ name)
        try:
            os.makedirs(os.path.join(BASE_DIR, 'media/files/' + str(request.user.team.id)))
        except Exception, e:
            pass
        
        handle_uploaded_file(file, path)
        
        if request.FILES.get('file_1'):
            request.user.team.file_1 = 'files/' + str(request.user.team.id) + '/'+ name
        else:
            request.user.team.file_2 = 'files/' + str(request.user.team.id) + '/'+ name
            
        request.user.team.save()
        return HttpResponse(json.dumps({ 'status': 'ok', 'url': '/media/files/' + str(request.user.team.id) + '/'+ name }), content_type='application/json')


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
            name = params['name'].lower()
            query = query & Q(name__icontains = name)
        
        if params.get('member_count'):
            member_counts = json.loads(params['member_count'])
            query = query & Q(member_count__in = member_counts)

        if params.get('team_need', None) and params['team_need'] == 'true':
            query = query & Q(need_skills__id__in=map(lambda u: u.id, request.user.skills.all()))

        teams = Team.objects.filter(query).prefetch_related(Prefetch('need_skills', to_attr='need_s'))
        logger.info(list(map(lambda u: str(u.id), request.user.skills.all())))
        
        if params.get('name'):
            for team in teams:
                team.pos = team.name.lower().find(name)
            teams = sorted(teams, key = lambda tt: tt.pos)
        
            
        offset = int(params.get('offset', 0))
        limit = int(params.get('limit', 10))
        teams = teams[offset : offset + limit]
        
        if request.user.is_authenticated():
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
        
        timer = get_timer()
        
        if params.get('want_html'):
            return render(request, 'ajax/team.html', { 'teams': teams, 'is_time': timer['is_time'], 'post_time': timer['post_time'] })

        logger.info(datetime.datetime.now() - start)
        
        return HttpResponse(json.dumps({'status': 'ok', 'teams': serializers.serialize("json", teams), 'is_time': timer['is_time'], 'post_time': timer['post_time']}), content_type='application/json')

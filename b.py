import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mckinslk.settings")
django.setup()
from os import sys
import string
import random

from project.models import Team, Skill
from lk_user.models import LkUser

skills = Skill.objects.all()
last_skill = len(skills) - 1

for i in range(1000000):
    name = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(10))
    email = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(10))
    user = None
    try:
        user = LkUser.objects.create(email="{}@{}.ru".format(name, email), name=name[::-1])
    except Exception as e:
        print e.message
        continue
    
    s = set()
    for j in range(5):
        k = random.randint(0, last_skill)
        if k not in s:
            user.skills.add(skills[k])
            s.add(k)

    try:
        user.save()
    except Exception as e:
        print e.message

    print "Create team with name {}@{}.ru".format(name, email)
        
          

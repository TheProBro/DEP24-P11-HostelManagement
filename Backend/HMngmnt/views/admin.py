from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError

from .hostels import sandbox

from ..decorators import admin_required
from ..helpers import parse_xl, extract_roll_number_info
from ..models import CustomUser, Faculty, Student, Batch, Room, Application
from django.core.serializers import serialize

import os
import json
import time

@csrf_exempt
@admin_required
def add_users(request):
    xlFile= request.FILES.get('file')
    type=request.POST.get('type')
    if xlFile:
    # name=request.POST.get('name')
        with open('temp.xlsx', 'wb+') as destination:
            for chunk in xlFile.chunks():
                destination.write(chunk)
        users=parse_xl('temp.xlsx', type)
        # print("here:", users)
        if type=='faculty':
            for userX in users:
                # print(user)
                try:
                    user=CustomUser(name=userX[0], email=userX[1], gender=userX[4])
                    user.set_password('devanshu')
                    user.is_staff=True
                    user.is_active=True
                    user.save()
                    faculty=Faculty(faculty=user, department=userX[2], is_hod=userX[3], faculty_phone=userX[5])
                    faculty.save()
                except IntegrityError as e:
                    pass
        elif type=='student':
            for userX in users:
                user=CustomUser(name=userX[0], email=userX[1], gender=userX[3])
                user.set_password('devanshu')
                user.is_active=True
                batch, roll=extract_roll_number_info(userX[1])
                
                batch, is_created=Batch.objects.get_or_create(batch=batch)
                try:
                    room=Room.objects.get(room_no=userX[6])
                except:
                    room=None
                student=Student(student=user, department=userX[2], student_phone=userX[4], student_roll=roll, student_year=userX[5], student_room=room, student_batch=batch)
                try:
                    user.save()
                    time.sleep(0.1)
                    student.save()
                    time.sleep(0.1)
                except:
                    return JsonResponse({'message': 'Success'}, status=404)
        # delete file temp.xlsx
        os.remove('temp.xlsx')
        sandbox("via admin boys")
        sandbox("via admin girls")
        return JsonResponse({'message': 'Success'})
    else:
        name=request.POST.get('name')
        email=request.POST.get('email')
        phone=request.POST.get('phoneNumber')
        gender=request.POST.get('gender')
        department=request.POST.get('department')
        # roll=request.POST.get('roll') or None
        year=request.POST.get('year') or None
        # print(name, email, phone, gender, department)
        is_hod=request.POST.get('is_hod') 
        if type=='faculty':
            user=CustomUser(name=name, email=email, gender=gender)
            user.set_password('devanshu')
            user.is_staff=True
            user.is_active=True
            user.save()
            faculty=Faculty(faculty=user, department=department, is_hod=False, faculty_phone=phone)
            faculty.save()
        elif type=='student':
            user=CustomUser(name=name, email=email, gender=gender)
            user.set_password('devanshu')
            user.is_active=True
            # print(department, phone, year)
            batch, roll=extract_roll_number_info(email)
            print(batch, roll)
            # save only if dont exist

            batch, is_created=Batch.objects.get_or_create(batch=batch)
            print(batch)
            student=Student(student=user, department=department, student_phone=phone, student_roll=roll, student_year=year, student_batch=batch)
            user.save()
            student.save()
        return JsonResponse({'message': 'Success'})


@csrf_exempt
@admin_required
def get_applications(request):
    applications=Application.objects.select_related('student', 'faculty')
    application_list = [
        {
            'application_id': application.application_id,
            'student': application.student.name,
            'affiliation': application.affiliation,
            'faculty': application.faculty.faculty.name,
            'status': application.status,
            'gender': application.student.gender,
            'hostel': application.application_final.hostel.hostel_name if application.status=='Pending Caretaker Action' else None
        }
        for application in applications
    ]
    print('application_list:', application_list)
    return JsonResponse({'message': 'Admin page', 'data': application_list})


@csrf_exempt
# @admin_required
def get_students(request):
    students = Student.objects.select_related('student').all()
    students_list = [
        {
            'student_name': student.student.name,
            'department': student.department,
            'student_phone': student.student_phone,
            'student_roll': student.student_roll,
            'student_year': student.student_year,
            'student_room': student.student_room.room_no if student.student_room else None,
            'student_batch': student.student_batch.batch if student.student_batch else None,
            'student_hostel': student.student_room.hostel.hostel_name if student.student_room else None,
            'student_hostel_wing': student.student_room.hostel_wing.wing_name if student.student_room else None,
            'student_hostel_gender': student.student_room.hostel_wing.wing_type if student.student_room else None,
            'student_email': student.student.email,
        }
        for student in students
    ]

    return JsonResponse({'message': 'List of Students', 'data': students_list})

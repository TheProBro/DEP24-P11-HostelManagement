import time
from django.core.serializers import serialize
from django.db.models import F, Q
import json
import base64
from .models import CustomUser, Faculty, Hostel, Student, Wing, Room, Batch, Warden, Caretaker
import pandas as pd
import re
import random
import math

def generate_otp():
    # 4 digit otp may start with 0
    return random.randint(1000, 9999)

def extract_roll_number_info(roll_number):
    pattern = r'(\d{4}|\d{2})([A-Za-z]{3})(\d{4})'
    match = re.search(pattern, roll_number)

    if match:
        year = match.group(1)
        batch = match.group(2)
        return (year + batch.upper()[2], year+batch.upper()+match.group(3))  # Concatenating year and batch
    else:
        return None  # Return None if the roll number doesn't match the pattern

def get_user_dict(user):
    roles=[]
    user_json={}
    if hasattr(user, 'student'):
        roles.append('student')
        roles.append('college student')
    elif hasattr(user, 'faculty'):
        roles.append('faculty')
        fac=user.faculty
        if hasattr(fac, 'warden'):
            warden=fac.warden
            if warden.is_chief_warden:
                roles.append('chief warden')
            else:
                roles.append('warden')
    elif hasattr(user, 'warden'):
        roles.append('warden')
        warden=user.warden
        if warden.is_chief_warden:
            roles.append('chief warden')
        else:
            user_json['hostel']=user.warden.hostel.hostel_no
            user_json['hostel_name']=user.warden.hostel.hostel_name
            roles.append(user.warden.hostel.hostel_name)
    elif user.is_superuser:
        roles.append('admin')
    elif user.is_staff:
        roles.append('staff')
        if hasattr(user, 'caretaker'):
            roles.append('caretaker')
            roles.append(user.caretaker.hostel.hostel_name)
            user_json['hostel']=user.caretaker.hostel.hostel_no
            user_json['hostel_name']=user.caretaker.hostel.hostel_name
    else:
        roles.append('outside student')
        roles.append('student')
    
    user_json['name']=user.name
    user_json['email']=user.email
    user_json['roles']=roles
    user_json['is_superuser']=user.is_superuser
    user_json['is_staff']=user.is_staff
    if 'faculty' in roles:
        user_json['department']=user.faculty.department
        user_json['is_hod']=user.faculty.is_hod
    # print(user_json)
    return user_json

def handle_file_attachment(field):
    try:
        with open(field, 'rb') as f:
            content=base64.b64encode(f.read()).decode('utf-8')
        # print(content[:100])
        return content
    except:
        return None
    
def parse_xl(file, type):
    try:
        df = pd.read_excel(file)

        # Print column names
        # print(df.columns)

        # Print the first few rows (you can change 'head(5)' to any number)
        # print(df.head(5))

        # Extract and process data
        users = []
        if type == 'faculty':
            for index, row in df.iterrows():
                name = row['Name']
                email = row['Email']
                department = row['Department']
                gender=row['Gender']
                phone=row['Phone']
                hod_status = bool(row['is_HOD'])  # Convert to boolean if necessary
                users.append((name, email, department, hod_status, gender, phone))
        elif type == 'student':
            for index, row in df.iterrows():
                name = row['Name']
                email = row['Email']
                department = row['Department']
                gender=row['Gender']
                phone=row['Phone']
                year = row['Year']
                room_no = row['Room No'] if 'Room No' in df.columns else None
                users.append((name, email, department, gender, phone, year, room_no))

        return users
    except Exception as e:
        # print(e)
        return None
    

def group_students(new_distribution: list, old_distribution: list, student_set, batch: Batch, wings: list[Wing]):
    sorted_arr=list(enumerate([i-j for i, j in zip(new_distribution, old_distribution)]))
    print("batch:", batch.batch)
    sorted_arr.sort(key=lambda x: x[1])
    for idx, val in sorted_arr:
        if val<0:
            wing=wings[idx]
            rooms=wing.room_set.filter(current_occupancy__gt=0, student__student_batch=batch)
            room_capacity=rooms[0].room_occupancy
            num_of_rooms_to_vacate=math.ceil(abs(val)/room_capacity)
            rooms=random.sample(list(rooms), num_of_rooms_to_vacate)
            tot=-val
            for room in rooms:
                students=room.student_set.all()
                for s in students:
                    print(s.student_roll, s.student_room.room_no, s.student_prev_room)
                    s.student_prev_room=s.student_room
                    s.student_room=None
                    s.save()
                    time.sleep(0.05)
                    student_set.append(s)
                    print(student_set)
                    tot-=1
                    if tot==0:
                        break

            # students=Student.objects.filter(student_room__hostel_wing=wing, student_batch=batch)
            # popped=random.sample(list(students), abs(val))
            # student_set.extend(popped)
            # for s in popped:
            #     s.student_prev_room=s.student_room.room_no
            #     s.student_room=None
            #     s.save()
        elif val>0:
            wing=wings[idx]
            print('val:',val, 'students', len(student_set))
            students=random.sample(student_set, val)
            student_set=[s for s in student_set if s not in students]
            rooms_with_capacity = wing.room_set.filter(current_occupancy=0)
            # rooms_with_capacity=rooms_with_capacity.filter( Q(student=None) | Q(student__student_batch=batch) )
            rooms_with_capacity=list(rooms_with_capacity)
            print("rooms:",len(rooms_with_capacity), "wing:", wing.wing_name,  "students:", len(students))
            room_capacity=rooms_with_capacity[0].room_occupancy
            # split students into groups of room_capacity
            students=[students[i:min(i+room_capacity, len(students))] for i in range(0, len(students), room_capacity)]
            for s in students:
                room=random.choice(rooms_with_capacity)
                for x in s:
                    x.student_room=room
                    x.save()
                    time.sleep(0.03)
                if room.current_occupancy==room.room_occupancy:
                    rooms_with_capacity.remove(room)
            # for s in students:
            #     room=random.choice(rooms_with_capacity)
            #     s.student_room=room
            #     s.save()
            #     for x in room.student_set.all():
            #         print(x.student_batch)
            #     if room.current_occupancy==room.room_occupancy:
            #         rooms_with_capacity.remove(room)
        else:
            # mark prev as current
            wing=wings[idx]
            students=Student.objects.filter(student_room__hostel_wing=wing, student_batch=batch)
            for s in students:
                s.student_prev_room=s.student_room
                s.save()



def extra_function():
    wing=Wing.objects.get(wing_name='Beas West')
    rooms=wing.room_set.all()
    print(rooms)
    for room in rooms:
        stds=room.student_set.all()
        if len(stds) and stds[0].student_batch.batch=='2020B':
            for s in stds:
                print(room.room_no, s.student_roll)
            # print(room.room_no, stds[1].student_roll)

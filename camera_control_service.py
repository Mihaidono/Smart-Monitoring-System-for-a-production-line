import json
import os
from datetime import datetime

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

previous_position = {}
current_position = {}


def detect_camera_movement() -> bool:
    global previous_position
    if len(previous_position) == 0:
        return False
    elif previous_position['tilt'] != current_position['tilt'] or previous_position['pan'] != current_position['pan']:
        return True
    return False


def move_camera_left_5_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_left', 'degree': 5})


def move_camera_right_5_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_right', 'degree': 5})


def move_camera_up_5_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_up', 'degree': 5})


def move_camera_down_5_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_down', 'degree': 5})


def move_camera_left_10_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_left', 'degree': 10})


def move_camera_right_10_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_right',
                        'degree': 10})


def move_camera_up_10_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_up', 'degree': 10})


def move_camera_down_10_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_down', 'degree': 10})


def move_camera_left_20_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_left',
                        'degree': 20})


def move_camera_right_20_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_right',
                        'degree': 20})


def move_camera_up_20_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_up', 'degree': 20})


def move_camera_down_20_degrees():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_down', 'degree': 20})


def set_camera_position_home():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'home'})


def set_camera_position_stop():
    client_txt.publish('o/ptu',
                       {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'stop'})


def on_connect_txt(client, userdata, flags, rc):
    client.subscribe('i/ptu/pos')


def on_message_txt(client, userdata, msg):
    global previous_position
    global current_position
    current_position = json.loads(msg.payload)
    if detect_camera_movement():
        previous_position = current_position


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")  # single value
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')  # one /more values separated by ,
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))  # single value
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))  # single value
username = os.getenv('TXT_USERNAME')  # single value
passwd = os.getenv('TXT_PASSWD')  # single value

client_txt = mqtt.Client()
client_txt.on_connect = on_connect_txt
client_txt.on_message = on_message_txt
client_txt.username_pw_set(username=username, password=passwd)

try:
    client_txt.connect(host=txt_broker_address, port=port_used, keepalive=keep_alive, )
    print("Successfully connected to TXT Controller")
    client_txt.loop_forever()
except TimeoutError as ex:
    print(f'Failed to connect to TXT: {ex}')
    exit(-1)
except Exception as ex:
    print(f'Failed to continue because of {ex}')
    exit(-1)

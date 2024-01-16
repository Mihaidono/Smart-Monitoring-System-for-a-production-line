import json
import os
import time
from datetime import datetime

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

previous_position = {}
current_position = {}

home_position_coord = (-0.06000000238418579, 0.09981644153594971)


def detect_camera_movement() -> bool:
    global previous_position
    global current_position
    if len(previous_position) == 0 and len(current_position) == 0:
        return False
    elif len(previous_position) == 0 and len(current_position) != 0:
        previous_position = current_position
        return False
    elif previous_position['tilt'] != current_position['tilt'] or previous_position['pan'] != current_position['pan']:
        previous_position = current_position
        return True
    return False


def wait_camera_to_stabilize():
    standby_count = 0
    while True:
        time.sleep(2)
        if not detect_camera_movement():
            standby_count += 1
        if standby_count == 3:
            break


def move_camera_left_5_degrees():
    client_txt.publish('o/ptu',
                       json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_left',
                                   'degree': 5}))
    time.sleep(1)


def move_camera_right_5_degrees():
    client_txt.publish('o/ptu',
                       json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_right',
                                   'degree': 5}))
    time.sleep(1)


def move_camera_up_5_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_up',
                            'degree': 5}))
    time.sleep(1)


def move_camera_down_5_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_down',
                            'degree': 5}))
    time.sleep(1)


def move_camera_left_10_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': 'relmove_left',
                            'degree': 10}))
    time.sleep(1.5)


def move_camera_right_10_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                            'cmd': 'relmove_right',
                            'degree': 10}))
    time.sleep(1.5)


def move_camera_up_10_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                            'cmd': 'relmove_up', 'degree': 10}))
    time.sleep(1.5)


def move_camera_down_10_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                            'cmd': 'relmove_down',
                            'degree': 10}))
    time.sleep(1.5)


def move_camera_left_20_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                            'cmd': 'relmove_left',
                            'degree': 20}))
    time.sleep(1.5)


def move_camera_right_20_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                            'cmd': 'relmove_right',
                            'degree': 20}))
    time.sleep(1.5)


def move_camera_up_20_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                            'cmd': 'relmove_up',
                            'degree': 20}))
    time.sleep(1.5)


def move_camera_down_20_degrees():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime(
                               "%Y-%m-%dT%H:%M:%S.%fZ"),
                               'cmd': 'relmove_down', 'degree': 20}))
    time.sleep(1.5)


def move_camera_right_max():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime(
                               "%Y-%m-%dT%H:%M:%S.%fZ"),
                               'cmd': 'end_pan'}))
    time.sleep(0.5)


def move_camera_left_max():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime(
                               "%Y-%m-%dT%H:%M:%S.%fZ"),
                               'cmd': 'start_pan'}))
    time.sleep(0.5)


def set_camera_position_home():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime(
                               "%Y-%m-%dT%H:%M:%S.%fZ"),
                               'cmd': 'home'}))
    time.sleep(0.5)


def set_camera_position_stop():
    client_txt.publish('o/ptu',
                       json.dumps(
                           {'ts': datetime.utcnow().strftime(
                               "%Y-%m-%dT%H:%M:%S.%fZ"),
                               'cmd': 'stop'}))
    time.sleep(0.5)


def set_camera_position_default():
    print("Setting camera position to default ...")
    if round(current_position['tilt'], 7) == round(home_position_coord[0], 7) and \
            round(current_position['pan'], 7) == round(home_position_coord[1], 7):
        move_camera_left_5_degrees()

    set_camera_position_home()
    wait_camera_to_stabilize()

    move_camera_right_max()
    wait_camera_to_stabilize()

    move_camera_down_10_degrees()
    move_camera_down_5_degrees()
    wait_camera_to_stabilize()
    print("Default position assumed")


def get_camera_position():
    if current_position:
        return current_position['tilt'], current_position['pan']
    return None, None


def set_camera_position_to_process_start():
    move_camera_left_20_degrees()
    move_camera_left_20_degrees()
    move_camera_left_20_degrees()
    wait_camera_to_stabilize()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.connected_flag = True
        client.subscribe('i/ptu/pos')


def on_message_txt(client, userdata, msg):
    global current_position
    current_position = json.loads(msg.payload)


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))
    client.loop_stop()


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
username = os.getenv('TXT_USERNAME')
passwd = os.getenv('TXT_PASSWD')

client_txt_name = "CameraControlService"
client_txt = mqtt.Client(client_id=client_txt_name)
client_txt.on_connect = on_connect_txt
client_txt.on_message = on_message_txt
client_txt.on_disconnect = on_disconnect
client_txt.username_pw_set(username=username, password=passwd)

try:
    client_txt.connect(host=txt_broker_address, port=port_used, keepalive=keep_alive)
    client_txt.loop_start()
except TimeoutError as ex:
    print(f'{client_txt_name} failed to connect to TXT: {ex}')
    client_txt.disconnect()
    exit(-1)
except Exception as ex:
    print(f'{client_txt_name} failed to continue because of {ex}')
    client_txt.disconnect()
    exit(-1)

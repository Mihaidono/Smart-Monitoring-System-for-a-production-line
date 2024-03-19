import json
import os
import time
from datetime import datetime

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()


class FischertechnikModuleLocations:
    HOME = (0.102, -0.064)
    WAREHOUSE = (0.995, -0.242)
    PROCESSING_STATION = (0.330, -0.242)
    SORTING_LINE = (-0.229, -0.358)
    SHIPPING = (-0.117, -0.135)

    @classmethod
    def get_location_name(cls, location_tuple):
        """
        Returns the name of the location corresponding to the given tuple.
        If no match is found, returns None.
        """
        for name, value in cls.__dict__.items():
            if isinstance(value, tuple) and value == location_tuple:
                return name
        return None


class CameraDirections:
    LEFT = 'relmove_left'
    RIGHT = 'relmove_right'
    UP = 'relmove_up'
    DOWN = 'relmove_down'
    MAX_RIGHT = 'end_pan'
    MAX_LEFT = 'start_pan'
    HOME = 'home'


class CameraDegrees:
    TWENTY = 20
    TEN = 10
    FIVE = 5
    TWO = 2


previous_position = {}
current_position = {}
current_module = FischertechnikModuleLocations.HOME

client_txt = None
client_txt_name = "CameraControlService"


def is_module_equal(module1, module2):
    if abs(module1[0] - module2[0]) > 0.05:
        return False
    elif abs(module1[1] - module2[1]) > 0.05:
        return False
    return True


def update_current_module():
    global current_module
    if FischertechnikModuleLocations.WAREHOUSE[0] - 0.05 <= round(current_position['pan'], 3) <= \
            FischertechnikModuleLocations.WAREHOUSE[0] + 0.05 and FischertechnikModuleLocations.WAREHOUSE[1] - 0.05 <= \
            round(current_position['tilt'], 3) <= FischertechnikModuleLocations.WAREHOUSE[1] + 0.05:
        current_module = FischertechnikModuleLocations.WAREHOUSE
        return

    if FischertechnikModuleLocations.SORTING_LINE[0] - 0.05 <= round(current_position['pan'], 3) <= \
            FischertechnikModuleLocations.SORTING_LINE[0] + 0.05 and \
            FischertechnikModuleLocations.SORTING_LINE[1] - 0.05 <= \
            round(current_position['tilt'], 3) <= FischertechnikModuleLocations.SORTING_LINE[1] + 0.05:
        current_module = FischertechnikModuleLocations.SORTING_LINE
        return

    if FischertechnikModuleLocations.SHIPPING[0] - 0.05 <= round(current_position['pan'], 3) <= \
            FischertechnikModuleLocations.SHIPPING[0] + 0.05 and FischertechnikModuleLocations.SHIPPING[1] - 0.05 <= \
            round(current_position['tilt'], 3) <= FischertechnikModuleLocations.SHIPPING[1] + 0.05:
        current_module = FischertechnikModuleLocations.SHIPPING
        return

    if round(current_position['pan'], 3) <= FischertechnikModuleLocations.PROCESSING_STATION[0]:
        current_module = FischertechnikModuleLocations.PROCESSING_STATION
        return


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


def move_camera(direction: CameraDirections | str, degrees: CameraDegrees | int = None):
    if direction == CameraDirections.HOME:
        client_txt.publish('o/ptu',
                           json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': direction}))
        time.sleep(0.5)
    elif direction == CameraDirections.MAX_LEFT:
        client_txt.publish('o/ptu',
                           json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': direction}))
        time.sleep(0.5)
    elif direction == CameraDirections.MAX_RIGHT:
        client_txt.publish('o/ptu',
                           json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': direction}))
        time.sleep(0.5)
    else:
        client_txt.publish('o/ptu',
                           json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'cmd': direction,
                                       'degree': degrees}))
        time.sleep(1)


def set_camera_position_default():
    print("Setting camera position to default ...")
    if round(current_position['tilt'], 3) == round(FischertechnikModuleLocations.HOME[0], 3) and \
            round(current_position['pan'], 3) == round(FischertechnikModuleLocations.HOME[1], 3):
        move_camera(CameraDirections.LEFT, CameraDegrees.FIVE)

    move_camera(CameraDirections.HOME)
    wait_camera_to_stabilize()

    move_camera(CameraDirections.MAX_RIGHT)
    wait_camera_to_stabilize()

    move_camera(CameraDirections.DOWN, CameraDegrees.TEN)
    move_camera(CameraDirections.DOWN, CameraDegrees.FIVE)

    wait_camera_to_stabilize()
    print("Default position assumed")


def get_camera_position():
    if current_position:
        return current_position['tilt'], current_position['pan']
    return None, None


def set_camera_position_to_process_start():
    move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)
    move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)
    move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)

    wait_camera_to_stabilize()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.connected_flag = True
        client.subscribe('i/ptu/pos')


def on_message_txt(client, userdata, msg):
    global current_position
    current_position = json.loads(msg.payload)
    update_current_module()


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))
    client.loop_stop()


def start_camera_control_service():
    global client_txt
    global client_txt_name

    txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
    port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
    keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
    username = os.getenv('TXT_USERNAME')
    passwd = os.getenv('TXT_PASSWD')

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
        raise Exception("Camera control client got disconnected")
    except Exception as ex:
        print(f'{client_txt_name} failed to continue because of {ex}')
        client_txt.disconnect()
        raise Exception("Camera control client got disconnected")

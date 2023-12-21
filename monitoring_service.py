import base64
import json
import os
import threading
import time
from datetime import datetime, timedelta
from typing import List

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

import camera_control_service as camera_control
from storage_detection_model import container_detector

load_dotenv()

camera_standby_timer = os.getenv("CAMERA_STANDBY_TIME")
is_camera_moving = True

previous_timestamp = datetime.utcnow()

prev_frame_with_detected_objects = []
reoccurrence_matrix = np.zeros((3, 3))

json_mqtt_data = {}


def check_workpiece_movement(prev_frame_workpiece, crt_frame_workpiece) -> bool:
    if (prev_frame_workpiece is tuple and crt_frame_workpiece is not tuple) or (
            type(prev_frame_workpiece) is int and type(crt_frame_workpiece) is int and crt_frame_workpiece == 0 and prev_frame_workpiece == 0):
        return True
    return False


def decode_image_from_base64(json_message: dict) -> cv2.typing.MatLike:
    image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
    image_np = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(image_np, cv2.IMREAD_COLOR)


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def has_object_moved(filled_coordinate_matrix: List[List]):
    global prev_frame_with_detected_objects
    global reoccurrence_matrix

    if len(prev_frame_with_detected_objects) == 0:
        prev_frame_with_detected_objects = filled_coordinate_matrix
        return False

    for idx in range(0, len(filled_coordinate_matrix)):
        for jdx in range(0, len(filled_coordinate_matrix)):
            if check_workpiece_movement(prev_frame_with_detected_objects[idx][jdx], filled_coordinate_matrix[idx][jdx]):
                reoccurrence_matrix[idx][jdx] += 1
            else:
                reoccurrence_matrix[idx][jdx] = 0

    prev_frame_with_detected_objects = filled_coordinate_matrix
    if any(3 in column for column in reoccurrence_matrix):
        reoccurrence_matrix = np.zeros((3, 3))
        return True
    return False


def initiate_camera_position():
    global is_camera_moving
    is_camera_moving = True
    initiate_camera_pos_thread = threading.Thread(target=camera_control.set_camera_position_default())
    initiate_camera_pos_thread.start()
    initiate_camera_pos_thread.join()
    is_camera_moving = False


def process_start_camera_position():
    global is_camera_moving
    is_camera_moving = True
    process_start_camera_pos = threading.Thread(target=camera_control.set_camera_position_to_process_start())
    process_start_camera_pos.start()
    process_start_camera_pos.join()
    is_camera_moving = False


def on_message_txt(client, userdata, msg):
    global previous_timestamp
    global json_mqtt_data
    json_message = json.loads(msg.payload)
    if "data" in json_message and "ts" in json_message:
        current_timestamp = datetime.strptime(json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ")
        if previous_timestamp + timedelta(seconds=1) <= current_timestamp:
            json_mqtt_data = json_message
            previous_timestamp = current_timestamp


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))
    client.loop_stop()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.connected_flag = True
        client.subscribe('i/cam')


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
username = os.getenv('TXT_USERNAME')
passwd = os.getenv('TXT_PASSWD')

client_txt_name = "MonitoringService"
client_txt = mqtt.Client(client_id=client_txt_name)
client_txt.on_connect = on_connect_txt
client_txt.on_message = on_message_txt
client_txt.on_disconnect = on_disconnect

try:
    client_txt.connect(host=txt_broker_address, port=port_used, keepalive=keep_alive)
    client_txt.loop_start()
except TimeoutError as ex:
    print(f'{client_txt_name} failed to connect to TXT: {ex}')
    client_txt.disconnect()
except Exception as ex:
    print(f'{client_txt_name} failed to continue because of {ex}')
    client_txt.disconnect()

initiate_camera_position()

while True:
    if json_mqtt_data and is_camera_moving is False:
        img = decode_image_from_base64(json_mqtt_data)
        if img is not None:
            coordinates_matrix = container_detector.identify_container_units(img,
                                                                             float(os.getenv('RECOGNITION_THRESHOLD')))
            filled_coordinates_matrix = container_detector.get_missing_storage_spaces(coordinates_matrix)
            if has_object_moved(filled_coordinates_matrix):
                print("Starting surveillance of the in-delivery workpiece")
                process_start_camera_position()
                # ---------- start following the workpiece here ----------
        else:
            print("Failed to decode the image")
    time.sleep(1)

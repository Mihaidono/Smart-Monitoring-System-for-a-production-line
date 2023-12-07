import base64
import json
import os
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
previous_timestamp = datetime.utcnow()

first_frame_with_detected_objects = []
second_frame_with_detected_objects = []

previous_img = None


def decode_image_from_base64(json_message: dict) -> cv2.typing.MatLike:
    image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
    image_np = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(image_np, cv2.IMREAD_COLOR)


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def has_object_moved(filled_coordinate_matrix: List[List]):
    global first_frame_with_detected_objects
    global second_frame_with_detected_objects

    if len(first_frame_with_detected_objects) == 0:
        first_frame_with_detected_objects = filled_coordinate_matrix
        return False

    if len(second_frame_with_detected_objects) == 0:
        second_frame_with_detected_objects = filled_coordinate_matrix
        return False

    for idx in range(len(filled_coordinate_matrix)):
        for jdx in range(len(filled_coordinate_matrix)):
            if isinstance(second_frame_with_detected_objects[idx][jdx], type(filled_coordinate_matrix[idx][jdx])) and \
                    not isinstance(first_frame_with_detected_objects[idx][jdx],
                                   type(filled_coordinate_matrix[idx][jdx])):
                return True

    first_frame_with_detected_objects = []
    second_frame_with_detected_objects = []
    return False


def on_message_txt(client, userdata, msg):
    global previous_timestamp
    global previous_img

    json_message = json.loads(msg.payload)
    if "data" in json_message and "ts" in json_message:
        current_timestamp = datetime.strptime(json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ")
        if previous_timestamp + timedelta(seconds=1) <= current_timestamp:
            previous_timestamp = current_timestamp
            img = decode_image_from_base64(json_message)
            if img is not None:
                coordinates_matrix = container_detector.identify_container_units(os.getenv('YOLO_MODEL_PATH'), img,
                                                                                 float(os.getenv(
                                                                                     'RECOGNITION_THRESHOLD'))) # rulez pe thread separat si astept executia
                filled_coordinates_matrix = container_detector.get_missing_storage_spaces(coordinates_matrix)
                if has_object_moved(filled_coordinates_matrix):
                    camera_control.set_camera_position_default()
                # camera_control.set_camera_position_default()
            else:
                print("Failed to decode the image")


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
    client_txt.loop_forever()
except TimeoutError as ex:
    print(f'{client_txt_name} failed to connect to TXT: {ex}')
    client_txt.disconnect()
except Exception as ex:
    print(f'{client_txt_name} failed to continue because of {ex}')
    client_txt.disconnect()

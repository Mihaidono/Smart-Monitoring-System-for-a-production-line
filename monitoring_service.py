import base64
import json
import os
from typing import List

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

from storage_detection_model import container_detector
import camera_control_service as camera_control

load_dotenv()

camera_standby_timer = os.getenv("CAMERA_STANDBY_TIME")

start_frame_positions = []
previous_frame_positions = []


def is_processing_starting(current_frame_positions: List[float]) -> bool:
    global previous_frame_positions
    global start_frame_positions

    if not start_frame_positions:
        start_frame_positions = current_frame_positions
        return False

    if not previous_frame_positions and start_frame_positions != current_frame_positions:
        previous_frame_positions = current_frame_positions
        return False

    if current_frame_positions != previous_frame_positions and current_frame_positions != start_frame_positions:
        start_frame_positions = []
        previous_frame_positions = []
        return True

    return False


def decode_image_from_base64(json_message: dict) -> cv2.typing.MatLike:
    image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
    image_np = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(image_np, cv2.IMREAD_COLOR)


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.subscribe('i/ptu/pos')


def on_message_txt(client, userdata, msg):
    json_message = json.loads(msg.payload)
    if "data" in json_message:
        img = decode_image_from_base64(json_message)
        if img is not None:
            coordinates = container_detector.identify_container_units(os.getenv('YOLO_MODEL_PATH'), img,
                                                                      float(os.getenv('RECOGNITION_THRESHOLD')))

            camera_control.set_camera_position_default()
        # TODO: de adaugat camera_control
        else:
            print("Failed to decode the image")


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))
    client.loop_stop()


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
username = os.getenv('TXT_USERNAME')
passwd = os.getenv('TXT_PASSWD')

client_txt_name = "MonitoringService"
client_txt = mqtt.Client()
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

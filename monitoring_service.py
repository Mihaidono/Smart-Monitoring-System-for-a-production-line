import base64
import json
import os
from typing import List

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

from storage_detection_model import container_detector

load_dotenv()

camera_standby_timer = 0

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
    for topic in txt_topics_to_subscribe:
        client.subscribe(topic)


def on_message_txt(client, userdata, msg):
    json_message = json.loads(msg.payload)
    if "data" in json_message:
        img = decode_image_from_base64(json_message)
        if img is not None:
            coordinates = container_detector.identify_container_units(os.getenv('YOLO_MODEL_PATH'), img,
                                                                      float(os.getenv('RECOGNITION_THRESHOLD')))

        # TODO: de adaugat camera_control
        else:
            print("Failed to decode the image")


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
username = os.getenv('TXT_USERNAME')
passwd = os.getenv('TXT_PASSWD')

client_txt = mqtt.Client("MonitoringServiceMQTTClient")
client_txt.on_connect = on_connect_txt
client_txt.on_message = on_message_txt

try:
    client_txt.connect(host=txt_broker_address, port=port_used, keepalive=keep_alive)
    print("Successfully connected to TXT Controller")
    client_txt.loop_forever()
except TimeoutError as ex:
    print(f'Failed to connect to TXT: {ex}')
    exit(-1)
except Exception as ex:
    print(f'Failed to continue because of {ex}')
    exit(-1)

import base64
import json
import os
import time
from datetime import datetime

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

from storage_detection_model import container_detector

load_dotenv()

camera_standby_timer = os.getenv("CAMERA_STANDBY_TIME")
previous_timestamp = datetime.utcnow()


def decode_image_from_base64(json_message: dict) -> cv2.typing.MatLike:
    image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
    image_np = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(image_np, cv2.IMREAD_COLOR)


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.subscribe('i/cam')


def on_message_txt(client, userdata, msg):
    global previous_timestamp
    json_message = json.loads(msg.payload)
    if "data" in json_message:
        if "ts" in json_message:
            current_timestamp = datetime.strptime(json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ")
            if previous_timestamp < current_timestamp:
                previous_timestamp = current_timestamp
                img = decode_image_from_base64(json_message)
                if img is not None:
                    coordinates = container_detector.identify_container_units(os.getenv('YOLO_MODEL_PATH'), img,
                                                                              float(os.getenv('RECOGNITION_THRESHOLD')))
                    print("Lines: ", len(coordinates))
                    for column in coordinates:
                        print(len(column), end=",")
                    print()
                    # camera_control.set_camera_position_default()
                else:
                    print("Failed to decode the image")
    time.sleep(0.5)


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
    client_txt.loop_forever()
except TimeoutError as ex:
    print(f'{client_txt_name} failed to connect to TXT: {ex}')
    client_txt.disconnect()
except Exception as ex:
    print(f'{client_txt_name} failed to continue because of {ex}')
    client_txt.disconnect()

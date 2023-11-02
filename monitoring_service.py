import base64
import json
import os

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

from storage_detection_model import container_detector

load_dotenv()


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def on_connect_txt(client, userdata, flags, rc):
    for topic in txt_topics_to_subscribe:
        client.subscribe(topic)


def on_message_txt(client, userdata, msg):
    json_message = json.loads(msg.payload)
    if "data" in json_message:
        image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
        image_np = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if img is not None:
            container_detector.identify_container_units(os.getenv('YOLO_MODEL_PATH'), img,
                                                        float(os.getenv('RECOGNITION_THRESHOLD')))
            # client_txt.publish()
        else:
            print("Failed to decode the image")


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")  # single value
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')  # one /more values separated by ,
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))  # single value
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))  # single value

client_txt = mqtt.Client()
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

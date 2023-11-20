import base64
import hashlib
import json
import os

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

previous_img = None
threshold = 0


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def on_connect_txt(client, userdata, flags, rc):
    for topic in txt_topics_to_subscribe:
        client.subscribe(topic)


def on_message_txt(client, userdata, msg):
    global previous_img
    global threshold
    json_message = json.loads(msg.payload)
    if "data" in json_message:
        image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
        image_np = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if img is not None:
            if previous_img is None:
                previous_img = np.zeros_like(img)
                gray_diff = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                threshold = 0.8 * np.sum(gray_diff)
            diff = cv2.absdiff(img, previous_img)
            gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            if np.sum(gray_diff) >= threshold:
                hashed_image_timestamp = hashlib.sha256(json_message["ts"].encode()).hexdigest()
                previous_img = np.copy(img)
                cv2.imshow(f'Image {hashed_image_timestamp} ', img)
                key_pressed = cv2.waitKey(0)
                if key_pressed == ord('s'):
                    cv2.imwrite(f'fischercam_images/{hashed_image_timestamp}.jpg', img)
                    print(f"Successfully saved {hashed_image_timestamp}.jpg")
                cv2.destroyAllWindows()
            else:
                print(".", end="")
        else:
            print("Failed to decode the image")


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))

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

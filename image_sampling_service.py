import base64
import hashlib
import json
import os
import time

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

previous_img = None
threshold = 0.3


def sample_images_by_user_input(json_content: dict):
    global previous_img
    global threshold
    if "data" in json_content:
        image_data = base64.b64decode(strip_encoded_image_data(json_content['data']))
        image_np = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if img is not None:
            if previous_img is None:
                previous_img = np.zeros_like(img)
                gray_diff = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                threshold *= np.sum(gray_diff)
            diff = cv2.absdiff(img, previous_img)
            gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            if np.sum(gray_diff) >= threshold:
                hashed_image_timestamp = hashlib.sha256(json_content["ts"].encode()).hexdigest()
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


def sample_images_automatically(json_content: dict):
    if "data" in json_content:
        image_data = base64.b64decode(strip_encoded_image_data(json_content['data']))
        image_np = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if img is not None:
            hashed_image_timestamp = hashlib.sha256(json_content["ts"].encode()).hexdigest()
            cv2.imwrite(f'images_before_scaling/{hashed_image_timestamp}.jpg', img)
            time.sleep(5)
        else:
            print("Failed to decode the image")


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.subscribe('i/cam')


def on_message_txt(client, userdata, msg):
    json_message = json.loads(msg.payload)
    if is_sampling_automated:
        sample_images_automatically(json_message)
    else:
        sample_images_by_user_input(json_message)


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))
    client.loop_stop()


is_sampling_automated = True if (os.getenv("IS_AUTOMATED").lower() == "true") else False
sampling_period = int(os.getenv("SAMPLING_PERIOD"))

txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))

client_txt_name = "ImageSamplingService"
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

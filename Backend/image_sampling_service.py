import base64
import hashlib
import json
import os
import threading
import time
from datetime import datetime, timedelta

import cv2
import numpy as np
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

previous_img = None
previous_timestamp = datetime.utcnow()
is_img_processing = False
threshold = float(os.getenv("SIMILARITY_THRESHOLD"))
output_folder = "sampled_images_empty_storage"
os.mkdir(output_folder)


def decode_image_from_base64(json_message: dict) -> cv2.typing.MatLike:
    image_data = base64.b64decode(strip_encoded_image_data(json_message["data"]))
    image_np = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(image_np, cv2.IMREAD_COLOR)


def sample_images_by_user_input(json_content: dict):
    global previous_img
    global threshold
    if "data" in json_content:
        img = decode_image_from_base64(json_content)
        if img is not None:
            if previous_img is None:
                previous_img = np.zeros_like(img)
                gray_diff = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                threshold *= np.sum(gray_diff)
            diff = cv2.absdiff(img, previous_img)
            gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            if np.sum(gray_diff) >= threshold:
                hashed_image_timestamp = hashlib.sha256(
                    json_content["ts"].encode()
                ).hexdigest()
                previous_img = np.copy(img)
                cv2.imshow(f"Image {hashed_image_timestamp} ", img)
                key_pressed = cv2.waitKey(0)
                if key_pressed == ord("s"):
                    cv2.imwrite(f"{output_folder}/{hashed_image_timestamp}.jpg", img)
                    print(f"Successfully saved {hashed_image_timestamp}.jpg")
                cv2.destroyAllWindows()
            else:
                print(".", end="")
        else:
            print("Failed to decode the image")


def sample_images_automatically(json_content: dict):
    global is_img_processing
    is_img_processing = True
    if "data" in json_content:
        image_data = base64.b64decode(strip_encoded_image_data(json_content["data"]))
        image_np = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if img is not None:
            hashed_image_timestamp = hashlib.sha256(
                json_content["ts"].encode()
            ).hexdigest()
            cv2.imwrite(f"{output_folder}/{hashed_image_timestamp}.jpg", img)
            print(f"Successfully saved image {hashed_image_timestamp}")
            time.sleep(sampling_period)
            is_img_processing = False
        else:
            print("Failed to decode the image")


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(",", 1)[-1].strip()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        client.connected_flag = True
        client.subscribe("i/cam")
        print(f"Successfully connected client {client_txt_name} to TXT Controller")


def on_message_txt(client, userdata, msg):
    json_message = json.loads(msg.payload)
    if "ts" in json_message:
        current_timestamp = datetime.strptime(
            json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ"
        )
        if previous_timestamp + timedelta(seconds=1) <= current_timestamp:
            if is_sampling_automated:
                if not is_img_processing:
                    automatic_sampling_thread = threading.Thread(
                        target=sample_images_automatically, args=(json_message,)
                    )
                    automatic_sampling_thread.start()
            else:
                sample_images_by_user_input(json_message)


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))


is_sampling_automated = True if (os.getenv("IS_AUTOMATED").lower() == "true") else False
sampling_period = float(os.getenv("SAMPLING_PERIOD"))

txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
username = os.getenv('TXT_USERNAME')
passwd = os.getenv('TXT_PASSWD')

client_txt_name = "ImageSamplingService"
client_txt = mqtt.Client(client_id=client_txt_name)
client_txt.on_connect = on_connect_txt
client_txt.on_message = on_message_txt
client_txt.on_disconnect = on_disconnect
client_txt.username_pw_set(username=username, password=passwd)

try:
    client_txt.connect(host=txt_broker_address, port=port_used, keepalive=keep_alive)
    client_txt.loop_forever()
except TimeoutError as ex:
    print(f"{client_txt_name} failed to connect to TXT: {ex}")
    client_txt.disconnect()
except Exception as ex:
    print(f"{client_txt_name} failed to continue because of {ex}")
    client_txt.disconnect()

import base64
import json
import os
import time
from datetime import datetime
from typing import List

import cv2
import numpy as np
import paho.mqtt.client as mqtt
import paho.mqtt.subscribe as subscribe
from dotenv import load_dotenv

import camera_control_service as camera_control
from storage_detection_model import container_detector

load_dotenv()


class RoutineStatus:
    INITIALIZING = 0
    SURVEYING_BAY = 1
    SURVEYING_DELIVERY_PROCESS = 2
    TIMED_OUT = 3


camera_standby_timer = int(os.getenv("CAMERA_STANDBY_TIME"))

previous_timestamp = datetime.utcnow()

prev_frame_with_detected_objects = []
reoccurrence_matrix = np.zeros((3, 3))

json_mqtt_data = {}

current_routine = RoutineStatus.INITIALIZING


def sleep_monitoring(sleep_time: int) -> None:
    """
    Function works with milliseconds, it takes the time you want to sleep the monitoring thread and subtracts the
    processing time to fulfil exactly the time you need
    :param sleep_time: milliseconds of time you want monitoring thread to sleep
    :return:
    """
    if container_detector.elapsed_detection_time > sleep_time:
        return
    time.sleep((sleep_time - container_detector.elapsed_detection_time) / 1000)


def check_container_movement(prev_frame_workpiece, crt_frame_workpiece) -> bool:
    if ((prev_frame_workpiece is tuple and crt_frame_workpiece is not tuple) or
            (type(prev_frame_workpiece) is int and type(crt_frame_workpiece) is int
             and crt_frame_workpiece == 0 and prev_frame_workpiece == 0)):
        return True
    return False


def decode_image_from_base64(json_message: dict) -> cv2.typing.MatLike:
    image_data = base64.b64decode(strip_encoded_image_data(json_message['data']))
    image_np = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(image_np, cv2.IMREAD_COLOR)


def strip_encoded_image_data(image_encoded_json_data: str) -> str:
    return image_encoded_json_data.split(',', 1)[-1].strip()


def has_container_moved(filled_coordinate_matrix: List[List]):
    global prev_frame_with_detected_objects
    global reoccurrence_matrix

    if len(prev_frame_with_detected_objects) == 0:
        prev_frame_with_detected_objects = filled_coordinate_matrix
        return False

    for idx in range(0, len(filled_coordinate_matrix)):
        for jdx in range(0, len(filled_coordinate_matrix)):
            if check_container_movement(prev_frame_with_detected_objects[idx][jdx], filled_coordinate_matrix[idx][jdx]):
                reoccurrence_matrix[idx][jdx] += 1
            else:
                reoccurrence_matrix[idx][jdx] = 0

    prev_frame_with_detected_objects = filled_coordinate_matrix
    if any(3 in column for column in reoccurrence_matrix):
        reoccurrence_matrix = np.zeros((3, 3))
        return True
    return False


def center_workpiece_in_frame(workpiece_coordinates: tuple, img_width: float, img_height: float):
    x_img_center_coord, y_img_center_coord = img_width / 2, img_height / 2
    x_quarter_value = x_img_center_coord / 2
    y_quarter_value = y_img_center_coord / 2

    if x_img_center_coord + x_quarter_value > workpiece_coordinates[0] > x_img_center_coord - x_quarter_value and \
            y_img_center_coord + y_quarter_value > workpiece_coordinates[1] > y_img_center_coord - y_quarter_value:
        return

    if workpiece_coordinates[0] > x_img_center_coord + x_img_center_coord / 2:
        camera_control.move_camera_right_10_degrees()
    elif workpiece_coordinates[0] < x_img_center_coord - x_img_center_coord / 2:
        camera_control.move_camera_left_10_degrees()
    elif workpiece_coordinates[0] > x_img_center_coord:
        camera_control.move_camera_right_20_degrees()
    elif workpiece_coordinates[0] < x_img_center_coord:
        camera_control.move_camera_left_20_degrees()

    if workpiece_coordinates[1] > y_img_center_coord + y_img_center_coord / 2:
        camera_control.move_camera_down_10_degrees()
    elif workpiece_coordinates[1] < y_img_center_coord - y_img_center_coord / 2:
        camera_control.move_camera_up_10_degrees()
    elif workpiece_coordinates[1] > y_img_center_coord:
        camera_control.move_camera_down_20_degrees()
    elif workpiece_coordinates[1] < y_img_center_coord:
        camera_control.move_camera_up_20_degrees()
    camera_control.wait_camera_to_stabilize()


def initiate_camera_position():
    camera_control.set_camera_position_default()


def process_start_camera_position():
    camera_control.set_camera_position_to_process_start()


def initialization_routine():
    global current_routine
    global prev_frame_with_detected_objects
    initiate_camera_position()
    prev_frame_with_detected_objects = []
    current_routine = RoutineStatus.SURVEYING_BAY


def survey_bay_routine():
    global current_routine
    while True:
        update_json_message()
        if json_mqtt_data:
            img = decode_image_from_base64(json_mqtt_data)
            if img is not None:
                coordinates_matrix = container_detector.identify_container_units(img)
                filled_coordinates_matrix = container_detector.get_missing_storage_spaces(coordinates_matrix)
                if has_container_moved(filled_coordinates_matrix):
                    current_routine = RoutineStatus.SURVEYING_DELIVERY_PROCESS
                    sleep_monitoring(1000)
                    break
                sleep_monitoring(1000)


def survey_delivery_process_routine():
    global current_routine
    print("Starting surveillance of the in-delivery workpiece")
    process_start_camera_position()
    standby_seconds_count = 0
    while True:
        update_json_message()
        if json_mqtt_data:
            img = decode_image_from_base64(json_mqtt_data)
            if img is not None:
                detected_object = container_detector.identify_workpiece(img)
                if detected_object is None:
                    standby_seconds_count += 1
                    if standby_seconds_count == camera_standby_timer:
                        current_routine = RoutineStatus.TIMED_OUT
                        break
                    sleep_monitoring(1000)
                    continue
                standby_seconds_count = 0

                crt_height, crt_width, _ = img.shape
                center_workpiece_in_frame(detected_object, img_width=crt_width, img_height=crt_height)


def camera_timeout_routine():
    global current_routine
    print("Object lost from field of view. Returning to bay")
    current_routine = RoutineStatus.INITIALIZING


def update_json_message():
    global previous_timestamp
    global json_mqtt_data

    msg = subscribe.simple("i/cam", hostname=txt_broker_address, port=port_used, client_id=client_txt_name,
                           keepalive=keep_alive, auth={'username': username, 'password': passwd})
    json_message = json.loads(msg.payload)
    if "data" in json_message and "ts" in json_message:
        current_timestamp = datetime.strptime(json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ")
        if previous_timestamp < current_timestamp:
            json_mqtt_data = json_message
            previous_timestamp = current_timestamp


def on_disconnect(client, userdata, rc=0):
    print(f"Disconnected {client_txt_name} result code " + str(rc))
    client.loop_stop()


def on_connect_txt(client, userdata, flags, rc):
    if rc == 0:
        print(f"Successfully connected client {client_txt_name} to TXT Controller")
        client.connected_flag = True


txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
txt_topics_to_subscribe = os.getenv("TXT_CONTROLLER_SUBSCRIBED_TOPICS").split(',')
port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
username = os.getenv('TXT_USERNAME')
passwd = os.getenv('TXT_PASSWD')

client_txt_name = "MonitoringService"

routines = {
    RoutineStatus.INITIALIZING: initialization_routine,
    RoutineStatus.SURVEYING_BAY: survey_bay_routine,
    RoutineStatus.SURVEYING_DELIVERY_PROCESS: survey_delivery_process_routine,
    RoutineStatus.TIMED_OUT: camera_timeout_routine
}

while True:
    routines[current_routine]()
    pass

import base64
import json
import os
import threading
import time
from datetime import datetime
from typing import List

import cv2
import numpy as np
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


class MonitoringService:
    def __init__(self):
        self.detection_event = threading.Event()
        self.camera_standby_timer = int(os.getenv("CAMERA_STANDBY_TIME"))
        self.standby_seconds_count = 0

        self.prev_frame_with_detected_objects = []
        self.reoccurrence_matrix = np.zeros((3, 3))

        self.json_mqtt_data = {}
        self.previous_timestamp = datetime.utcnow()

        self.current_routine = RoutineStatus.INITIALIZING
        self.client_txt_name = "MonitoringService"
        self.txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
        self.port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
        self.keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
        self.username = os.getenv('TXT_USERNAME')
        self.passwd = os.getenv('TXT_PASSWD')

    def initialization_routine(self):
        self.initiate_camera_position()
        self.prev_frame_with_detected_objects = []
        self.current_routine = RoutineStatus.SURVEYING_BAY

    def survey_bay_routine(self):
        while True:
            self.update_json_message()
            if self.json_mqtt_data:
                img = self.decode_image_from_base64()
                if img is not None:
                    coordinates_matrix = container_detector.identify_container_units(img)
                    filled_coordinates_matrix = container_detector.get_missing_storage_spaces(coordinates_matrix)
                    if self.has_container_moved(filled_coordinates_matrix):
                        self.current_routine = RoutineStatus.SURVEYING_DELIVERY_PROCESS
                        break

    def camera_timeout_counter(self):
        self.detection_event.set()
        while self.detection_event.is_set():
            self.standby_seconds_count += 1
            time.sleep(1)
            if self.standby_seconds_count >= self.camera_standby_timer:
                self.standby_seconds_count = 0
                self.detection_event.clear()
                self.current_routine = RoutineStatus.TIMED_OUT
                break

    def survey_delivery_process_routine(self):
        print("Starting surveillance of the in-delivery workpiece")
        self.process_start_camera_position()
        countdown_running = False
        while True:
            self.update_json_message()
            if self.json_mqtt_data:
                img = self.decode_image_from_base64()
                if img is not None:
                    detected_object = container_detector.identify_workpiece(img)
                    if detected_object is None:
                        if countdown_running is not True:
                            threading.Thread(target=self.camera_timeout_counter, daemon=True).start()
                            countdown_running = True
                        continue
                    self.standby_seconds_count = 0
                    self.detection_event.clear()
                    countdown_running = False

                    crt_height, crt_width, _ = img.shape
                    self.center_workpiece_in_frame(detected_object["coordinates"], img_width=crt_width,
                                                   img_height=crt_height)

    def camera_timeout_routine(self):
        print("Object lost from field of view. Returning to bay")
        self.current_routine = RoutineStatus.INITIALIZING

    def update_json_message(self):

        msg = subscribe.simple("i/cam", hostname=self.txt_broker_address, port=self.port_used,
                               client_id=self.client_txt_name,
                               keepalive=self.keep_alive,
                               auth={'username': self.username, 'password': self.passwd})
        json_message = json.loads(msg.payload)
        if "data" in json_message and "ts" in json_message:
            current_timestamp = datetime.strptime(json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ")
            if self.previous_timestamp < current_timestamp:
                self.json_mqtt_data = json_message
                self.previous_timestamp = current_timestamp

    def decode_image_from_base64(self) -> cv2.typing.MatLike:
        image_data = base64.b64decode(self.json_mqtt_data['data'].split(',', 1)[-1].strip())
        image_np = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    def has_container_moved(self, filled_coordinate_matrix: List[List]):

        if len(self.prev_frame_with_detected_objects) == 0:
            self.prev_frame_with_detected_objects = filled_coordinate_matrix
            return False

        for idx in range(0, len(filled_coordinate_matrix)):
            for jdx in range(0, len(filled_coordinate_matrix)):
                if self.check_container_movement(self.prev_frame_with_detected_objects[idx][jdx],
                                                 filled_coordinate_matrix[idx][jdx]):
                    self.reoccurrence_matrix[idx][jdx] += 1
                else:
                    self.reoccurrence_matrix[idx][jdx] = 0

        self.prev_frame_with_detected_objects = filled_coordinate_matrix
        if any(3 in column for column in self.reoccurrence_matrix):
            self.reoccurrence_matrix = np.zeros((3, 3))
            return True
        return False

    def start_monitoring(self):
        routines = {
            RoutineStatus.INITIALIZING: self.initialization_routine,
            RoutineStatus.SURVEYING_BAY: self.survey_bay_routine,
            RoutineStatus.SURVEYING_DELIVERY_PROCESS: self.survey_delivery_process_routine,
            RoutineStatus.TIMED_OUT: self.camera_timeout_routine
        }

        while True:
            routines[self.current_routine]()

    @staticmethod
    def check_container_movement(prev_frame_workpiece, crt_frame_workpiece) -> bool:
        if ((prev_frame_workpiece is dict and crt_frame_workpiece is not dict) or
                (type(prev_frame_workpiece) is int and type(crt_frame_workpiece) is int
                 and crt_frame_workpiece == 0 and prev_frame_workpiece == 0)):
            return True
        return False

    @staticmethod
    def center_workpiece_in_frame(workpiece_coordinates: tuple, img_width: float, img_height: float):
        x_img_center_coord, y_img_center_coord = img_width / 2, img_height / 2
        x_quarter_value = x_img_center_coord / 2
        y_quarter_value = y_img_center_coord / 2

        if x_img_center_coord + x_quarter_value > workpiece_coordinates[0] > x_img_center_coord - x_quarter_value and \
                y_img_center_coord + y_quarter_value > workpiece_coordinates[1] > y_img_center_coord - y_quarter_value:
            return

        if workpiece_coordinates[0] > x_img_center_coord + x_quarter_value:
            camera_control.move_camera_right_10_degrees()
        elif workpiece_coordinates[0] < x_img_center_coord - x_quarter_value:
            camera_control.move_camera_left_20_degrees()

        if workpiece_coordinates[1] > y_img_center_coord + y_quarter_value:
            camera_control.move_camera_down_20_degrees()
        elif workpiece_coordinates[1] < y_img_center_coord - y_quarter_value:
            camera_control.move_camera_up_10_degrees()
        time.sleep(1)

    @staticmethod
    def initiate_camera_position():
        camera_control.set_camera_position_default()

    @staticmethod
    def process_start_camera_position():
        camera_control.set_camera_position_to_process_start()


if __name__ == "__main__":
    surveillance_system = MonitoringService()
    surveillance_system.start_monitoring()

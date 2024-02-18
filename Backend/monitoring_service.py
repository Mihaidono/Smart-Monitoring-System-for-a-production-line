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
from camera_control_service import CameraDegrees, CameraDirections, FischertechnikModuleLocations
from storage_detection_model import container_detector

load_dotenv()


class RoutineStatus:
    INITIALIZING = 0
    SURVEYING_BAY = 1
    SURVEYING_DELIVERY_PROCESS = 2
    TIMED_OUT = 3
    DELIVERY_SUCCESSFUL = 4


class MonitoringService:
    def __init__(self):
        self._detection_event = threading.Event()
        self._camera_standby_timer = int(os.getenv("CAMERA_STANDBY_TIME"))
        self._standby_seconds_count = 0

        self._prev_frame_with_detected_objects = []
        self._reoccurrence_matrix = np.zeros((3, 3))

        self._json_mqtt_data = {}
        self._previous_timestamp = datetime.utcnow()

        self._current_routine = RoutineStatus.INITIALIZING
        self._CLIENT_TXT_NAME = "MonitoringService"
        self._TXT_BROKER_ADDRESS = os.getenv("TXT_CONTROLLER_ADDRESS")
        self._PORT_USED = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
        self._KEEP_ALIVE = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
        self._USERNAME = os.getenv('TXT_USERNAME')
        self._PASSWD = os.getenv('TXT_PASSWD')

        self._is_camera_delayed = False
        self._detection_count_per_module = 0

    def progress_camera_position(self):
        if camera_control.is_module_equal(camera_control.current_module,
                                          FischertechnikModuleLocations.SHIPPING) is False:
            if camera_control.is_module_equal(camera_control.current_module,
                                              FischertechnikModuleLocations.PROCESSING_STATION) and \
                    self._detection_count_per_module == 1:
                camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TWENTY)
                camera_control.wait_camera_to_stabilize()

                camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)
                camera_control.wait_camera_to_stabilize()
                print("Moved at PROCESSING STATION Module")
                return

            if camera_control.is_module_equal(camera_control.current_module,
                                              FischertechnikModuleLocations.PROCESSING_STATION) and \
                    self._detection_count_per_module == 2:
                camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TEN)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TEN)
                camera_control.wait_camera_to_stabilize()
                print("Moved at SORTING LINE Module")
                return

            if camera_control.is_module_equal(camera_control.current_module,
                                              FischertechnikModuleLocations.SORTING_LINE) and \
                    self._detection_count_per_module == 3:
                camera_control.move_camera(CameraDirections.RIGHT, CameraDegrees.TEN)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TWENTY)
                camera_control.wait_camera_to_stabilize()
                self._detection_count_per_module = 0
                print("Moved at SHIPPING Module")
                return

    def check_if_camera_has_delay(self):
        time_array = []
        for _ in range(5):
            msg = subscribe.simple("i/cam", hostname=self._TXT_BROKER_ADDRESS, port=self._PORT_USED,
                                   client_id=self._CLIENT_TXT_NAME,
                                   keepalive=self._KEEP_ALIVE,
                                   auth={'username': self._USERNAME, 'password': self._PASSWD})
            json_message = json.loads(msg.payload)
            time_array.append(json_message['ts'])

        datetime_array = [datetime.fromisoformat(timestamp) for timestamp in time_array]
        time_diffs = [datetime_array[i + 1] - datetime_array[i] for i in range(len(datetime_array) - 1)]
        for diff in time_diffs:
            if diff.total_seconds() > 1:
                return True
        return False

    def initialization_routine(self):
        self.initiate_camera_position()
        self._prev_frame_with_detected_objects = []
        self._current_routine = RoutineStatus.SURVEYING_BAY

    def survey_bay_routine(self):
        while True:
            self.update_json_message()
            if self._json_mqtt_data:
                img = self.decode_image_from_base64()
                if img is not None:
                    coordinates_matrix = container_detector.identify_container_units(img)
                    if coordinates_matrix:
                        filled_coordinates_matrix = container_detector.get_missing_storage_spaces(coordinates_matrix)
                        if self.has_container_moved(filled_coordinates_matrix):
                            self._current_routine = RoutineStatus.SURVEYING_DELIVERY_PROCESS
                            break

    def camera_timeout_counter(self):
        self._detection_event.set()
        while self._detection_event.is_set():
            self._standby_seconds_count += 1
            time.sleep(1)

    def survey_delivery_process_routine(self):
        print("Starting surveillance of the in-delivery workpiece")
        self.process_start_camera_position()
        countdown_running = False
        while True:
            self.update_json_message()
            if self._json_mqtt_data:
                img = self.decode_image_from_base64()
                if img is not None:
                    detected_object = container_detector.identify_workpiece(img)
                    if detected_object is None:
                        if countdown_running is not True:
                            threading.Thread(target=self.camera_timeout_counter, daemon=True).start()
                            countdown_running = True
                        if self._standby_seconds_count >= self._camera_standby_timer:
                            self._standby_seconds_count = 0
                            self._current_routine = RoutineStatus.TIMED_OUT
                            self._detection_event.clear()
                            break
                        continue
                    self._standby_seconds_count = 0
                    self._detection_event.clear()
                    countdown_running = False

                    if self._is_camera_delayed:
                        self._detection_count_per_module += 1
                        if self._detection_count_per_module == 5:
                            self._current_routine = RoutineStatus.DELIVERY_SUCCESSFUL
                            break
                        else:
                            self.progress_camera_position()
                    else:
                        if self._detection_count_per_module == 5:
                            self._current_routine = RoutineStatus.DELIVERY_SUCCESSFUL
                            break

                        crt_height, crt_width, _ = img.shape
                        self.center_workpiece_in_frame(detected_object["coordinates"],
                                                       img_width=crt_width,
                                                       img_height=crt_height)
                        if camera_control.is_module_equal(camera_control.current_module,
                                                          FischertechnikModuleLocations.SHIPPING):
                            self._detection_count_per_module += 1

    def camera_timeout_routine(self):
        print("Object lost from field of view. Returning to bay")
        self._current_routine = RoutineStatus.INITIALIZING
        self._detection_count_per_module = 0

    def successful_delivery_routine(self):
        print("Successfully delivered workpiece! Returning to bay")
        self._current_routine = RoutineStatus.INITIALIZING

    def update_json_message(self):

        msg = subscribe.simple("i/cam", hostname=self._TXT_BROKER_ADDRESS, port=self._PORT_USED,
                               client_id=self._CLIENT_TXT_NAME,
                               keepalive=self._KEEP_ALIVE,
                               auth={'username': self._USERNAME, 'password': self._PASSWD})
        json_message = json.loads(msg.payload)
        if "data" in json_message and "ts" in json_message:
            current_timestamp = datetime.strptime(json_message["ts"], "%Y-%m-%dT%H:%M:%S.%fZ")
            if self._previous_timestamp < current_timestamp:
                self._json_mqtt_data = json_message
                self._previous_timestamp = current_timestamp

    def decode_image_from_base64(self) -> cv2.typing.MatLike:
        image_data = base64.b64decode(self._json_mqtt_data['data'].split(',', 1)[-1].strip())
        image_np = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    def has_container_moved(self, filled_coordinate_matrix: List[List]):

        if len(self._prev_frame_with_detected_objects) == 0:
            self._prev_frame_with_detected_objects = filled_coordinate_matrix
            return False

        for idx in range(0, len(filled_coordinate_matrix)):
            for jdx in range(0, len(filled_coordinate_matrix)):
                if self.check_container_movement(self._prev_frame_with_detected_objects[idx][jdx],
                                                 filled_coordinate_matrix[idx][jdx]):
                    self._reoccurrence_matrix[idx][jdx] += 1
                else:
                    self._reoccurrence_matrix[idx][jdx] = 0

        self._prev_frame_with_detected_objects = filled_coordinate_matrix
        if any(3 in column for column in self._reoccurrence_matrix):
            self._reoccurrence_matrix = np.zeros((3, 3))
            return True
        return False

    def start_monitoring(self):
        routines = {
            RoutineStatus.INITIALIZING: self.initialization_routine,
            RoutineStatus.SURVEYING_BAY: self.survey_bay_routine,
            RoutineStatus.SURVEYING_DELIVERY_PROCESS: self.survey_delivery_process_routine,
            RoutineStatus.TIMED_OUT: self.camera_timeout_routine,
            RoutineStatus.DELIVERY_SUCCESSFUL: self.successful_delivery_routine
        }

        self._is_camera_delayed = self.check_if_camera_has_delay()
        while True:
            routines[self._current_routine]()

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
        x_percent_value = img_width * 0.4
        y_percent_value = img_height * 0.4

        if x_img_center_coord + x_percent_value > workpiece_coordinates[0] > x_img_center_coord - x_percent_value and \
                y_img_center_coord + y_percent_value > workpiece_coordinates[1] > y_img_center_coord - y_percent_value:
            return

        if workpiece_coordinates[1] > y_img_center_coord + y_percent_value:
            camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TEN)
        elif workpiece_coordinates[1] < y_img_center_coord - y_percent_value:
            camera_control.move_camera(CameraDirections.UP, CameraDegrees.TEN)

        if workpiece_coordinates[0] > x_img_center_coord + x_percent_value:
            camera_control.move_camera(CameraDirections.RIGHT, CameraDegrees.TEN)
        elif workpiece_coordinates[0] < x_img_center_coord - x_percent_value:
            camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TEN)

    @staticmethod
    def initiate_camera_position():
        camera_control.set_camera_position_default()

    @staticmethod
    def process_start_camera_position():
        camera_control.set_camera_position_to_process_start()


if __name__ == "__main__":
    camera_control.start_camera_control_service()
    surveillance_system = MonitoringService()
    surveillance_system.start_monitoring()

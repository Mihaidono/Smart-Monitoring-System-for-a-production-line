import base64
import json
import os
import uuid
import threading
import time
from datetime import datetime
from typing import List

import cv2
import numpy as np
import paho.mqtt.subscribe as subscribe
import paho.mqtt.publish as publish

from dotenv import load_dotenv

import camera_control_service as camera_control
from camera_control_service import CameraDegrees, CameraDirections, FischertechnikModuleLocations
from storage_detection_model import container_detector
from monitoring_logger import MonitoringLogger, MonitoringLogMessage, LogSeverity

load_dotenv()


class RoutineStatus:
    INITIALIZING = 0
    SURVEYING_BAY = 1
    SURVEYING_DELIVERY_PROCESS = 2
    TIMED_OUT = 3
    CONFIRM_DELIVERY_STATUS = 4
    DELIVERY_SUCCESSFUL = 5
    IDLE = 6


class MonitoringService:
    def __init__(self):
        self._logger = MonitoringLogger()

        self._detection_event = threading.Event()
        self._camera_standby_timer = int(os.getenv("CAMERA_STANDBY_TIME"))
        self._standby_seconds_count = 0

        self._current_process_id = None
        self._warehouse_containers = []
        self._prev_frame_with_detected_objects = []
        self._reoccurrence_matrix = np.zeros((3, 3))

        self._json_mqtt_data = {}
        self._previous_timestamp = datetime.utcnow()

        self._current_routine = RoutineStatus.IDLE
        self._process_started = False
        self._tracking_workpiece = False

        self._CLIENT_TXT_NAME = "MonitoringService"
        self._TXT_BROKER_ADDRESS = os.getenv("TXT_CONTROLLER_ADDRESS")
        self._PORT_USED = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
        self._KEEP_ALIVE = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
        self._USERNAME = os.getenv('TXT_USERNAME')
        self._PASSWD = os.getenv('TXT_PASSWD')

        self._is_camera_delayed = False
        self._detection_count_per_module = 0

    @property
    def logger(self):
        return self._logger
    
    @property
    def process_started(self):
        return self._process_started

    @process_started.setter
    def process_started(self, value):
        self._process_started = value
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Monitoring Service started from GUI",
                                 LogSeverity.INFO,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))

    @property
    def current_routine(self):
        return self._current_routine

    @property
    def tracking_workpiece(self):
        return self._tracking_workpiece

    @property
    def warehouse_containers(self):
        return self._warehouse_containers

    @property
    def json_mqtt_data(self):
        return self._json_mqtt_data

    def progress_camera_position(self):
        if camera_control.is_module_equal(camera_control.current_module,
                                          FischertechnikModuleLocations.SHIPPING) is False:
            if camera_control.is_module_equal(camera_control.current_module,
                                              FischertechnikModuleLocations.PROCESSING_STATION) and \
                    self._detection_count_per_module == 0:
                camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.DOWN, CameraDegrees.TWENTY)
                camera_control.wait_camera_to_stabilize()

                camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)
                camera_control.wait_camera_to_stabilize()

                self._detection_count_per_module += 1
                self._logger.store_log(
                    MonitoringLogMessage(self._current_process_id,
                                         "Workpiece moved from High-Bay Warehouse to Processing Station",
                                         LogSeverity.INFO,
                                         self._tracking_workpiece, camera_control.current_module,
                                         self._current_routine))
                return

            if camera_control.is_module_equal(camera_control.current_module,
                                              FischertechnikModuleLocations.PROCESSING_STATION) and \
                    self._detection_count_per_module == 1:
                camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.LEFT, CameraDegrees.TEN)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TWENTY)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TEN)
                camera_control.wait_camera_to_stabilize()

                self._detection_count_per_module += 1
                self._logger.store_log(
                    MonitoringLogMessage(self._current_process_id,
                                         "Workpiece moved from Processing Station to Sorting Line",
                                         LogSeverity.INFO,
                                         self._tracking_workpiece, camera_control.current_module,
                                         self._current_routine))
                return

            if camera_control.is_module_equal(camera_control.current_module,
                                              FischertechnikModuleLocations.SORTING_LINE) and \
                    self._detection_count_per_module == 2:
                camera_control.move_camera(CameraDirections.RIGHT, CameraDegrees.TEN)
                camera_control.move_camera(CameraDirections.UP, CameraDegrees.TWENTY)
                camera_control.wait_camera_to_stabilize()

                self._detection_count_per_module += 1
                self._logger.store_log(
                    MonitoringLogMessage(self._current_process_id, "Workpiece moved from Sorting Line to Delivery",
                                         LogSeverity.INFO,
                                         self._tracking_workpiece, camera_control.current_module,
                                         self._current_routine))
                return

    def check_if_camera_has_delay(self):
        while True:
            time_array = []
            is_delayed_set = False
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
                    is_delayed_set = True
            self._is_camera_delayed = is_delayed_set
            time.sleep(60)

    def order_workpiece(self, color: str):
        payload = json.dumps({'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"), 'type': color})
        publish.single(topic="f/o/order", payload=payload, hostname=self._TXT_BROKER_ADDRESS, port=self._PORT_USED,
                       client_id=self._CLIENT_TXT_NAME,
                       keepalive=self._KEEP_ALIVE,
                       auth={'username': self._USERNAME, 'password': self._PASSWD})
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, f"{color} Workpiece ordered",
                                 LogSeverity.INFO,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))

    def initialization_routine(self):
        self.initiate_camera_position()
        self._prev_frame_with_detected_objects = []
        self._current_process_id = str(uuid.uuid1())
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Initialization Routine completed successfully!",
                                 LogSeverity.SUCCESS,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))
        self._current_routine = RoutineStatus.SURVEYING_BAY

    def camera_timeout_routine(self):
        self._detection_count_per_module = 0
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Object lost from field of view!",
                                 LogSeverity.WARNING,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))
        self._tracking_workpiece = False

        time.sleep(2)
        self._current_routine = RoutineStatus.INITIALIZING

    def successful_delivery_routine(self):
        self._tracking_workpiece = False
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Successfully delivered workpiece!",
                                 LogSeverity.SUCCESS,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))

        time.sleep(2)
        self._current_routine = RoutineStatus.INITIALIZING

    def idle_routine(self):
        self._tracking_workpiece = False
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Monitoring Service turned to Idle mode",
                                 LogSeverity.INFO,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))
        while not self._process_started:
            time.sleep(0.5)
        self._current_routine = RoutineStatus.INITIALIZING

    def survey_bay_routine(self):
        while True:
            if not self._process_started:
                self._current_routine = RoutineStatus.IDLE
                break
            if self._json_mqtt_data:
                img = self.decode_image_from_base64()
                if img is not None:
                    coordinates_matrix = container_detector.identify_container_units(img)
                    if coordinates_matrix:
                        self._warehouse_containers = container_detector.get_missing_storage_spaces(coordinates_matrix)
                        if self.has_container_moved(self._warehouse_containers):
                            self._current_routine = RoutineStatus.SURVEYING_DELIVERY_PROCESS
                            break

    def camera_timeout_counter(self):
        self._detection_event.set()
        while self._detection_event.is_set():
            self._standby_seconds_count += 1
            time.sleep(1)

    def survey_delivery_process_routine(self):
        self.process_start_camera_position()
        self._tracking_workpiece = True
        countdown_running = False
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Surveillance of the in-delivery workpiece started",
                                 LogSeverity.INFO,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))

        while True:
            if not self._process_started:
                self._current_routine = RoutineStatus.IDLE
                break
            if self._json_mqtt_data:
                img = self.decode_image_from_base64()
                if img is not None:
                    detected_object = container_detector.identify_workpiece(img)
                    if detected_object is None:
                        if countdown_running is not True:
                            threading.Thread(target=self.camera_timeout_counter, daemon=True).start()
                            countdown_running = True
                        if self._standby_seconds_count >= self._camera_standby_timer:
                            self._detection_event.clear()
                            self._current_routine = RoutineStatus.TIMED_OUT
                            self._standby_seconds_count = 0
                            break
                        continue
                    self._detection_event.clear()
                    self._standby_seconds_count = 0
                    countdown_running = False

                    if self._is_camera_delayed:
                        if self._detection_count_per_module < 3:
                            self.progress_camera_position()
                        else:
                            self._current_routine = RoutineStatus.CONFIRM_DELIVERY_STATUS
                            self._standby_seconds_count = 0
                            break
                    else:
                        if camera_control.is_module_equal(camera_control.current_module,
                                                          FischertechnikModuleLocations.SHIPPING):
                            self._current_routine = RoutineStatus.CONFIRM_DELIVERY_STATUS
                            self._standby_seconds_count = 0
                            break

                        crt_height, crt_width, _ = img.shape
                        self.center_workpiece_in_frame(detected_object["coordinates"],
                                                       img_width=crt_width,
                                                       img_height=crt_height)

    def confirm_delivery_status_routine(self):
        self._logger.store_log(
            MonitoringLogMessage(self._current_process_id, "Waiting for delivery confirmation!",
                                 LogSeverity.INFO,
                                 self._tracking_workpiece, camera_control.current_module,
                                 self._current_routine))
        while True:
            if self.check_delivery_status() is True:
                self._current_routine = RoutineStatus.DELIVERY_SUCCESSFUL
                self._detection_event.clear()
                self._standby_seconds_count = 0
                break

    def check_delivery_status(self):
        msg = subscribe.simple("f/i/state/dso", hostname=self._TXT_BROKER_ADDRESS, port=self._PORT_USED,
                               client_id=self._CLIENT_TXT_NAME,
                               keepalive=self._KEEP_ALIVE,
                               auth={'username': self._USERNAME, 'password': self._PASSWD})
        return json.loads(msg.payload)["active"]

    def update_json_message(self):
        while True:
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
        if any(5 in column for column in self._reoccurrence_matrix):
            self._reoccurrence_matrix = np.zeros((3, 3))
            self._logger.store_log(
                MonitoringLogMessage(self._current_process_id, f"Current state of the High-Bay Warehouse",
                                     LogSeverity.INFO,
                                     self._tracking_workpiece, camera_control.current_module,
                                     self._current_routine,
                                     self._warehouse_containers))
            return True
        return False

    def start_monitoring(self):
        routines = {
            RoutineStatus.IDLE: self.idle_routine,
            RoutineStatus.INITIALIZING: self.initialization_routine,
            RoutineStatus.SURVEYING_BAY: self.survey_bay_routine,
            RoutineStatus.SURVEYING_DELIVERY_PROCESS: self.survey_delivery_process_routine,
            RoutineStatus.CONFIRM_DELIVERY_STATUS: self.confirm_delivery_status_routine,
            RoutineStatus.TIMED_OUT: self.camera_timeout_routine,
            RoutineStatus.DELIVERY_SUCCESSFUL: self.successful_delivery_routine
        }

        threading.Thread(target=self.update_json_message, daemon=True).start()
        threading.Thread(target=self.check_if_camera_has_delay, daemon=True).start()
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

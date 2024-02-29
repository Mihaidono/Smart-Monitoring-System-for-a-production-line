import json
import logging
import os
import time
from datetime import datetime
from threading import Thread

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import paho.mqtt.client as mqtt
from pydantic import BaseModel
from camera_control_service import CameraDegrees, CameraDirections
import paho.mqtt.subscribe as subscribe

load_dotenv()


class MQTTCommunicationClient:
    def __init__(self):
        self.mqtt_comm_client = None
        self._client_name = "CommunicationApiClient"
        self._txt_broker_address = os.getenv("TXT_CONTROLLER_ADDRESS")
        self._port_used = int(os.getenv("TXT_CONTROLLER_PORT_USED"))
        self._keep_alive = int(os.getenv("TXT_CONTROLLER_KEEP_ALIVE"))
        self._username = os.getenv('TXT_USERNAME')
        self._passwd = os.getenv('TXT_PASSWD')
        self._topic_callbacks_mapping: dict = {"i/cam": self.on_camera_message,
                                               "i/ptu/pos": self.on_camera_position_message,
                                               "f/i/state/vgr": self.on_crane_state_message}

        self._encoded_camera_image: str = ""
        self._camera_position: tuple = ()
        self._crane_in_use: bool = False

    def move_camera(self, direction: str | CameraDirections, degrees: int | CameraDegrees):
        if direction == CameraDirections.HOME:
            self.mqtt_comm_client.publish('o/ptu',
                                          json.dumps(
                                              {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                                               'cmd': direction}))
            time.sleep(0.5)
        elif direction == CameraDirections.MAX_LEFT:
            self.mqtt_comm_client.publish('o/ptu',
                                          json.dumps(
                                              {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                                               'cmd': direction}))
            time.sleep(0.5)
        elif direction == CameraDirections.MAX_RIGHT:
            self.mqtt_comm_client.publish('o/ptu',
                                          json.dumps(
                                              {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                                               'cmd': direction}))
            time.sleep(0.5)
        else:
            self.mqtt_comm_client.publish('o/ptu',
                                          json.dumps(
                                              {'ts': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                                               'cmd': direction,
                                               'degree': degrees}))
            time.sleep(1)

    @staticmethod
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            client.connected_flag = True

    def on_camera_message(self, client, userdata, msg):
        json_message = json.loads(msg.payload)
        self._encoded_camera_image = json_message['data']

    def on_camera_position_message(self, client, userdata, msg):
        json_message = json.loads(msg.payload)
        self._camera_position = (json_message['tilt'], json_message['pan'])

    def on_crane_state_message(self, client, userdata, msg):
        json_message = json.loads(msg.payload)
        if json_message['active'].lower() == 'true':
            self._crane_in_use = True
        elif json_message['active'].lower() == 'false':
            self._crane_in_use = False

    def create_txt_client(self):

        client_txt = mqtt.Client(client_id=self._client_name)
        client_txt.on_connect = self.on_connect
        client_txt.username_pw_set(username=self._username, password=self._passwd)

        try:
            client_txt.connect(host=self._txt_broker_address, port=self._port_used, keepalive=self._keep_alive)
            for topic, callback in self._topic_callbacks_mapping.items():
                subscribe.callback(callback=callback, topics=topic, hostname=self._txt_broker_address)
            client_txt.loop_start()
        except TimeoutError as ex:
            print(f'{client_txt} failed to connect to TXT: {ex}')
            client_txt.disconnect()
            raise Exception("Camera control client got disconnected")
        except Exception as ex:
            print(f'{client_txt} failed to continue because of {ex}')
            client_txt.disconnect()
            raise Exception("Camera control client got disconnected")


mqtt_comm = FastAPI()

mqtt_comm.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def start_uvicorn():
    import uvicorn

    uvicorn.run(mqtt_comm, host='0.0.0.0', port=8000)


if __name__ == "__main__":
    # uvicorn_thread = Thread(target=start_uvicorn)
    # uvicorn_thread.start()

    comm_client = MQTTCommunicationClient()
    comm_client.create_txt_client()

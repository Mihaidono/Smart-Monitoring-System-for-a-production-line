import asyncio
import json
from threading import Thread

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from uvicorn.protocols.utils import ClientDisconnected

import camera_control_service as camera_control
from monitoring_service import MonitoringService

load_dotenv()

smart_monitoring_app = FastAPI()
surveillance_system = MonitoringService()

smart_monitoring_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CameraControlMessage(BaseModel):
    degrees: int
    direction: str


@smart_monitoring_app.post("/move_camera")
async def move_camera(control_message: CameraControlMessage):
    try:
        camera_control.move_camera(
            direction=control_message.direction, degrees=control_message.degrees
        )
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "Unable to access camera",
        }
        raise HTTPException(status_code=500, detail=error_details)
    response = f"Camera moved by {control_message.degrees} degrees to {control_message.direction}"
    return JSONResponse(content=response, status_code=200)


@smart_monitoring_app.websocket("/ws_get_image")
async def get_image(websocket: WebSocket):
    try:
        await websocket.accept()

        while True:
            data = {"data": surveillance_system.json_mqtt_data["data"]}
            await websocket.send_json(data)
            await asyncio.sleep(0.5)
    except ClientDisconnected:
        print("Client disconnected from WS Get Image")
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "An unexpected error occurred in the WebSocket Image endpoint",
        }
        await websocket.send_json({"error": error_details})


@smart_monitoring_app.websocket("/ws_get_warehouse_inventory")
async def get_warehouse_inventory(websocket: WebSocket):
    try:
        await websocket.accept()

        while True:
            data = {"containers": surveillance_system.warehouse_containers}
            await websocket.send_json(data)
            await asyncio.sleep(0.5)
    except ClientDisconnected:
        print("Client disconnected from WS Get Warehouse Inventory")
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "An unexpected error occurred in the WebSocket Warehouse endpoint",
        }
        await websocket.send_json({"error": error_details})


@smart_monitoring_app.websocket("/ws_get_current_module")
async def get_current_module(websocket: WebSocket):
    try:
        await websocket.accept()

        while True:
            data = {"current_module": camera_control.current_module}
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(0.5)
    except ClientDisconnected:
        print("Client disconnected from WS Get Current Module")
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "An unexpected error occurred in the WebSocket Module endpoint",
        }
        await websocket.send_json({"error": error_details})


@smart_monitoring_app.websocket("/ws_get_process_state")
async def get_process_state(websocket: WebSocket):
    try:
        await websocket.accept()

        while True:
            data = {"started": surveillance_system.process_started}
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(0.5)
    except ClientDisconnected:
        print("Client disconnected from WS Get Process State")
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "An unexpected error occurred in the WebSocket Image endpoint",
        }
        await websocket.send_json({"error": error_details})


def start_uvicorn():
    import uvicorn

    uvicorn.run(smart_monitoring_app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    camera_control.start_camera_control_service()

    uvicorn_thread = Thread(target=start_uvicorn, daemon=True)
    uvicorn_thread.start()

    surveillance_system.start_monitoring()

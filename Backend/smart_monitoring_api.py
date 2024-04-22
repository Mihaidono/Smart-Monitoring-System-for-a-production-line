import asyncio
from datetime import datetime
import json
from threading import Thread

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import camera_control_service as camera_control
from monitoring_service import MonitoringService
from monitoring_logger import MonitoringLogger

load_dotenv()

smart_monitoring_app = FastAPI()
surveillance_system = MonitoringService()
logger = MonitoringLogger()

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


class ChangeState(BaseModel):
    new_state: bool


@smart_monitoring_app.get("/order_workpiece")
async def order_workpiece(color: str):
    try:
        surveillance_system.order_workpiece(color)

        response = f"Ordered workpiece of color {color} successfully"
        return JSONResponse(content=response, status_code=200)
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "Unable to access camera",
        }
        raise HTTPException(status_code=500, detail=error_details)


@smart_monitoring_app.post("/move_camera")
async def move_camera(control_message: CameraControlMessage):
    try:
        camera_control.move_camera(
            direction=control_message.direction, degrees=control_message.degrees
        )

        response = f"Camera moved by {control_message.degrees} degrees to {control_message.direction}"
        return JSONResponse(content=response, status_code=200)
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "Unable to access camera",
        }
        raise HTTPException(status_code=500, detail=error_details)


@smart_monitoring_app.post("/set_process_state")
async def set_process_state(change_state: ChangeState):
    try:
        surveillance_system.process_started = change_state.new_state

        response = f"Process State set to {change_state.new_state}"
        return JSONResponse(content=response, status_code=200)
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "Unable to change state",
        }
        raise HTTPException(status_code=500, detail=error_details)


@smart_monitoring_app.websocket("/ws_get_image")
async def get_image(websocket: WebSocket):
    try:
        await websocket.accept()

        while True:
            data = {"data": surveillance_system.json_mqtt_data["data"]}
            await websocket.send_json(data)
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
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
    except WebSocketDisconnect:
        print("Client disconnected from WS Get Warehouse Inventory")
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "An unexpected error occurred in the WebSocket Warehouse endpoint",
        }
        await websocket.send_json({"error": error_details})


@smart_monitoring_app.websocket("/ws_delivery_info")
async def get_tracking_workpiece(websocket: WebSocket):
    try:
        await websocket.accept()

        while True:
            data = {
                "current_module": camera_control.FischertechnikModuleLocations.get_location_name(
                    camera_control.current_module
                ),
                "tracking_workpiece": surveillance_system.tracking_workpiece,
                "current_routine": surveillance_system.current_routine,
            }

            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(0.2)
    except WebSocketDisconnect:
        print("Client disconnected from WS Get Process State")
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "An unexpected error occurred in the WebSocket Image endpoint",
        }
        await websocket.send_json({"error": error_details})


@smart_monitoring_app.get("/logger/get_total_log_count")
async def get_total_count(log_id: str = None,
                          message: str = None,
                          severity: int = None,
                          while_tracking: bool = None,
                          current_routine: str = None,
                          current_module: str = None,
                          lower_boundary: datetime = None,
                          upper_boundary: datetime = None, ):
    try:
        logs_count = logger.get_total_log_count(
            log_id=log_id,
            message=message,
            severity=severity,
            while_tracking=while_tracking,
            current_module=current_module,
            current_routine=current_routine,
            lower_boundary=lower_boundary,
            upper_boundary=upper_boundary)
        return JSONResponse(content={"logs_count": logs_count})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@smart_monitoring_app.get("/logger/get_logs")
async def get_logs(log_id: str = None,
                   message: str = None,
                   severity: str = None,
                   while_tracking: bool = None,
                   current_routine: str = None,
                   current_module: str = None,
                   lower_boundary: datetime = None,
                   upper_boundary: datetime = None,
                   current_page: int = None,
                   limitation: int = None):
    try:
        logs = logger.get_logs(
            log_id=log_id,
            message=message,
            severity=severity,
            while_tracking=while_tracking,
            current_module=current_module,
            current_routine=current_routine,
            lower_boundary=lower_boundary,
            upper_boundary=upper_boundary,
            current_page=current_page,
            limitation=limitation
        )
        return JSONResponse(content={"logs": logs}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def start_uvicorn():
    import uvicorn

    uvicorn.run(smart_monitoring_app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    camera_control.start_camera_control_service()

    uvicorn_thread = Thread(target=start_uvicorn, daemon=True)
    uvicorn_thread.start()

    surveillance_system.start_monitoring()

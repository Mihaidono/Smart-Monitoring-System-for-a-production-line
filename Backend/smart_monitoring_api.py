from threading import Thread

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

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


def start_uvicorn():
    import uvicorn

    uvicorn.run(smart_monitoring_app, host='0.0.0.0', port=8000)


@smart_monitoring_app.post("/move_camera")
async def move_camera(control_message: CameraControlMessage):
    try:
        camera_control.move_camera(direction=control_message.direction, degrees=control_message.degrees)
    except Exception as e:
        error_details = {
            "error_type": e.__class__.__name__,
            "error_message": str(e),
            "additional_info": "Unable to access camera",
        }
        raise HTTPException(status_code=500, detail=error_details)
    response = f"Camera moved by {control_message.degrees} degrees to {control_message.direction}"
    return JSONResponse(content=response, status_code=200)


@smart_monitoring_app.get('/get_image')
async def get_image():
    response = {"data": surveillance_system.json_mqtt_data['data']}
    return JSONResponse(content=response, status_code=200)


@smart_monitoring_app.get('/get_warehouse_inventory')
async def get_warehouse_inventory():
    response = {"containers": surveillance_system.warehouse_containers}
    return JSONResponse(content=response, status_code=200)


@smart_monitoring_app.get('/get_current_module')
async def get_current_module():
    response = {"current_module": camera_control.current_module}
    return JSONResponse(content=response, status_code=200)


@smart_monitoring_app.get('/get_process_state')
async def get_process_state():
    response = {"started": surveillance_system.process_started}
    return JSONResponse(content=response, status_code=200)


if __name__ == "__main__":
    camera_control.start_camera_control_service()

    uvicorn_thread = Thread(target=start_uvicorn)
    uvicorn_thread.start()

    surveillance_system.start_monitoring()

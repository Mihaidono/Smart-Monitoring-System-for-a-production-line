import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import camera_control_service as camera_control
from monitoring_service import MonitoringService
from camera_control_service import CameraDirections, CameraDegrees

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
    degrees: CameraDegrees
    direction: CameraDirections


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
    return f"Camera moved by {control_message.degrees} degrees to {control_message.direction}"


@smart_monitoring_app.get('/get_image')
async def get_image():
    response = {"data": surveillance_system.json_mqtt_data['data']}
    return response





if __name__ == "__main__":
    camera_control.start_camera_control_service()
    import uvicorn

    uvicorn.run(smart_monitoring_app, host='0.0.0.0', port=8000)
    surveillance_system.start_monitoring()

FROM python:3.11-slim

WORKDIR /smart_monitoring_backend

COPY storage_detection_model/runs /storage_detection_model
COPY storage_detection_model/container_detector.py /storage_detection_model
COPY storage_detection_model/*.yaml /storage_detection_model

COPY camera_control_service.py .
COPY monitoring_logger.py .
COPY monitoring_service.py .
COPY smart_monitoring_api.py .
COPY .env .
COPY requirements.txt .

ENV PATH="/smart_monitoring_backend:${PATH}"
RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python3", "smart_monitoring_api.py"]

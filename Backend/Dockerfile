FROM python:3.11-slim

WORKDIR /smart_monitoring_backend

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

COPY . .

ENV PATH="/smart_monitoring_backend:${PATH}"

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python3", "smart_monitoring_api.py"]

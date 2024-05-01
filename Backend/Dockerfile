FROM python:3.11-alpine

WORKDIR /smart_monitoring_backend

COPY . .

ENV PATH="/smart_monitoring_backend:${PATH}"
RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python3", "smart_monitoring_api.py"]

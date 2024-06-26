import json
import os
import re
from enum import Enum
from typing import List

from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId

load_dotenv()


class LogSeverity(Enum):
    WARNING = 1
    INFO = 2
    SUCCESS = 3

    @classmethod
    def from_value(cls, value):
        for severity in cls:
            if severity.value == value:
                return severity
        raise ValueError(f"No member of {cls.__name__} has value {value}")


class MonitoringLogMessage:
    def __init__(
        self,
        process_id: str,
        message: str,
        severity: LogSeverity,
        while_tracking: bool,
        current_module: int,
        current_routine: int,
        additional_data: dict | List = None,
    ):
        self._id = ObjectId()
        self._timestamp = datetime.utcnow()
        self._process_id = process_id
        self._message = message
        self._additional_data = additional_data
        self._severity = severity
        self._current_module = current_module
        self._current_routine = current_routine
        self._while_tracking = while_tracking

    def get_log_data(self) -> dict:
        return {
            "_id": self._id,
            "process_id": self._process_id,
            "timestamp": self._timestamp,
            "while_tracking": self._while_tracking,
            "current_routine": self._current_routine,
            "current_module": self._current_module,
            "message": self._message,
            "additional_data": self._additional_data,
            "severity": self._severity.value,
        }

    def log_data_to_json(self):
        return json.dumps(self.get_log_data())

    def __str__(self):
        return (
            f"{self.__class__.__name__}(id={self._id},process_id={self._process_id}, timestamp={self._timestamp},"
            f"message={self._message}, additional_data={self._additional_data}, severity={self._severity.name}, "
            f"while_tracking={self._while_tracking}, "
            f"current_module={self._current_module}, current_routine={self._current_routine})"
        )

    def __repr__(self):
        return (
            f"{self.__class__.__name__}(id={self._id},process_id={self._process_id}, timestamp={self._timestamp}, "
            f"message={self._message}, additional_data={self._additional_data}, severity={self._severity.name}, "
            f"while_tracking={self._while_tracking}, "
            f"current_module={self._current_module}, current_routine={self._current_routine})"
        )


class MonitoringLogger:
    def __init__(self):
        try:
            print("Attempting database connection...")
            self._database_client = MongoClient(
                os.getenv("MONGO_HOST"), int(os.getenv("MONGO_PORT"))
            )
            self._database = self._database_client[os.getenv("DATABASE_NAME")]
            self._collection = self._database[os.getenv("COLLECTION_NAME")]
            self._database.command("ping")
            print("Successfully connected to database")
        except Exception:
           print(f"Database connection could not be established")
           exit(-1)

    def store_log(self, log: MonitoringLogMessage):
        self._collection.insert_one(log.get_log_data())

    def get_total_log_count(
        self,
        process_id: str = None,
        message: str = None,
        severity: int = None,
        while_tracking: bool = None,
        current_routine: int = None,
        current_module: int = None,
        lower_boundary: datetime = None,
        upper_boundary: datetime = None,
    ):
        query = {}
        if process_id is not None:
            query["process_id"] = process_id
        if severity is not None:
            query["severity"] = severity
        if while_tracking is not None:
            query["while_tracking"] = while_tracking
        if current_routine is not None:
            query["current_routine"] = current_routine
        if current_module is not None:
            query["current_module"] = {"$all": current_module}
        if message is not None:
            query["message"] = {"$regex": re.compile(message, re.IGNORECASE)}
        if lower_boundary is not None and upper_boundary is not None:
            query["timestamp"] = {"$gte": lower_boundary, "$lte": upper_boundary}

        if query:
            log_count = self._collection.count_documents(query)
        else:
            log_count = self._collection.count_documents({})
        return log_count

    def get_logs(
        self,
        process_id: str = None,
        message: str = None,
        severity: LogSeverity = None,
        while_tracking: bool = None,
        current_routine: int = None,
        current_module: int = None,
        lower_boundary: datetime = None,
        upper_boundary: datetime = None,
        current_page: int = None,
        limitation: int = None,
    ) -> List:
        query = {}
        if process_id is not None:
            query["process_id"] = process_id
        if severity is not None:
            query["severity"] = severity
        if while_tracking is not None:
            query["while_tracking"] = while_tracking
        if current_routine is not None:
            query["current_routine"] = current_routine
        if current_module is not None:
            query["current_module"] = {"$all": current_module}
        if message is not None:
            query["message"] = {"$regex": re.compile(message, re.IGNORECASE)}
        if lower_boundary is not None and upper_boundary is not None:
            query["timestamp"] = {"$gte": lower_boundary, "$lte": upper_boundary}

        log_messages = []
        try:
            if current_page and limitation:
                cursor = (
                    self._collection.find(query)
                    .skip((current_page - 1) * limitation)
                    .limit(limitation)
                )
            else:
                cursor = self._collection.find(query)
            for log in cursor:
                log_message = MonitoringLogMessage(
                    process_id=log["process_id"],
                    message=log["message"],
                    while_tracking=log["while_tracking"],
                    severity=LogSeverity.from_value(log["severity"]),
                    current_module=log["current_module"],
                    current_routine=log["current_routine"],
                    additional_data=log["additional_data"],
                )
                log_message._timestamp = log["timestamp"].isoformat()
                log_message._id = str(log["_id"])
                log_messages.append(log_message.get_log_data())
        except Exception as e:
            print(e)
        return log_messages

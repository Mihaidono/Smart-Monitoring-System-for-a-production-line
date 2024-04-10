import json
import os
from enum import Enum
from typing import List

from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
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
        message: str,
        severity: LogSeverity,
        while_tracking=None,
        current_module=None,
        current_routine=None,
        additional_data: dict | List = None,
    ):
        self._id = ObjectId()
        self._timestamp = datetime.utcnow()
        self._message = message
        self._additional_data = additional_data
        self._severity = severity
        self._current_module = current_module
        self._current_routine = current_routine
        self._while_tracking = while_tracking

    def get_log_data(self) -> dict:
        return {
            "_id": self._id,
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
            f"{self.__class__.__name__}(id={self._id}, timestamp={self._timestamp}, message={self._message}, "
            f"additional_data={self._additional_data}, severity={self._severity.name}, "
            f"while_tracking={self._while_tracking}, "
            f"current_module={self._current_module}, current_routine={self._current_routine})"
        )

    def __repr__(self):
        return (
            f"{self.__class__.__name__}(id={self._id}, timestamp={self._timestamp}, message={self._message}, "
            f"additional_data={self._additional_data}, severity={self._severity.name}, "
            f"while_tracking={self._while_tracking}, "
            f"current_module={self._current_module}, current_routine={self._current_routine})"
        )


class MonitoringLogger:
    def __init__(self):
        self._database_client = MongoClient(os.getenv("CONNECTION_STRING"))
        self._database = self._database_client[os.getenv("DATABASE_NAME")]
        self._collection = self._database[os.getenv("COLLECTION_NAME")]
        print("Successfully connected Monitoring Logger to database")

    def store_log(self, log: MonitoringLogMessage):
        self._collection.insert_one(log.get_log_data())

    def get_total_log_count(self):
        return self._collection.count_documents({})

    def get_page_of_logs(self, current_page: int, limitation: int):
        return (
            self._collection.find({})
            .skip((current_page - 1) * limitation)
            .limit(limitation)
        )

    def get_logs(
        self,
        log_id: ObjectId = None,
        message: str = None,
        severity: LogSeverity = None,
        while_tracking: bool = None,
        current_routine=None,
        current_module=None,
        lower_boundary: datetime = None,
        upper_boundary: datetime = None,
    ) -> List:
        query = {}
        if log_id is not None:
            query["_id"] = log_id
        if severity is not None:
            query["severity"] = severity.value
        if while_tracking is not None:
            query["while_tracking"] = while_tracking
        if current_routine is not None:
            query["current_routine"] = current_routine
        if current_module is not None:
            query["current_module"] = current_module
        if message is not None:
            query["message"] = {"$regex": message}
        if lower_boundary is not None and upper_boundary is not None:
            query["timestamp"] = {"$gte": lower_boundary, "$lte": upper_boundary}

        log_messages = []
        try:
            cursor = self._collection.find(query)
            for log in cursor:
                log_message = MonitoringLogMessage(
                    message=log["message"],
                    while_tracking=log["while_tracking"],
                    severity=LogSeverity.from_value(log["severity"]),
                    current_module=log["current_module"],
                    current_routine=log["current_routine"],
                    additional_data=log["additional_data"],
                )
                log_message._timestamp = log["timestamp"]
                log_message._id = log["_id"]
                log_messages.append(log_message)
        except Exception as e:
            print(e)
        return log_messages

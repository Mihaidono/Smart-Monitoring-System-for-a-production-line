import json
import os
from enum import Enum
from pprint import pprint
from typing import List

from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()


class LogSeverity(Enum):
    WARNING = 1
    INFO = 2

    @classmethod
    def from_value(cls, value):
        for severity in cls:
            if severity.value == value:
                return severity
        raise ValueError(f"No member of {cls.__name__} has value {value}")


class MonitoringLogMessage:
    def __init__(self, message: str, severity: LogSeverity, while_tracking=None, current_module=None,
                 current_routine=None
                 ):
        self._timestamp = datetime.utcnow()
        self._message = message
        self._severity = severity
        self._current_module = current_module
        self._current_routine = current_routine
        self._while_tracking = while_tracking

    def get_log_data(self) -> dict:
        return {
            'timestamp': self._timestamp,
            'while_tracking': self._while_tracking,
            'current_routine': self._current_routine,
            'current_module': self._current_module,
            'message': self._message,
            'severity': self._severity.value
        }

    def log_data_to_json(self):
        return json.dumps(self.get_log_data())

    def __repr__(self):
        return f"{self.__class__.__name__}(message={self._message!r}, severity={self._severity!r}, " \
               f"while_tracking={self._while_tracking!r}, current_module={self._current_module!r}, " \
               f"current_routine={self._current_routine!r})"

    def __str__(self):
        return f"{self.__class__.__name__}(timestamp={self._timestamp}, message={self._message}, " \
               f"severity={self._severity}, while_tracking={self._while_tracking}, " \
               f"current_module={self._current_module}, current_routine={self._current_routine})"


class MonitoringLogger:
    def __init__(self):
        self._database_client = MongoClient(os.getenv("CONNECTION_STRING"))
        self._database = self._database_client[os.getenv("DATABASE_NAME")]
        self._collection = self._database[os.getenv("COLLECTION_NAME")]

    def store_log_message(self, log: MonitoringLogMessage):
        self._collection.insert_one(log.get_log_data())

    def get_log_message(self, severity: LogSeverity = None, while_tracking: bool = None, current_routine=None,
                        current_module=None) -> List:
        query = {}
        if severity is not None:
            query['severity'] = severity.value
        if while_tracking is not None:
            query['while_tracking'] = while_tracking
        if current_routine is not None:
            query['current_routine'] = current_routine
        if current_module is not None:
            query['current_module'] = current_module
        log_messages = []
        try:
            cursor = self._collection.find(query)
            for log in cursor:
                log_message = MonitoringLogMessage(message=log["message"], while_tracking=log['while_tracking'],
                                                   severity=LogSeverity.from_value(log['severity']),
                                                   current_module=log['current_module'],
                                                   current_routine=log['current_routine'])
                log_message._timestamp = log["timestamp"]
                log_messages.append(log_message)
        except Exception as e:
            print(e)
        return log_messages

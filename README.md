# 🏭 Intelligent Production Line Monitoring System

This project represents my bachelor's thesis, developed during my Computer Engineering studies at the University of Transylvania, Brașov. It focuses on creating a flexible, AI-powered monitoring system for an automated production line using modern full-stack technologies.

## 📌 Project Overview

The goal was to build a monitoring system capable of:
- Detecting and tracking materials using computer vision (YOLOv8)
- Automating the supervision of a simulated production line
- Logging production events and system behavior
- Providing a user-friendly interface for real-time interaction and monitoring

## ⚙️ Technologies Used

### 🧠 AI / Computer Vision
- **YOLOv8**: Used for object detection in camera feeds
- **OpenCV**: Image preprocessing and rendering
- **Ultralytics**: For training and inference with YOLO

### 🐍 Backend
- **Python**: Core monitoring logic and API logic
- **FastAPI**: Exposes REST APIs and WebSocket endpoints
- **MongoDB**: Stores production logs and system data
- **MQTT (paho-mqtt)**: Handles real-time communication with Fischertechnik hardware

### 💻 Frontend
- **React**: Frontend interface for monitoring/logging
- **Material UI (MUI)**: Styled component-based UI

## 🏗️ Hardware Setup

Simulated using a Fischertechnik factory kit with:
- **PLC (SIMATIC ET 200SP)**
- **Fischertechnik TXT controller**
- Color sensors, suction crane, sorting lines, automated storage, and more

## 🔧 Features
- Fully containerized system with `Docker` and `Docker Compose`
- Modular Python backend supporting multi-threaded monitoring
- Image-based inventory validation and anomaly detection
- Interactive UI with logs, manual/auto mode switching, and alerts
- Mobile-friendly frontend design

## 🚀 How to Run

```bash
docker compose up

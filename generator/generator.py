import time
import random
import requests
import threading
from datetime import datetime
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import asyncio
import aiohttp

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

BACKEND_URL = os.getenv("BACKEND_URL")
GENERATOR_CONFIG = {
    "counts_rate": 100,  # events per second
    "vehicle_probability": 0.7,
    "pedestrian_probability": 0.3,
    "downtime_probability": 0.1,
    "traffic_pattern": "normal",
}

running = False
batch_size = 1000  # Batch size for data generation
generated_count = 0

async def generate_counts_data(session):
    global generated_count
    approaches = ['NB', 'SB', 'EB', 'WB']
    vehicle_types = ['car', 'truck', 'bus']
    batch = []

    while running:
        for _ in range(batch_size):
            if random.random() < GENERATOR_CONFIG["vehicle_probability"]:
                class_ = random.choice(vehicle_types)
            else:
                class_ = 'pedestrian'

            approach = random.choice(approaches)
            sensor_id = random.randint(0, 1)
            timestamp = datetime.utcnow().isoformat()

            count_data = {
                "time": timestamp,
                "class_": class_,
                "sensor_id": sensor_id,
                "approach": approach
            }
            batch.append(count_data)

        try:
            async with session.post(f"{BACKEND_URL}/api/ingest/counts", json=batch) as response:
                if response.status == 200:
                    for data in batch:
                        socketio.emit('counts_update', data)
                    generated_count += len(batch)
                else:
                    print(f"Failed to send count data: {await response.text()}")
            batch = []
        except Exception as e:
            print(f"Error sending count data: {e}")

        await asyncio.sleep(1)

async def generate_system_health_data(session):
    sensor_ids = [0, 1]
    batch = []

    while running:
        timestamp = datetime.utcnow().isoformat()
        for sensor_id in sensor_ids:
            system_health_data = {
                "time": timestamp,
                "sensor_id": sensor_id
            }
            batch.append(system_health_data)

        try:
            async with session.post(f"{BACKEND_URL}/api/ingest/system_health", json=batch) as response:
                if response.status == 200:
                    for data in batch:
                        socketio.emit('system_health_update', data)
                else:
                    print(f"Failed to send system health data: {await response.text()}")
            batch = []
        except Exception as e:
            print(f"Error sending system health data: {e}")

        await asyncio.sleep(60)  # Send system health data every minute

def start_generator():
    global running
    running = True
    asyncio.run(run_tasks())

def stop_generator():
    global running
    running = False

async def run_tasks():
    async with aiohttp.ClientSession() as session:
        await asyncio.gather(
            generate_counts_data(session),
            generate_system_health_data(session)
        )

def configure_generator(config):
    GENERATOR_CONFIG.update(config)

@app.route('/api/generator/start', methods=['POST'])
def start():
    start_generator()
    return jsonify({"status": "Generator started"})

@app.route('/api/generator/stop', methods=['POST'])
def stop():
    stop_generator()
    return jsonify({"status": "Generator stopped"})

@app.route('/api/generator/configure', methods=['POST'])
def configure():
    config = request.json
    configure_generator(config)
    return jsonify({"status": "Configuration updated"})

@app.route('/api/generator/count', methods=['GET'])
def get_generated_count():
    return jsonify({"count": generated_count})

@app.route('/api/generator/status', methods=['GET'])
def get_generator_status():
    return jsonify({"running": running})

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5001)

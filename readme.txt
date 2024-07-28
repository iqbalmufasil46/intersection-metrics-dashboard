

Intersection Metrics Dashboard

--------------------------------- Project Overview --------------------------------------------------------------------------------

- The Intersection Metrics Dashboard is designed to monitor and visualize traffic data from various sensors. The system consists of a data generator, backend service, and frontend application. 
- The data generator simulates traffic data and sends it to the backend, which processes and stores the data. The frontend provides an intuitive interface for users to view and analyze the data.

--------------------------------- Technical Choices ------------------------------------------------------------------------------

- FastAPI: For its performance and simplicity in building RESTful APIs.
- React with Material-UI: For creating a modern, responsive frontend application.
- PostgreSQL: For reliable and powerful relational database management.
- Docker: For containerization, ensuring consistent environments across different setups.

--------------------------------- Assumptions and Simplifications ------------------------------------------------------

- Data is simulated and may not represent real-world traffic patterns accurately.
- The data generator runs indefinitely and needs to be manually stopped.
- Simplified error handling in some parts of the code for brevity.

--------------------------------- Ideas for Future Improvements ------------------------------------------------------

- Real-time Data Processing: Improve real-time data handling with more robust WebSocket connections.
- Enhanced UI/UX: Add more visualizations and refine the user interface.
- Scalability: Optimize the backend for handling larger datasets and higher traffic.
- Testing: Implement comprehensive unit and integration tests.
- Security: Add authentication and authorization mechanisms.

---------------------------------- Architecture -----------------------------------------------------------------------------

1. Frontend: 

•	Technology: React.js, Material-UI, Recharts.
•	Dashboard: Displays  charts and tables to visualize vehicle counts, pedestrian counts, system health, and hourly traffic data.
•	Configuration Screen: Allows users to configure the real-time data generator and controlling the generator's operation (start, stop, configure).
•	Real-time Updates: Socket.IO to receive real-time updates from the backend and update the UI dynamically.

2. Backend: 

•	Technology: FastAPI, SQLAlchemy, PostgreSQL.
•	API Endpoints: Provides endpoints to fetch counts, pedestrian counts, data gaps, and hourly data. Also includes endpoints to ingest data and configure the real-time data generator.
•	Data Processing: Processes data to account for system uptime, ensuring representation of offline periods.
•	WebSocket Support: FastAPI-SocketIO for real-time communication with the frontend.

3. Database: 

•	Technology: PostgreSQL.
•	Counts: Stores vehicle and pedestrian detection counts with timestamp, sensor ID, and approach information.
•	System Health: Tracks sensor uptime and downtime.
•	Configuration: Stores configuration settings for the real-time data generator.

4. Real-time Data Generator: 

•	Technology: Python.
•	Simulates Data: Generates road intersection data, including counts data and system health data.
•	Configurable: Allows users to adjust generation rate, vehicle and pedestrian probabilities, system downtime probability, and traffic patterns.
•	Integration: Sends generated data to the backend for storage and real-time updates to the frontend using web socket.

5. Deployment: 

•	Docker: Utilizes Docker and Docker Compose to containerize the frontend, backend, and database.


-------------------------------------- Running the Project with Docker ------------------------------------------------------

1. Clone the Repository:
•	git clone https://github.com/yourusername/intersection-metrics-dashboard.git
•	cd intersection-metrics-dashboard
    
2. Set Up Environment Variables:
There are two environment file once inside Backend and one inside Frontend.Make sure db credentials are set correctly.
  Backend Env:
    •	DATABASE_URL=postgresql://xyz:xyz@db:5432/intersection_metrics

  Frontend Env:
    •	REACT_APP_BACKEND_URL=http://localhost:8000
    •	REACT_APP_GENERATOR_URL=http://localhost:5001

3. Build and Run Docker Containers
•	docker-compose up --build
    
4. Access the Application:
•	Frontend: http://localhost:3000
•	Backend: http://localhost:8000
•	Data Generator: http://localhost:5001



------------------------------------Running the Project without Docker --------------------------------------

1. Clone the Repository:
•	git clone https://github.com/yourusername/intersection-metrics-dashboard.git
•	cd intersection-metrics-dashboard
    
2. Set Up Environment Variables:
There are two environment file once inside Backend and one inside Frontend.Make sure db credentials are set correctly.  
  Backend Env:
    •	DATABASE_URL=postgresql://xyz:xyz@db:5432/intersection_metrics
  Frontend Env:
    •	REACT_APP_BACKEND_URL=http://localhost:8000
    •	REACT_APP_GENERATOR_URL=http://localhost:5001
    
3. Set Up PostgreSQL:
  
•	sudo -u postgres psql
•	CREATE DATABASE intersection_metrics;
•	CREATE USER admin WITH ENCRYPTED PASSWORD 'xyz';
•	GRANT ALL PRIVILEGES ON DATABASE intersection_metrics TO admin;
   
4. Install and Run Backend:
•	cd backend
•	python -m venv venv
•	source venv/bin/activate
•	pip install -r requirements.txt
•	uvicorn main:app --reload --host 0.0.0.0 --port 8000
    
5. Install and Run Frontend:
•	cd  frontend
•	npm install
•	npm start
    
6. Run Data Generator:
•	cd  data-generator
•	python generator.py








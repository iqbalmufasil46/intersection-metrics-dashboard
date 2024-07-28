# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install PostgreSQL client and supervisord
RUN apt-get update && apt-get install -y postgresql-client supervisor

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Set permissions for the log directory
RUN touch /app/data_ingestion.log && chmod 666 /app/data_ingestion.log

# Copy the supervisord configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run supervisord
CMD ["/usr/bin/supervisord"]

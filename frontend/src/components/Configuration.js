import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Grid } from '@mui/material';
import axios from 'axios';

const Configuration = () => {
  const [config, setConfig] = useState({
    counts_rate: 100,
    vehicle_probability: 0.7,
    pedestrian_probability: 0.3,
    downtime_probability: 0.1,
    traffic_pattern: "normal",
  });
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generatorRunning, setGeneratorRunning] = useState(false);

  useEffect(() => {
    const fetchGeneratedCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_GENERATOR_URL}/api/generator/count`);
        setGeneratedCount(response.data.count);
      } catch (error) {
        console.error("Error fetching generated count:", error);
      }
    };

    const fetchGeneratorStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_GENERATOR_URL}/api/generator/status`);
        setGeneratorRunning(response.data.running);
      } catch (error) {
        console.error("Error fetching generator status:", error);
      }
    };

    fetchGeneratedCount();
    fetchGeneratorStatus();
    const interval = setInterval(() => {
      fetchGeneratedCount();
      fetchGeneratorStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_GENERATOR_URL}/api/generator/start`);
      setGeneratedCount(0);
      setGeneratorRunning(true);
    } catch (error) {
      console.error("Error starting generator:", error);
    }
  };

  const handleStop = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_GENERATOR_URL}/api/generator/stop`);
      setGeneratorRunning(false);
    } catch (error) {
      console.error("Error stopping generator:", error);
    }
  };

  const handleConfigure = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_GENERATOR_URL}/api/generator/configure`, config);
    } catch (error) {
      console.error("Error configuring generator:", error);
    }
  };

  const handleChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Configuration
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Counts Rate (events per minute)"
            name="counts_rate"
            value={config.counts_rate}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Vehicle Probability"
            name="vehicle_probability"
            value={config.vehicle_probability}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Pedestrian Probability"
            name="pedestrian_probability"
            value={config.pedestrian_probability}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Downtime Probability"
            name="downtime_probability"
            value={config.downtime_probability}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Traffic Pattern"
            name="traffic_pattern"
            value={config.traffic_pattern}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfigure}
            disabled={generatorRunning}
          >
            Save Configure
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            style={{ marginLeft: 16 }}
            disabled={generatorRunning}
          >
            Start Auto Data Generation
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleStop}
            style={{ marginLeft: 16 }}
            disabled={!generatorRunning}
          >
            Stop Auto Data Generation
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            Generated Data Count: {generatedCount}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Configuration;

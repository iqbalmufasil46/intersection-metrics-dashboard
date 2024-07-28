import React, { useState } from 'react';
import { Container, Typography, Grid, TextField, MenuItem } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import VehicleCountsChart from './VehicleCountsChart';
import PedestrianCountsChart from './PedestrianCountsChart';
import SystemHealthTable from './SystemHealthTable';
import HourlyDataTable from './HourlyDataTable';

const Dashboard = () => {
  const [date, setDate] = useState(new Date());
  const [sensor, setSensor] = useState(1); // Default to 1 and make sure it's an integer
  const [approach, setApproach] = useState('All');
  const [class_, setClass] = useState('All'); // Added class filter

  const filters = { date, sensor: parseInt(sensor, 10), approach, class: class_ }; // Ensure sensor is an integer

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Intersection Metrics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Sensor ID"
            type="number"
            value={sensor}
            onChange={(e) => setSensor(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Approach"
            select
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            fullWidth
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="NB">North Bound</MenuItem>
            <MenuItem value="SB">South Bound</MenuItem>
            <MenuItem value="EB">East Bound</MenuItem>
            <MenuItem value="WB">West Bound</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Class"
            select
            value={class_}
            onChange={(e) => setClass(e.target.value)}
            fullWidth
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="car">Car</MenuItem>
            <MenuItem value="truck">Truck</MenuItem>
            <MenuItem value="bus">Bus</MenuItem>
            <MenuItem value="pedestrian">Pedestrian</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <VehicleCountsChart filters={filters} />
        </Grid>
        <Grid item xs={12}>
          <PedestrianCountsChart filters={filters} />
        </Grid>
        <Grid item xs={12}>
          <SystemHealthTable filters={filters} />
        </Grid>
        <Grid item xs={12}>
          <HourlyDataTable filters={filters} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

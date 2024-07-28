import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import io from 'socket.io-client';
import dayjs from 'dayjs';

const PedestrianCountsChart = ({ filters }) => {
  const [data, setData] = useState([]);
  const [downtime, setDowntime] = useState([]);

  const socket = io(process.env.REACT_APP_BACKEND_URL, {
    path: '/ws/socket.io',
    transports: ['websocket']
  });

  const formatData = (rawData) => {
    const formattedData = rawData.map(item => ({
      time: dayjs(item.time).format('HH'),
      class: item.class_,
      sensorId: item.sensor_id,
      approach: item.approach,
    }));

    const groupedData = formattedData.reduce((acc, curr) => {
      const time = curr.time;
      const approach = curr.approach;

      if (!acc[time]) {
        acc[time] = { time };
      }

      acc[time][approach] = (acc[time][approach] || 0) + 1;
      return acc;
    }, {});

    return Object.values(groupedData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/pedestrian_counts`, {
          params: {
            date: filters.date.toISOString().split('T')[0],
            sensor: filters.sensor,
            approach: filters.approach,
            limit: filters.limit,
            offset: filters.offset
          }
        });
        if (response.data.length === 0) {
          setData([]);
        } else {
          setData(formatData(response.data));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      }
    };

    const fetchDowntime = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/data_gaps`, {
          params: {
            date: filters.date.toISOString().split('T')[0],
            sensor: filters.sensor
          }
        });
        setDowntime(response.data);
      } catch (error) {
        console.error('Error fetching downtime data:', error);
      }
    };

    fetchData();
    fetchDowntime();

    socket.on('counts_update', (newData) => {
      setData((prevData) => formatData([...prevData, newData]));
    });

    return () => {
      socket.disconnect();
    };
  }, [filters]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Pedestrian Counts per Hour by Approach
        </Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" tickFormatter={(tick) => `${tick}:00`} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="NB" stroke="#8884d8" />
              <Line type="monotone" dataKey="SB" stroke="#82ca9d" />
              <Line type="monotone" dataKey="EB" stroke="#ffc658" />
              <Line type="monotone" dataKey="WB" stroke="#ff7300" />
              {downtime.map((period, index) => (
                <ReferenceArea
                  key={index}
                  x1={dayjs(period.start_time).format('HH')}
                  x2={dayjs(period.end_time).format('HH')}
                  y1={0}
                  y2="auto"
                  strokeOpacity={0.3}
                  fill="red"
                  label="Downtime"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PedestrianCountsChart;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import formatDateTime from '../utils/formatDateTime';

const SystemHealthTable = ({ filters }) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/data_gaps`, {
        params: {
          date: filters.date.toISOString().split('T')[0], // Format date to YYYY-MM-DD
          sensor: filters.sensor,
        }
      });
      if (response.data.length === 0) {
        setData([]);
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          System Health Downtime
        </Typography>
        <Box height={300}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                            {data.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} align="center">
                                  No data available
                                </TableCell>
                              </TableRow>
                            ) : (
                              data.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{formatDateTime(row.start_time)}</TableCell>
                                  <TableCell>{formatDateTime(row.end_time)}</TableCell>
                                  <TableCell>{row.duration}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </CardContent>
                  </Card>
                );
              };

              export default SystemHealthTable;


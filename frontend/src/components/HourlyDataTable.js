import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';

const HourlyDataTable = ({ filters }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Set default to 5
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/hourly_data`, {
        params: {
          date: filters.date.toISOString().split('T')[0],
          sensor: filters.sensor,
          approach: filters.approach,
          class_: filters.class,
          limit: rowsPerPage,
          offset: page * rowsPerPage
        }
      });

      console.log('Response from backend:', response.data);

      if (response.data.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
        setTotalRows(response.data.total || 0);  // Ensure totalRows is set from the backend response
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalRows(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters, page, rowsPerPage]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Hourly Traffic Data
        </Typography>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ whiteSpace: 'nowrap' }}>Hour</TableCell>
                <TableCell>Car NB</TableCell>
                <TableCell>Car SB</TableCell>
                <TableCell>Car EB</TableCell>
                <TableCell>Car WB</TableCell>
                <TableCell>Truck NB</TableCell>
                <TableCell>Truck SB</TableCell>
                <TableCell>Truck EB</TableCell>
                <TableCell>Truck WB</TableCell>
                <TableCell>Ped NB</TableCell>
                <TableCell>Ped SB</TableCell>
                <TableCell>Ped EB</TableCell>
                <TableCell>Ped WB</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>{row.hour}</TableCell>
                    <TableCell>{row.car_nb}</TableCell>
                    <TableCell>{row.car_sb}</TableCell>
                    <TableCell>{row.car_eb}</TableCell>
                    <TableCell>{row.car_wb}</TableCell>
                    <TableCell>{row.truck_nb}</TableCell>
                    <TableCell>{row.truck_sb}</TableCell>
                    <TableCell>{row.truck_eb}</TableCell>
                    <TableCell>{row.truck_wb}</TableCell>
                    <TableCell>{row.ped_nb}</TableCell>
                    <TableCell>{row.ped_sb}</TableCell>
                    <TableCell>{row.ped_eb}</TableCell>
                    <TableCell>{row.ped_wb}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  count={totalRows}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HourlyDataTable;

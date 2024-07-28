import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dashboard from './components/Dashboard';
import Configuration from './components/Configuration';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Intersection Metrics Dashboard
            </Typography>
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/configuration">Configuration</Button>
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/configuration" component={Configuration} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;

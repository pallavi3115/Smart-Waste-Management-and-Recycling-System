import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../services/api";

function RouteOptimization() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/driver/routes");
      setRoutes(res.data.data || []);
    } catch (err) {
      console.log(err);
      setRoutes([]);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "success";
    if (status === "In Progress") return "info";
    if (status === "Started") return "warning";
    return "default";
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f1f5f9", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        🚛 Route Optimization Dashboard
      </Typography>

      {/* ROUTES GRID */}
      <Grid container spacing={3}>
        {routes.length === 0 ? (
          <Typography>No Routes Available</Typography>
        ) : (
          routes.map((route) => {
            const progress = route.progress || 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={route._id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: "0.3s",
                    '&:hover': { transform: "scale(1.02)" }
                  }}
                >
                  <CardContent>

                    {/* TOP */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600}>
                        {route.routeId}
                      </Typography>
                      <Chip
                        label={route.status}
                        color={getStatusColor(route.status)}
                        size="small"
                      />
                    </Stack>

                    {/* DETAILS */}
                    <Box sx={{ mt: 2 }}>
                      <Typography>📅 {new Date(route.date).toDateString()}</Typography>
                      <Typography>🛣 Distance: {route.totalDistance} km</Typography>
                      <Typography>⏱ Time: {route.estimatedDuration} min</Typography>
                      <Typography>📍 Stops: {route.stopsCount}</Typography>
                    </Box>

                    {/* PROGRESS */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Progress: {progress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                      />
                    </Box>

                    {/* ACTIONS */}
                    <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => alert("Start Route")}
                      >
                        ▶ Start
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => alert("Optimize Route")}
                      >
                        🚀 Optimize
                      </Button>
                    </Stack>

                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

    </Box>
  );
}

export default RouteOptimization;
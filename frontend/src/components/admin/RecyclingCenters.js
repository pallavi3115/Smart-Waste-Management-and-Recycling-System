import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import api from "../../services/api";

function RecyclingCenterPage() {
  const [centers, setCenters] = useState([]);

  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    capacity: "",
    address: ""
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const res = await api.get("/recycling/centers");
      setCenters(res.data.data || []);
    } catch {
      setCenters([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/recycling/centers", {
        name: form.name,
        capacity: Number(form.capacity),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address
      });

      alert("Center Added ✅");

      setForm({
        name: "",
        latitude: "",
        longitude: "",
        capacity: "",
        address: ""
      });

      fetchCenters();
    } catch {
      alert("Error ❌");
    }
  };

  // 🔥 UTIL FUNCTIONS
  const getFill = (c) => {
    if (!c.capacity || typeof c.capacity === "number") return 0;
    return (c.capacity.current / c.capacity.total) * 100;
  };

  const totalCenters = centers.length;
  const fullCenters = centers.filter(c => getFill(c) >= 100).length;
  const activeCenters = centers.filter(c => c.isActive).length;

  const avgFill = totalCenters
    ? Math.round(centers.reduce((a, c) => a + getFill(c), 0) / totalCenters)
    : 0;

  const overloaded = centers
    .filter(c => getFill(c) > 80)
    .slice(0, 5);

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        ♻️ Recycling Analytics Dashboard
      </Typography>

      {/* 🔥 STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Centers", value: totalCenters, color: "#4F46E5" },
          { title: "Full Centers", value: fullCenters, color: "#EF4444" },
          { title: "Active Centers", value: activeCenters, color: "#10B981" },
          { title: "Avg Utilization", value: avgFill + "%", color: "#F59E0B" }
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 4,
                background: alpha(item.color, 0.08),
                border: `1px solid ${alpha(item.color, 0.2)}`,
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: `0 10px 25px ${alpha(item.color, 0.3)}`
                }
              }}
            >
              <CardContent>
                <Typography>{item.title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 FORM */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ➕ Add Recycling Center
        </Typography>

        <Grid container spacing={2}>
          {["name", "capacity", "latitude", "longitude"].map((field, i) => (
            <Grid item xs={12} md={3} key={i}>
              <TextField
                fullWidth
                label={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit}>
              Add Center
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 🔥 OVERLOADED */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🚨 High Load Centers
        </Typography>

        {overloaded.length === 0 ? (
          <Typography>All centers operating normally ✅</Typography>
        ) : (
          overloaded.map(c => (
            <Box key={c._id} sx={{ mb: 2 }}>
              <Typography>{c.name} ({getFill(c).toFixed(0)}%)</Typography>
              <LinearProgress
                variant="determinate"
                value={getFill(c)}
                color="error"
              />
            </Box>
          ))
        )}
      </Paper>

      {/* 🔥 TABLE */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📍 All Centers
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Capacity</b></TableCell>
                <TableCell><b>Fill</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Rating</b></TableCell>
                <TableCell><b>Materials</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {centers.map((c) => {
                const fill = getFill(c);

                return (
                  <TableRow key={c._id}>
                    <TableCell>{c.name}</TableCell>

                    <TableCell>
                      {typeof c.capacity === "number"
                        ? `${c.capacity} tons`
                        : `${c.capacity?.current || 0}/${c.capacity?.total || 0}`}
                    </TableCell>

                    <TableCell sx={{ width: 200 }}>
                      <Typography>{fill.toFixed(0)}%</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={fill}
                        color={fill > 80 ? "error" : "success"}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          fill >= 100 ? "Full"
                          : fill > 70 ? "High"
                          : "Available"
                        }
                        color={
                          fill >= 100 ? "error"
                          : fill > 70 ? "warning"
                          : "success"
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      ⭐ {c.rating?.average || 0}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {c.materials?.map((m, i) => (
                          <Chip key={i} label={m.type} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>

    </Box>
  );
}

export default RecyclingCenterPage;
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
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

function BinManagement() {
  const [bins, setBins] = useState([]);
  const [form, setForm] = useState({
    binId: "",
    capacity: "",
    type: "General",
    latitude: "",
    longitude: "",
    area: ""
  });

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      const res = await api.get("/bins/all");
      setBins(res.data.data || []);
    } catch {
      setBins([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.binId || !form.capacity || !form.latitude || !form.longitude || !form.area) {
      alert("Fill all fields ⚠️");
      return;
    }

    try {
      await api.post("/bins/register", {
        binId: form.binId,
        capacity: Number(form.capacity),
        type: form.type,
        area: form.area,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(form.longitude),
            parseFloat(form.latitude)
          ]
        }
      });

      alert("Bin Added ✅");

      setForm({
        binId: "",
        capacity: "",
        type: "General",
        latitude: "",
        longitude: "",
        area: ""
      });

      fetchBins();

    } catch (err) {
      alert(err.response?.data?.message || "Error ❌");
    }
  };

  const getFillColor = (level) => {
    if (level > 80) return "error";
    if (level > 50) return "warning";
    return "success";
  };

  // 🔥 Stats (same UI)
  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.status === "Full").length;
  const activeBins = bins.filter(b => b.isActive).length;
  const avgFill = totalBins
    ? Math.round(bins.reduce((a, b) => a + (b.currentFillLevel || 0), 0) / totalBins)
    : 0;

  const criticalBins = bins
    .filter(b => b.currentFillLevel > 80 || b.alerts?.fire)
    .slice(0, 5);

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* TITLE */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        ♻️ Smart Bin Analytics
      </Typography>

      {/* 🔥 STATS CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Bins", value: totalBins, color: "#4F46E5" },
          { title: "Full Bins", value: fullBins, color: "#EF4444" },
          { title: "Active Bins", value: activeBins, color: "#10B981" },
          { title: "Avg Fill", value: avgFill + "%", color: "#F59E0B" }
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 4,
                background: alpha(item.color, 0.08),
                border: `1px solid ${alpha(item.color, 0.2)}`,
                transition: "0.3s",
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

      {/* 🔥 ADD BIN FORM */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ➕ Add Smart Bin
        </Typography>

        <Grid container spacing={2}>
          {["binId", "capacity", "area", "latitude", "longitude"].map((field) => (
            <Grid item xs={12} md={3} key={field}>
              <TextField
                label={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          ))}

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              fullWidth
            >
              {["General", "Recyclable", "Organic", "Hazardous", "E-Waste"].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit}>
              Add Bin
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 🔥 CRITICAL BINS */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🚨 Critical Bins
        </Typography>

        {criticalBins.length === 0 ? (
          <Typography>No critical bins ✅</Typography>
        ) : (
          criticalBins.map(bin => (
            <Box key={bin._id} sx={{ mb: 2 }}>
              <Typography>{bin.area} ({bin.currentFillLevel}%)</Typography>
              <LinearProgress
                variant="determinate"
                value={bin.currentFillLevel}
                color={getFillColor(bin.currentFillLevel)}
              />
            </Box>
          ))
        )}
      </Paper>

      {/* 🔥 TABLE */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📋 All Bins
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Type</b></TableCell>
                <TableCell><b>Area</b></TableCell>
                <TableCell><b>Fill</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Battery</b></TableCell>
                <TableCell><b>Fire</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {bins.map((bin) => (
                <TableRow key={bin._id}>
                  <TableCell>{bin.binId}</TableCell>
                  <TableCell>{bin.type}</TableCell>
                  <TableCell>{bin.area}</TableCell>

                  <TableCell>
                    <Typography variant="body2">{bin.currentFillLevel}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={bin.currentFillLevel}
                      color={getFillColor(bin.currentFillLevel)}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip label={bin.status} size="small" />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={(bin.batteryLevel || 100) + "%"}
                      color={(bin.batteryLevel || 100) < 20 ? "error" : "success"}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {bin.alerts?.fire ? (
                      <Chip label="FIRE" color="error" size="small" />
                    ) : (
                      <Chip label="Safe" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>

    </Box>
  );
}

export default BinManagement;
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import api from "../../services/api";

function Reports() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // 📊 FETCH SUMMARY
  const fetchSummary = async () => {
    try {
      const res = await api.get("/reports/summary");
      setSummary(res.data.data);
    } catch (err) {
      console.log("Summary error");
    }
  };

  // 📋 FETCH REPORTS
  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data.data || []);
    } catch (err) {
      console.log("Reports error");
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchReports();
  }, []);

  // 🔍 FILTER + SEARCH
  const filteredReports = reports.filter((r) => {
    const matchStatus = filter === "ALL" || r.status === filter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // 🎨 STATUS COLOR
  const getColor = (status) => {
    if (status === "PENDING") return "#f59e0b";
    if (status === "IN_PROGRESS") return "#3b82f6";
    if (status === "RESOLVED") return "#10b981";
    return "#ef4444";
  };

  // 🔁 UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/reports/${id}/status`, { status });
      fetchReports();
      fetchSummary();
    } catch (err) {
      alert("Update failed ❌");
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        📊 Reports Dashboard
      </Typography>

      {/* STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total", value: summary.total, color: "#6366f1" },
          { title: "Pending", value: summary.pending, color: "#f59e0b" },
          { title: "Progress", value: summary.inProgress, color: "#3b82f6" },
          { title: "Resolved", value: summary.resolved, color: "#10b981" }
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card sx={{
              borderRadius: 4,
              background: alpha(item.color, 0.1),
              border: `1px solid ${alpha(item.color, 0.3)}`
            }}>
              <CardContent>
                <Typography>{item.title}</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {item.value || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FILTER + SEARCH */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
        >
          {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search Title..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* TABLE */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📋 All Reports
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Title</b></TableCell>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Priority</b></TableCell>
              <TableCell><b>Action</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredReports.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.category}</TableCell>

                <TableCell>
                  <Chip
                    label={r.status}
                    size="small"
                    sx={{
                      bgcolor: getColor(r.status),
                      color: "#fff"
                    }}
                  />
                </TableCell>

                <TableCell>{r.priority}</TableCell>

                <TableCell>
                  <Button
                    size="small"
                    onClick={() => updateStatus(r._id, "IN_PROGRESS")}
                  >
                    Start
                  </Button>

                  <Button
                    size="small"
                    color="success"
                    onClick={() => updateStatus(r._id, "RESOLVED")}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
}

export default Reports;
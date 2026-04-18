import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
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

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await api.get("/audit-logs");
      setLogs(res.data.data || []);
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🔥 FILTER
  const filteredLogs = logs.filter(
    (log) =>
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase())
  );

  // 🔥 STATS
  const totalLogs = logs.length;
  const createLogs = logs.filter(l => l.action === "CREATE").length;
  const deleteLogs = logs.filter(l => l.action === "DELETE").length;
  const updateLogs = logs.filter(l => l.action === "UPDATE").length;

  const getColor = (action) => {
    if (action === "DELETE") return "error";
    if (action === "CREATE") return "success";
    return "warning";
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* TITLE */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        📜 Audit Logs Dashboard
      </Typography>

      {/* 🔥 STATS CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Logs", value: totalLogs, color: "#4F46E5" },
          { title: "Created", value: createLogs, color: "#10B981" },
          { title: "Deleted", value: deleteLogs, color: "#EF4444" },
          { title: "Updated", value: updateLogs, color: "#F59E0B" }
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

      {/* 🔍 SEARCH */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4 }}>
        <TextField
          fullWidth
          label="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {/* 📋 TABLE */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Activity Logs
        </Typography>

        <TableContainer>
          <Table>

            <TableHead>
              <TableRow>
                <TableCell><b>User</b></TableCell>
                <TableCell><b>Action</b></TableCell>
                <TableCell><b>Module</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Time</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log._id}>

                  <TableCell>{log.user}</TableCell>

                  <TableCell>
                    <Chip
                      label={log.action}
                      color={getColor(log.action)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.description}</TableCell>

                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
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

export default AuditLogs;
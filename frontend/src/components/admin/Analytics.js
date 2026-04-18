import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";

import {
  Doughnut,
  Line
} from "react-chartjs-2";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";

import api from "../../services/api";

// ✅ Chart register
ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setData(res.data.data);
    } catch (err) {
      console.log(err);

      // fallback demo data
      setData({
        totalBins: 20,
        fullBins: 6,
        emptyBins: 5,
        avgFill: 65,
        avgCenterLoad: 70,
        weeklyTrend: [40, 60, 55, 70, 80, 90, 65],
        criticalBins: []
      });
    }
  };

  if (!data) return <Typography>Loading...</Typography>;

  // 📊 Charts
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Waste Trend",
        data: data.weeklyTrend,
        borderColor: "#4F46E5",
        tension: 0.4
      }
    ]
  };

  const doughnutData = {
    labels: ["Full", "Empty", "Others"],
    datasets: [
      {
        data: [
          data.fullBins,
          data.emptyBins,
          data.totalBins - data.fullBins - data.emptyBins
        ],
        backgroundColor: ["#EF4444", "#10B981", "#F59E0B"]
      }
    ]
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* TITLE */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        📊 Analytics Dashboard
      </Typography>

      {/* 🔥 STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total Bins", value: data.totalBins, color: "#4F46E5" },
          { label: "Full Bins", value: data.fullBins, color: "#EF4444" },
          { label: "Avg Fill", value: data.avgFill + "%", color: "#F59E0B" },
          { label: "Center Load", value: data.avgCenterLoad + "%", color: "#10B981" }
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card sx={{
              borderRadius: 4,
              background: alpha(item.color, 0.08),
              border: `1px solid ${alpha(item.color, 0.2)}`
            }}>
              <CardContent>
                <Typography>{item.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 📈 CHARTS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Waste Trend
            </Typography>
            <Line data={lineData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Bin Distribution
            </Typography>
            <Doughnut data={doughnutData} />
          </Paper>
        </Grid>

      </Grid>

      {/* 🚨 CRITICAL BINS */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Critical Bins
        </Typography>

        {data.criticalBins.length === 0 ? (
          <Typography>No critical bins ✅</Typography>
        ) : (
          data.criticalBins.map((bin) => (
            <Box key={bin._id} sx={{ mb: 2 }}>
              <Typography>
                {bin.area} ({bin.currentFillLevel}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={bin.currentFillLevel}
                color={bin.currentFillLevel > 80 ? "error" : "success"}
              />
            </Box>
          ))
        )}
      </Paper>

    </Box>
  );
}

export default AnalyticsPage;
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
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
import api from "../../services/api"; // ✅ IMPORTANT (use this, NOT axios)

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Driver",
    phone: "",
    area: ""
  });

  // 📌 GET STAFF (FIXED)
  const fetchStaff = async () => {
    try {
      const res = await api.get("/users/staff"); // ✅ FIXED
      setStaff(res.data.data || []);
    } catch (err) {
      console.log(err);
      setStaff([]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📌 ADD STAFF (FIXED)
  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert("Fill all fields ⚠️");
      return;
    }

    try {
      await api.post("/users/staff", form); // ✅ FIXED

      setOpen(false);
      setForm({
        name: "",
        email: "",
        role: "Driver",
        phone: "",
        area: ""
      });

      fetchStaff();
      alert("Staff Added ✅");
    } catch (err) {
      console.log(err);
      alert("Error ❌");
    }
  };

  // STATS
  const totalStaff = staff.length;
  const drivers = staff.filter(s => s.role === "Driver").length;
  const admins = staff.filter(s => s.role === "Admin").length;
  const supervisors = staff.filter(s => s.role === "Supervisor").length;

  const getRoleColor = (role) => {
    if (role === "Admin") return "#EF4444";
    if (role === "Driver") return "#F59E0B";
    return "#10B981";
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* TITLE */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        👨‍💼 Staff Management
      </Typography>

      {/* STATS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Staff", value: totalStaff, color: "#4F46E5" },
          { title: "Drivers", value: drivers, color: "#F59E0B" },
          { title: "Admins", value: admins, color: "#EF4444" },
          { title: "Supervisors", value: supervisors, color: "#10B981" }
        ].map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 4,
                background: alpha(item.color, 0.08),
                border: `1px solid ${alpha(item.color, 0.2)}`
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

      {/* ADD BUTTON */}
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 3 }}>
        + Add Staff
      </Button>

      {/* TABLE */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📋 Staff List
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Area</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {staff.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ bgcolor: "#4F46E5" }}>
                        {s.name?.charAt(0)}
                      </Avatar>
                      {s.name}
                    </Box>
                  </TableCell>

                  <TableCell>{s.email}</TableCell>

                  <TableCell>
                    <Chip
                      label={s.role}
                      sx={{
                        bgcolor: getRoleColor(s.role),
                        color: "white"
                      }}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.area}</TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>

      {/* ADD DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>➕ Add Staff</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="dense"
            label="Area"
            name="area"
            value={form.area}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            select
            margin="dense"
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            {["Driver", "Admin", "Supervisor"].map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default StaffManagement;
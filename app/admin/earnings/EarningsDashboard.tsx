"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

interface EarningsData {
  currentMonth: number;
  lastMonth: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  currentMonthOrdersCount: number;
  lastMonthOrdersCount: number;
  historicalMonthlyData: MonthlyData[];
}

interface MonthlyData {
  month: string;
  year: number;
  earnings: number;
  ordersCount: number;
  averageOrderValue: number;
}

export function EarningsDashboard() {
  const [earnings, setEarnings] = useState<EarningsData>({
    currentMonth: 0,
    lastMonth: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    currentMonthOrdersCount: 0,
    lastMonthOrdersCount: 0,
    historicalMonthlyData: [],
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/earnings');
      const data = await response.json();

      if (response.ok) {
        setEarnings(data);
        setMonthlyData(data.historicalMonthlyData || []);
      } else {
        setError(data.error || 'Failed to fetch earnings data');
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setError('Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMonthData = () => {
    if (selectedMonth === "all") {
      return {
        earnings: earnings.totalRevenue,
        ordersCount: earnings.totalOrders,
        averageOrderValue: earnings.averageOrderValue,
        monthName: "All Months"
      };
    } else if (selectedMonth === "current") {
      return {
        earnings: earnings.currentMonth,
        ordersCount: earnings.currentMonthOrdersCount,
        averageOrderValue: earnings.currentMonthOrdersCount > 0
          ? earnings.currentMonth / earnings.currentMonthOrdersCount
          : 0,
        monthName: "Current Month"
      };
    } else if (selectedMonth === "last") {
      return {
        earnings: earnings.lastMonth,
        ordersCount: earnings.lastMonthOrdersCount,
        averageOrderValue: earnings.lastMonthOrdersCount > 0
          ? earnings.lastMonth / earnings.lastMonthOrdersCount
          : 0,
        monthName: "Last Month"
      };
    } else {
      // Handle specific month selection (format: YYYY-MM)
      const [year, month] = selectedMonth.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

      // Check if it's current month
      if (selectedMonth === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`) {
        return {
          earnings: earnings.currentMonth,
          ordersCount: earnings.currentMonthOrdersCount,
          averageOrderValue: earnings.currentMonthOrdersCount > 0
            ? earnings.currentMonth / earnings.currentMonthOrdersCount
            : 0,
          monthName
        };
      }

      // Check if it's last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthValue = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      if (selectedMonth === lastMonthValue) {
        return {
          earnings: earnings.lastMonth,
          ordersCount: earnings.lastMonthOrdersCount,
          averageOrderValue: earnings.lastMonthOrdersCount > 0
            ? earnings.lastMonth / earnings.lastMonthOrdersCount
            : 0,
          monthName
        };
      }

      // Check historical data
      const monthData = monthlyData.find(m => `${m.year}-${m.month}` === selectedMonth);
      return monthData ? {
        earnings: monthData.earnings,
        ordersCount: monthData.ordersCount,
        averageOrderValue: monthData.averageOrderValue,
        monthName
      } : {
        earnings: 0,
        ordersCount: 0,
        averageOrderValue: 0,
        monthName
      };
    }
  };

  const getGrowthPercentage = () => {
    if (earnings.lastMonth === 0) return earnings.currentMonth > 0 ? 100 : 0;
    return ((earnings.currentMonth - earnings.lastMonth) / earnings.lastMonth) * 100;
  };

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  const generateMonthOptions = () => {
    const options = [
      { value: "all", label: "All Months" },
      { value: "current", label: "Current Month" },
      { value: "last", label: "Last Month" },
    ];

    // Generate month options for the current year and previous year (same as orders page)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Add current year months
    for (let i = currentMonth; i >= 0; i--) {
      const date = new Date(currentYear, i);
      const value = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }

    // Add previous year months if we're not in January
    if (currentMonth < 11) {
      for (let i = 11; i >= currentMonth + 1; i--) {
        const date = new Date(currentYear - 1, i);
        const value = `${currentYear - 1}-${String(i + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        options.push({ value, label });
      }
    }

    return options;
  };

  const selectedData = getSelectedMonthData();
  const growthPercentage = getGrowthPercentage();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Month Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Select Month"
                >
                  {generateMonthOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  fetchEarnings();
                }}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Selected Month Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            {selectedData.monthName} Performance
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Earnings
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(selectedData.earnings)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Orders Count
              </Typography>
              <Typography variant="h4" color="primary">
                {selectedData.ordersCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(selectedData.averageOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Growth vs Last Month
              </Typography>
              <Box display="flex" alignItems="center">
                {growthPercentage >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography
                  variant="h4"
                  color={growthPercentage >= 0 ? "success.main" : "error.main"}
                >
                  {Math.abs(growthPercentage).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overall Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Overall Statistics
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders (All Time)
              </Typography>
              <Typography variant="h4">
                {earnings.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Month Earnings
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(earnings.currentMonth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Last Month Earnings
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(earnings.lastMonth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Order Value (All Time)
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(earnings.averageOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Breakdown
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Total Earnings</TableCell>
                  <TableCell align="right">Average Order Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Current Month */}
                <TableRow selected={selectedMonth === "current"}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">
                        Current Month
                      </Typography>
                      <Chip
                        label="Current"
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">{earnings.currentMonthOrdersCount}</TableCell>
                  <TableCell align="right">{formatCurrency(earnings.currentMonth)}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(earnings.currentMonthOrdersCount > 0
                      ? earnings.currentMonth / earnings.currentMonthOrdersCount
                      : 0)}
                  </TableCell>
                </TableRow>

                {/* Last Month */}
                <TableRow selected={selectedMonth === "last"}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">
                        Last Month
                      </Typography>
                      <Chip
                        label="Previous"
                        size="small"
                        color="info"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">{earnings.lastMonthOrdersCount}</TableCell>
                  <TableCell align="right">{formatCurrency(earnings.lastMonth)}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(earnings.lastMonthOrdersCount > 0
                      ? earnings.lastMonth / earnings.lastMonthOrdersCount
                      : 0)}
                  </TableCell>
                </TableRow>

                {/* Historical Months */}
                {monthlyData.map((month) => (
                  <TableRow
                    key={`${month.year}-${month.month}`}
                    selected={selectedMonth === `${month.year}-${month.month}`}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {month.month} {month.year}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{month.ordersCount}</TableCell>
                    <TableCell align="right">{formatCurrency(month.earnings)}</TableCell>
                    <TableCell align="right">{formatCurrency(month.averageOrderValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Create CSV export
                const csvData = [
                  ['Month', 'Orders', 'Total Earnings', 'Average Order Value'],
                  ['Current Month', earnings.currentMonthOrdersCount, earnings.currentMonth, earnings.currentMonthOrdersCount > 0 ? earnings.currentMonth / earnings.currentMonthOrdersCount : 0],
                  ['Last Month', earnings.lastMonthOrdersCount, earnings.lastMonth, earnings.lastMonthOrdersCount > 0 ? earnings.lastMonth / earnings.lastMonthOrdersCount : 0],
                  ...monthlyData.map(month => [month.month + ' ' + month.year, month.ordersCount, month.earnings, month.averageOrderValue])
                ];

                const csvContent = csvData.map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `olgish-cakes-earnings-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              Export to CSV
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

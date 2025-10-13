'use client';

import { useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography, Paper, Alert } from '@mui/material';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function TestEmailsPage() {
  const [emailData, setEmailData] = useState({
    deliveryMethod: 'postal',
    trackingNumber: '',
    status: 'out-delivery'
  });
  const [emailHtml, setEmailHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testEmail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (data.success) {
        setEmailHtml(data.email.html);
      } else {
        setError(data.error || 'Failed to generate test email');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Email Testing Tool
        </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Email Parameters
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Delivery Method</InputLabel>
            <Select
              value={emailData.deliveryMethod}
              onChange={(e) => setEmailData({ ...emailData, deliveryMethod: e.target.value })}
              label="Delivery Method"
            >
              <MenuItem value="postal">Postal Delivery</MenuItem>
              <MenuItem value="postal-delivery">Postal Delivery (Alt)</MenuItem>
              <MenuItem value="local-delivery">Local Delivery</MenuItem>
              <MenuItem value="collection">Collection</MenuItem>
              <MenuItem value="market-pickup">Market Pickup</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={emailData.status}
              onChange={(e) => setEmailData({ ...emailData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="ready-pickup">Ready Pickup</MenuItem>
              <MenuItem value="out-delivery">Out Delivery</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          label="Tracking Number (optional)"
          value={emailData.trackingNumber}
          onChange={(e) => setEmailData({ ...emailData, trackingNumber: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="e.g., AB123456789GB"
        />

        <Button
          variant="contained"
          onClick={testEmail}
          disabled={loading}
          sx={{ backgroundColor: '#2E3192' }}
        >
          {loading ? 'Generating...' : 'Generate Test Email'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {emailHtml && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Email Preview
          </Typography>
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '80vh'
            }}
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />
        </Paper>
      )}
      </Box>
    </AdminAuthGuard>
  );
}

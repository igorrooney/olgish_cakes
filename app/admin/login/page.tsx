"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { designTokens } from '@/lib/design-system';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token in localStorage
        localStorage.setItem('admin_token', data.token);
        router.push('/admin/blog');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ maxWidth: 400, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LockIcon sx={{ fontSize: 48, color: designTokens.colors.primary.main, mb: 2 }} />
            <Typography variant="h4" component="h1" sx={{ color: designTokens.colors.primary.main, fontWeight: 600 }}>
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Access the blog management system
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              margin="normal"
              required
              autoComplete="username"
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              margin="normal"
              required
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: designTokens.colors.primary.main,
                '&:hover': {
                  backgroundColor: designTokens.colors.primary.dark,
                },
                borderRadius: '35px',
                py: 1.5,
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

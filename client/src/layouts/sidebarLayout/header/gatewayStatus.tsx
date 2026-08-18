import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Stack,
  Tooltip,
  useTheme
} from '@mui/material';

type ServiceStatus = {
  connected: boolean;
  configured?: boolean;
};

type GatewayStatusData = {
  backend: {
    location: string;
  };
  gateway: {
    mosquitto: ServiceStatus;
    websocket: ServiceStatus;
    mongodb: ServiceStatus;
  };
};

const SERVICE_DOT_SIZE = 10;

const StatusDot = ({
  label,
  status
}: {
  label: string;
  status: ServiceStatus | undefined;
}) => {
  const theme = useTheme();

  let color = theme.palette.error.main;
  let title = `${label}: Down`;

  if (!status) {
    color = theme.palette.text.disabled;
    title = `${label}: Unknown`;
  } else if (status.connected) {
    color = theme.palette.success.main;
    title = `${label}: Live`;
  } else if (status.configured === false) {
    color = theme.palette.text.disabled;
    title = `${label}: Not configured`;
  }

  return (
    <Tooltip title={title} arrow>
      <Box
        sx={{
          width: SERVICE_DOT_SIZE,
          height: SERVICE_DOT_SIZE,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow: `0 0 0 2px ${color}22`,
        }}
      />
    </Tooltip>
  );
};

function GatewayStatus() {
  const [status, setStatus] = useState<GatewayStatusData | null>(null);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/status', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        if (mounted) setStatus(data);
      } catch {
        if (mounted) setStatus(null);
      }
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const location = status?.backend?.location;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ mr: 1 }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <StatusDot label="Mosquitto" status={status?.gateway?.mosquitto} />
        <StatusDot label="MongoDB" status={status?.gateway?.mongodb} />
      </Stack>
      <Tooltip title="Backend deployment location" arrow>
        <Chip
          size="small"
          variant="outlined"
          label={location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Unknown'}
          sx={{ height: 24 }}
        />
      </Tooltip>
    </Stack>
  );
}

export default GatewayStatus;
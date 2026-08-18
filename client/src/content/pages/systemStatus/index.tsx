import { useEffect, useState, ReactNode } from 'react';
import { Card, Chip, Container, Stack, Tooltip, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Public, Storage } from '@mui/icons-material';
import PageTitleWrapper from 'src/components/pageTitleWrapper';

type ServiceStatus = { connected: boolean; configured?: boolean };

type StatusData = {
  backend: {
    location: string;
    mqttUri: string;
    hostname: string;
    port: number;
    nodeEnv: string;
    nodeVersion: string;
    uptimeSeconds: number;
    serverTime: string;
    memoryMb: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
  };
  gateway: {
    mosquitto: ServiceStatus;
    websocket: ServiceStatus;
    mongodb: ServiceStatus;
  };
};

const resolveStatus = (status: ServiceStatus | undefined) => {
  if (!status) return { label: 'Unknown', color: 'text.disabled' };
  if (status.connected) return { label: 'Live', color: 'success.main' };
  if (status.configured === false) return { label: 'Not configured', color: 'text.disabled' };
  return { label: 'Down', color: 'error.main' };
};

const ServiceRow = ({
  label,
  status,
  description,
}: {
  label: string;
  status: ServiceStatus | undefined;
  description: string;
}) => {
  const { label: text, color } = resolveStatus(status);
  return (
    <Tooltip title={description} arrow placement="top">
      <Typography variant="body1">
        {label}:{' '}
        <Typography component="span" variant="body1" sx={{ color, fontWeight: 600 }}>
          {text}
        </Typography>
      </Typography>
    </Tooltip>
  );
};

const FieldRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) => (
  <Tooltip title={description} arrow placement="top">
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body1">{label}:</Typography>
      {children}
    </Stack>
  </Tooltip>
);

const SystemStatus = () => {
  const [status, setStatus] = useState<StatusData | null>(null);

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

  const frontendHost =
    window.location.hostname + (window.location.port ? `:${window.location.port}` : '');
  const backendHost =
    status && status.backend.hostname != null && status.backend.port != null
      ? `${status.backend.hostname}:${status.backend.port}`
      : null;

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [d > 0 ? `${d}d` : null, h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null, `${s}s`]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div>
      <Helmet>
        <title>System Status</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">System Status</Typography>
      </PageTitleWrapper>
      <Container>
        <Stack direction="row" spacing={2} mt={2}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Storage fontSize="small" color="primary" />
              <Typography variant="h6">Gateway</Typography>
            </Stack>
            <Stack spacing={0.5}>
              <ServiceRow
                label="Mosquitto"
                status={status?.gateway?.mosquitto}
                description="MQTT message broker the gateway uses to communicate with devices. Live = reachable."
              />
              <ServiceRow
                label="MongoDB"
                status={status?.gateway?.mongodb}
                description="Database storing projects, devices, sessions and measurements. Live = reachable."
              />
              <ServiceRow
                label="Device Gateway (WS)"
                status={status?.gateway?.websocket}
                description="WebSocket link between the portal backend and the SensorSPHEREGateway process (port 8080). Carries device events and commands."
              />
            </Stack>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Public fontSize="small" color="primary" />
              <Typography variant="h6">Hosting</Typography>
            </Stack>
            <Stack spacing={1}>
              <FieldRow
                label="Frontend"
                description="Address of the web app (React) you are viewing."
              >
                <Typography variant="body1" fontWeight={600}>
                  {frontendHost}
                </Typography>
              </FieldRow>
              <FieldRow
                label="Backend"
                description="Address of the portal API server (Node/Express); the chip shows Local or Cloud deployment."
              >
                {backendHost ? (
                  <Typography variant="body1" fontWeight={600}>
                    {backendHost}
                  </Typography>
                ) : (
                  <Typography variant="body1" fontWeight={600} color="text.disabled">
                    Unidentified
                  </Typography>
                )}
                {status?.backend?.location && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={status.backend.location}
                    sx={{ height: 20 }}
                  />
                )}
              </FieldRow>
              <FieldRow
                label="MQTT Broker"
                description="MQTT URI of the mosquitto broker the backend publishes to."
              >
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  {status?.backend?.mqttUri || 'Unknown'}
                </Typography>
              </FieldRow>
              <FieldRow
                label="Environment"
                description="Deployment location · NODE_ENV · Node.js version running the backend."
              >
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  {status?.backend?.nodeVersion
                    ? `${status.backend.location} · ${status.backend.nodeEnv} · Node ${status.backend.nodeVersion}`
                    : status?.backend?.location || 'Unknown'}
                </Typography>
              </FieldRow>
              <FieldRow
                label="Backend uptime"
                description="Time since the backend process was last started or restarted."
              >
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  {status?.backend?.uptimeSeconds != null
                    ? formatUptime(status.backend.uptimeSeconds)
                    : 'Unknown'}
                </Typography>
              </FieldRow>
              <FieldRow
                label="Memory (RSS)"
                description="Resident Set Size: physical RAM the backend process is currently using."
              >
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  {status?.backend?.memoryMb?.rss != null
                    ? `${status.backend.memoryMb.rss} MB`
                    : 'Unknown'}
                </Typography>
              </FieldRow>
              <FieldRow
                label="Server time"
                description="Date/time on the backend machine — useful for spotting clock skew with devices."
              >
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  {status?.backend?.serverTime
                    ? new Date(status.backend.serverTime).toLocaleString()
                    : 'Unknown'}
                </Typography>
              </FieldRow>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default SystemStatus;
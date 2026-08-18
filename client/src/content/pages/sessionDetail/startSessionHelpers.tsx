import * as Icons from '@mui/icons-material';
import {  Typography, Stack, Box, Tooltip } from '@mui/material';
import { fetchDevices, getSampleRate, checkOccupied } from "./api";
import { useEffect, useState } from 'react';

export const checkStartingConditions = async (sessionId) => {
    const devices = await fetchDevices(sessionId);
    const sampleRates = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await getSampleRate(sessionId, device.deviceId);
        return {
          deviceId: device.deviceId,
          sampleRate,
        };
      })
    );

    const occupiedStatuses = await Promise.all(
      devices.map(async (device) => {
        const occupied = await checkOccupied(device.deviceId, sessionId);
        return {
          deviceId: device.deviceId,
          occupied: occupied.occupied,
        };
      })
    );

    const requirements = [
      {
        text: "Add at least one device to the session",
        done: devices.length > 0,
      },
      {
        text: "All devices reporting battery are at least 10%",
        done: devices.filter(device => device.batteryLevel != null && device.batteryLevel >= 0).every(device => device.batteryLevel >= 10),
      },
      {
        text: "All devices are connected to the gateway",
        done: devices.every(device =>
          device.connectStatus === 'connected'
        ),
      },
      {
        text: "Devices are not occupied",
        done: occupiedStatuses.every(status => status.occupied === false),
      },
      {
        text: "All devices have a sample rate assigned",
        done: sampleRates.every(device => device.sampleRate != null),
      },
      {
        text: "All sample rates are valid",
        done: sampleRates.every(device => device.sampleRate > 0),
      },
    ];

    if (devices.length === 0) {
      // If no devices, other requirements do not apply
      return { allPassed: false, requirements: [requirements[0]] };
    }

    const allPassed = requirements.every(req => req.done);

    return { allPassed, requirements }
    // setIsStartDisabled(!allPassed);
    // setStartRequirements(requirements);
};

export const isValidDate = (dateString: any) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Parse a timestamp that may be a string ("YYYY-MM-DD HH:MM:SS.mmm +00:00"),
// an epoch-milliseconds number (as sent by the gateway) or a Date object.
const parseTimestamp = (timestamp: any): Date | null => {
  if (timestamp === null || timestamp === undefined || timestamp === '') return null;
  if (timestamp instanceof Date) return isValidDate(timestamp) ? timestamp : null;
  if (typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isValidDate(date) ? date : null;
  }
  if (typeof timestamp !== 'string') return null;

  const iso = timestamp
    .replace(' ', 'T')
    .replace(/ ([+-]\d{2}:\d{2})$/, '$1')
    .replace(/ ([+-]\d{4})$/, (_, offset) => {
      return offset.slice(0, 3) + ':' + offset.slice(3);
    });

  const date = new Date(iso);
  return isValidDate(date) ? date : null;
};

export const calculateLastSeen = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return Infinity;

  const diff = Date.now() - date.getTime();
  return diff > 0 ? diff : Infinity;
};

export const formatLastSeenDevice = (device): string => {
  if (device.connectStatus === 'connected') {
    return 'online';
  }

  const timestamp = device.lastHeartbeat;
  return formatLastSeen(timestamp);
}


export const formatLastSeen = (timestamp): string => {
  const date = parseTimestamp(timestamp);
  if (!date) return 'Unknown';


  const diffInSeconds = Math.floor(calculateLastSeen(timestamp) / 1000);

  if (diffInSeconds === Infinity) return 'A long time ago';

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  else {
    return 'A long time ago';
  }

};

export const formatExactTime = (timestamp): string => {
  const date = parseTimestamp(timestamp);
  if (!date) return typeof timestamp === 'string' ? timestamp : 'Unknown';
  return date.toLocaleString();
};

export const renderBatteryCell = (params) => {
  const level = params.value;

  if (level === null || level === undefined || level < 0) {
    const connected = params.row?.connectStatus === 'connected' || params.row?.connected === 'connected';
    return (
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: connected ? 'success.main' : 'text.disabled' }}>
        <Icons.Cable fontSize="small" />
        <Typography variant="inherit" color={connected ? 'success.main' : 'text.disabled'}>
          {connected ? 'Cable' : 'Offline'}
        </Typography>
      </Stack>
    );
  }

  let IconComponent = Icons.BatteryAlert;
  let color = 'error.main';

  if (level > 90) {
    IconComponent = Icons.BatteryFull;
    color = 'success.main';
  } else if (level > 75) {
    IconComponent = Icons.Battery80;
    color = 'success.main';
  } else if (level > 50) {
    IconComponent = Icons.Battery60;
    color = 'warning.main';
  } else if (level > 30) {
    IconComponent = Icons.Battery50;
    color = 'warning.main';
  } else if (level > 15) {
    IconComponent = Icons.Battery30;
    color = 'error.main';
  } else {
    IconComponent = Icons.Battery20;
    color = 'error.main';
  }

  return (
    <Stack direction="row" alignItems="center" sx={{ color, fontWeight: 500 }}>
      <IconComponent fontSize="small" />
      <Typography variant="inherit" sx={{ ml: 0.5 }}>
        {level}%
      </Typography>
    </Stack>
  );
};

export const ConnectedCell = ({ deviceId, status, sessionId, lastSeen, lastHeartbeat }) => {
  const [occupied, setOccupied] = useState<boolean | null>(null);
  const [lastSeenSeconds, setLastSeenSeconds] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    checkOccupied(deviceId, sessionId)
      .then((res) => {
        if (mounted) setOccupied(res.occupied);
      })
      .catch(() => {
        if (mounted) setOccupied(false);
      });
    return () => { mounted = false; };
  }, [deviceId, sessionId]);

  useEffect(() => {
    if (status !== 'connected') return;
    const recount = () => {
      const base = lastHeartbeat ? new Date(lastHeartbeat).getTime() : Date.now();
      setLastSeenSeconds(Math.max(0, Math.floor((Date.now() - base) / 1000)));
    };
    recount();
    const interval = setInterval(recount, 1000);
    return () => clearInterval(interval);
  }, [lastHeartbeat, status]);

  const tooltip = occupied === true
    ? 'Device is measuring in another session'
    : `Last heartbeat: ${formatExactTime(lastHeartbeat)}`;

  let content;
  if (occupied === true) {
    content = (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Icons.Block sx={{ color: 'warning.main' }} />
        <Typography variant="body2" color="text.secondary">In use</Typography>
      </Stack>
    );
  } else if (status === 'connected') {
    content = (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Icons.Sensors sx={{ color: 'success.main' }} />
        <Typography variant="body2" color="success.main">online</Typography>
        <Typography variant="body2" color="text.secondary">(last: {lastSeenSeconds}s)</Typography>
      </Stack>
    );
  } else {
    content = (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Icons.SensorsOff sx={{ color: 'error.main' }} />
        <Typography variant="body2" color="text.secondary">last seen {lastSeen}</Typography>
      </Stack>
    );
  }

  return (
    <Tooltip title={tooltip} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        {content}
      </Box>
    </Tooltip>
  );
};

export const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};









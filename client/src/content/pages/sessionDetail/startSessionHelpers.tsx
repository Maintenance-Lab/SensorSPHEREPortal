import * as Icons from '@mui/icons-material';
import {  Typography, Stack, Box } from '@mui/material';



export const isValidDate = (dateString: any) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const calculateLastSeen = (device) => {
  const timestamp = device.lastHeartbeat;
  if (!timestamp || typeof timestamp !== 'string') return Infinity;

  if (device.connectStatus === 'connected') {
    return 0;
  }

  // Format the timestamp into a valid ISO string
  const iso = timestamp
    .replace(' ', 'T')
    .replace(/ ([+-]\d{2}:\d{2})$/, '$1')
    .replace(/ ([+-]\d{4})$/, (_, offset) => {
      return offset.slice(0, 3) + ':' + offset.slice(3);
    });

  const date = new Date(iso);

  // If it's an invalid date, return Infinity
    if (!isValidDate(date)) return Infinity;

  const now = new Date();
  if (now.getTime() - date.getTime()) {
    return now.getTime() - date.getTime();
  }
  return Infinity;
};

export const formatLastSeen = (device): string => {
  const timestamp = device.lastHeartbeat;
  if (!timestamp || typeof timestamp !== 'string') return 'Unknown';
  if (device.connectStatus === 'connected') {
    return 'Now';
  }
  const diffInSeconds = Math.floor(calculateLastSeen(device) / 1000);

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
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
};

export const renderBatteryCell = (params) => {
  const level = params.value;
  let IconComponent = Icons.BatteryAlert;
  let color = 'error.main';

  if (level === null || level === undefined) {
    IconComponent = Icons.BatteryAlert;
    color = 'gray';
  } else if (level > 90) {
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
        {level != null ? `${level}%` : '?'}
      </Typography>
    </Stack>
  );
};

export const renderConnectedCell = (params) => {
  const status = params.value;

  let Icon = null;
  if (status === 'connected') {
    Icon =  <Icons.Sensors sx={{ color: 'success.main' }} />;
  } else if (status === 'disconnected') {
    Icon = <Icons.SensorsOff sx={{ color: 'error.main' }} />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
      {Icon}
    </Box>
  );
};









import { Box, Stack, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useTheme } from '@mui/material/styles';

export type PulseVariant = 'ring' | 'scale' | 'fade' | 'glow' | 'double';

export const PULSE_VARIANTS: { id: PulseVariant; label: string }[] = [
  { id: 'ring', label: 'Ring' },
  { id: 'scale', label: 'Scale' },
  { id: 'fade', label: 'Fade' },
  { id: 'glow', label: 'Glow' },
  { id: 'double', label: 'Double Ring' },
];

const STATUS_CONFIG = {
  Idle: { color: (theme) => theme.palette.primary.main, duration: '3s' },
  Measuring: { color: (theme) => theme.palette.success.main, duration: '1.5s' },
};

const STATUS_LABELS = {
  Idle: 'Idle',
  Measuring: 'Recording',
};

const getDotAnimation = (variant: PulseVariant, color: string) => {
  switch (variant) {
    case 'scale':
      return keyframes`
        0% { transform: scale(1); }
        50% { transform: scale(1.45); }
        100% { transform: scale(1); }
      `;
    case 'fade':
      return keyframes`
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
      `;
    case 'glow':
      return keyframes`
        0% { box-shadow: 0 0 4px 0 ${color}00, 0 0 10px 2px ${color}00; }
        50% { box-shadow: 0 0 4px 1px ${color}44, 0 0 14px 4px ${color}99; }
        100% { box-shadow: 0 0 4px 0 ${color}00, 0 0 10px 2px ${color}00; }
      `;
    case 'double':
      return keyframes`
        0% { box-shadow: 0 0 0 0 ${color}66, 0 0 0 0 ${color}33; }
        70% { box-shadow: 0 0 0 5px ${color}00, 0 0 0 10px ${color}00; }
        100% { box-shadow: 0 0 0 0 ${color}00, 0 0 0 0 ${color}00; }
      `;
    case 'ring':
    default:
      return keyframes`
        0% { transform: scale(1); box-shadow: 0 0 0 0 ${color}66; }
        70% { transform: scale(1.2); box-shadow: 0 0 0 7px ${color}00; }
        100% { transform: scale(1); box-shadow: 0 0 0 0 ${color}00; }
      `;
  }
};

export const StatusTag = ({
  status,
  variant = 'double',
}: {
  status: string;
  variant?: PulseVariant;
}) => {
  const theme = useTheme();

  const config = STATUS_CONFIG[status];
  const animating = Boolean(config);
  const color = config ? config.color(theme) : theme.palette.text.disabled;
  const duration = config ? config.duration : '1s';
  const label = STATUS_LABELS[status] ?? status;

  const borderPulse = keyframes`
    0% { border-color: ${color}55; }
    50% { border-color: ${color}ff; }
    100% { border-color: ${color}55; }
  `;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        height: 32,
        px: 1.5,
        py: 0.5,
        borderRadius: '16px',
        bgcolor: animating ? `${color}14` : 'action.hover',
        border: '1px solid',
        borderColor: animating ? `${color}55` : 'divider',
        ...(animating && {
          animation: `${borderPulse} ${duration} ease-in-out infinite`,
        }),
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color,
          ...(animating && {
            animation: `${getDotAnimation(variant, color)} ${duration} ease-in-out infinite`,
          }),
        }}
      />
      <Typography
        variant="button"
        fontWeight="bold"
        color={animating ? color : 'text.secondary'}
      >
        {label}
      </Typography>
    </Stack>
  );
};
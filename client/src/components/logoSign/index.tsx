import { Box, Tooltip, TooltipProps, tooltipClasses, styled, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
    color: ${theme.palette.text.primary};
    display: flex;
    text-decoration: none;
    width: 53px;
    margin: 0 auto;
    font-weight: ${theme.typography.fontWeightBold};
`
);

const TooltipWrapper = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.colors?.alpha?.trueWhite?.[100] || '#fff',
    color: theme.palette.getContrastText(theme.colors?.alpha?.trueWhite?.[100] || '#fff'),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: 'bold',
    borderRadius: theme.shape.borderRadius,
    boxShadow:
      '0 .2rem .8rem rgba(7,9,25,.18), 0 .08rem .15rem rgba(7,9,25,.15)'
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors?.alpha?.trueWhite?.[100] || '#fff'
  }
}));

function Logo() {
  return (
    <TooltipWrapper title="SensorSphere Portal" arrow>
      <LogoWrapper to="/">
        <Box
          component="img"
          src="/icon.png"
          alt="SensorSphere Logo"
          sx={{
            width: 52,
            height: 52,
            borderRadius: '8px',
            objectFit: 'contain'
          }}
        />
      </LogoWrapper>
    </TooltipWrapper>
  );
}

export default Logo;


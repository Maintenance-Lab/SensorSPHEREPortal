import { Box, styled } from '@mui/material';
import { Link } from 'react-router-dom';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
    color: ${theme.palette.text.primary};
    padding: ${theme.spacing(0, 1, 0, 0)};
    display: flex;
    text-decoration: none;
    font-weight: ${theme.typography.fontWeightBold};
`
);

const LogoTextWrapper = styled(Box)(
  ({ theme }) => `
    padding-left: ${theme.spacing(1)};
`
);

const LogoText = styled(Box)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(15)};
    font-weight: ${theme.typography.fontWeightBold};
`
);

function Logo() {
  return (
    <LogoWrapper to="/overview">
      <Box
        component="img"
        src={'/icon.png'}
        sx={{
          width: 52,
          height: 52,
          borderRadius: '8px',
          objectFit: 'contain',
          marginTop: '4px',
        }}
      />
      <Box
        component="span"
        sx={{
          display: { xs: 'none', sm: 'inline-block' }
        }}
      >
        <LogoTextWrapper>
          <LogoText>SensorSPHERE</LogoText>
        </LogoTextWrapper>
      </Box>
    </LogoWrapper>
  );
}

export default Logo;

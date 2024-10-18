import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Box, Container, styled } from '@mui/material';

// const PageTitle = styled(Box)(
//   ({ theme }) => `
//         padding: ${theme.spacing(4)};
// `
// );

interface PageTitleWrapperProps {
  children?: ReactNode;
}

const PageTitleWrapper: FC<PageTitleWrapperProps> = ({ children }) => {
  return (
    <Box className="MuiPageTitle-wrapper" sx={{ paddingY: 3 }}>
      <Container maxWidth="lg">

          {children}

      </Container>
    </Box>
  );
};

PageTitleWrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export default PageTitleWrapper;

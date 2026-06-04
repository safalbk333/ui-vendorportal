import Container from '@mui/material/Container';
import Detail from 'src/sections/Delivery/GRN/details/Detail';
import React from 'react';

function page() {
  return (
    <div>
      <Container maxWidth="lg" sx={{ py: { xs: 1, md: 1 } }}>
        <Detail />
      </Container>
    </div>
  );
}

export default page;

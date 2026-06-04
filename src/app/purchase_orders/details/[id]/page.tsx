import Container from '@mui/material/Container';
import React from 'react';
import DetailedView from 'src/sections/PurchaseOrder/Details/DetailedView';

function page() {
  return (
    <div>
      <Container maxWidth="lg" sx={{ py: { xs: 1, md: 1 } }}>
        <DetailedView />
      </Container>
    </div>
  );
}

export default page;

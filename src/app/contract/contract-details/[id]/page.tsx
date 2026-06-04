import Container from '@mui/material/Container';
import React from 'react';
import ContractDetailPage from 'src/sections/Contracts/ContractDetailPage';

function page() {
  return (
    <div>
      <Container maxWidth="lg" sx={{ py: { xs: 1, md: 1 } }}>
        <ContractDetailPage />
      </Container>
    </div>
  );
}

export default page;

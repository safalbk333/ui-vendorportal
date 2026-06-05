'use client';

import { Box, Divider, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { useRouter, useSearchParams } from 'next/navigation';

import LineItemPricing from './Table';
import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import QuoteSummaryCard from './QuoteSummary';
import { fetchRFQById } from 'src/redux/RFQ/RfqSlice';

function Index() {
      const router = useRouter();
      const searchParams = useSearchParams();
  
    const rfqId = searchParams.get('id');
    const dispatch = useAppDispatch();
  useEffect(() => {
    if (rfqId) {
      dispatch(fetchRFQById(rfqId));
    }
  }, [dispatch, rfqId]);
  
  const { selectedRFQ, getByIdLoading } = useAppSelector(
    (state) => state.rfq
  );
  console.log(selectedRFQ,'selectedRFQ')
  return (
    <Box>
      <Box mb={2}>
        <PremiumBreadcrumbs
          title="Submit RFQ Quotation"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'RFQ Dashboard', href: '/quotations' },
            { label: 'View RFQ', href: '/quotations/view' },
            { label: 'Submit Quotation', href: '/quotations/submit_quotation' },
          ]}
        />
      </Box>
      <Box mb={2.5} sx={{ borderTop: '1px dashed #d1d5db' }} />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          width: '100%',
        }}
      >
        {/* Left Side - More Space */}
        <Paper
          elevation={0}
          sx={{
            flex: 3,
            borderRadius: 2,
          }}
        >
<LineItemPricing rfq={selectedRFQ} />        </Paper>

        {/* Right Side */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
          }}
        >
         {/* <QuoteSummaryCard rfq={selectedRFQ} /> */}
        </Paper>
      </Box>
    </Box>
  );
}

export default Index;

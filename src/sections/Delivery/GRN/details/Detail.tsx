'use client';

import AttachmentSection from './Attachment';
import Box from '@mui/material/Box';
import GrnCard from './GRNCard';
import MaterialLineItems from './MaterialTable';
import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import React, { useEffect } from 'react';
import WarehouseLocationCard from './Warehouse';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import {
  fetchGoodsReceiptById,
  clearSelectedGoodsReceipt,
} from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Button, Stack } from '@mui/material';

function Detail() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // Extract GRN ID from URL query params (?id=xxx)
  const grnId = searchParams.get('id');

  // Select goods receipt state from Redux store
  const { selectedGoodsReceipt, detailLoading, detailError } = useAppSelector(
    (state) => state.goodsReceipt
  );

  // Fetch goods receipt details on mount or when ID changes
  useEffect(() => {
    if (grnId) {
      dispatch(fetchGoodsReceiptById(grnId));
    }

    // Cleanup: clear selected goods receipt on unmount
    return () => {
      dispatch(clearSelectedGoodsReceipt());
    };
  }, [dispatch, grnId]);

  // ==================== LOADING STATE ====================
  if (detailLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  // ==================== ERROR STATE ====================
  if (detailError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography color="error" variant="body1">
          {detailError}
        </Typography>
      </Box>
    );
  }

  // ==================== MISSING ID STATE ====================
  if (!grnId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography color="text.secondary" variant="body1">
          No GRN ID provided in URL.
        </Typography>
      </Box>
    );
  }

  if (!selectedGoodsReceipt) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography color="text.secondary" variant="body1">
          GRN not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2.5} justifyContent="space-between">
        <Box mb={2}>
          <PremiumBreadcrumbs
            title="GRN Details"
            paths={[
              { label: 'Home', href: '/dashboard' },
              { label: 'GRN List', href: '/delivery/grn' },
              { label: 'GRN Details', href: '/delivery/grn/details' },
            ]}
          />
        </Box>

        <Button variant="outlined" size="small">
          Upload Invoice
        </Button>
      </Stack>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* Main Layout */}
      <Box
        display="flex"
        gap={2}
        alignItems="flex-start"
        flexDirection={{ xs: 'column', md: 'row' }}
      >
        {/* Left Section */}
        <Box flex={3} width="100%">
          <Box mb={2}>
            {/* Pass selectedGoodsReceipt data to GrnCard */}
            <GrnCard goodsReceipt={selectedGoodsReceipt} />
          </Box>
          {/* Pass goods_receipt_items to MaterialLineItems */}
          <MaterialLineItems goodsReceipt={selectedGoodsReceipt} />
        </Box>

        {/* Right Section */}
        <Box
          flex={1}
          width="100%"
          sx={{
            minHeight: 300,
          }}
        >
          {/* Pass selectedGoodsReceipt data to WarehouseLocationCard */}
          <WarehouseLocationCard goodsReceipt={selectedGoodsReceipt} />
          {/* Pass document attachments to AttachmentSection */}
          <AttachmentSection goodsReceipt={selectedGoodsReceipt} />
        </Box>
      </Box>
    </Box>
  );
}

export default Detail;
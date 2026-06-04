'use client';

import {
  Box,
  Chip,
  Stack,
  Button,
  TextField,
  Pagination,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  DataGrid,
  useGridApiContext,
  GridFooterContainer,
  gridPageCountSelector,
  gridPaginationModelSelector,
} from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { GridToolbar, useGridSelector } from '@mui/x-data-grid/internals';
import { alpha, useTheme } from '@mui/material/styles';

import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { fetchGoodsReceipts } from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';
import type { GoodsReceipt } from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';

function CustomFooter() {
  const apiRef = useGridApiContext();

  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <GridFooterContainer
      sx={{
        px: 2,
        py: 1,
        borderTop: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        background: 'transparent',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
        <Typography variant="caption" color="text.secondary">
          Showing page {paginationModel.page + 1} of {pageCount}
        </Typography>

        <Pagination
          size="small"
          color="primary"
          page={paginationModel.page + 1}
          count={pageCount}
          onChange={(_, value) => apiRef.current.setPage(value - 1)}
        />
      </Stack>
    </GridFooterContainer>
  );
}

function VendorGRNDetails() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const PRIMARY = theme.palette.primary.main;

  // Redux State
  const { data: goodsReceipts, loading, error } = useAppSelector(
    (state: any) => state.goodsReceipt
  );

  // Fetch Goods Receipts on Component Mount
  useEffect(() => {
    dispatch(fetchGoodsReceipts());
  }, [dispatch]);

  // Transform API data to DataGrid rows
  const rows = React.useMemo(
    () =>
      goodsReceipts.map((gr: GoodsReceipt) => {
        const totalReceived = gr.goods_receipt_items.reduce(
          (sum, item) => sum + item.int_quantity_received,
          0
        );
        const totalAccepted = gr.goods_receipt_items.reduce(
          (sum, item) => sum + (item.int_quantity_received - item.int_quantity_rejected),
          0
        );
        const totalRejected = gr.goods_receipt_items.reduce(
          (sum, item) => sum + item.int_quantity_rejected,
          0
        );

        return {
          id: gr.pk_chr_goods_receipt_id,
          grnNumber: gr.chr_grn_code,
          poNumber: gr.purchase_order.chr_po_number,
          // buyerName: 'N/A', // Vendor info not available in current API response
          asnNumber: gr.chr_delivery_note_no || 'N/A',
          receivedDate: new Date(gr.dt_received_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          // warehouse: 'N/A', // Warehouse info not available in current API
          receivedQty: totalReceived,
          acceptedQty: totalAccepted,
          rejectedQty: totalRejected,
          status: gr.chr_status === 'PENDING' ? 'Pending Inspection' : gr.chr_status,
        };
      }),
    [goodsReceipts]);

  const columns: GridColDef[] = [
    {
      field: 'grnNumber',
      headerName: 'GRN Number',
      flex: 1,
    },
    {
      field: 'poNumber',
      headerName: 'PO Number',
      flex: 1,
    },
    // {
    //   field: 'buyerName',
    //   headerName: 'Buyer',
    //   flex: 1.4,
    // },
    {
      field: 'asnNumber',
      headerName: 'ASN Number',
      flex: 1,
    },
    {
      field: 'receivedDate',
      headerName: 'Received Date',
      flex: 1,
    },
    // {
    //   field: 'warehouse',
    //   headerName: 'Warehouse',
    //   flex: 1.1,
    // },
    {
      field: 'receivedQty',
      headerName: 'Received Qty',
      flex: 0.9,
    },
    {
      field: 'acceptedQty',
      headerName: 'Accepted',
      flex: 0.8,
    },
    {
      field: 'rejectedQty',
      headerName: 'Rejected',
      flex: 0.8,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        let color: any = 'default';

        if (params.value === 'Pending Inspection') color = 'warning';
        if (params.value === 'Accepted') color = 'success';
        if (params.value === 'Partially Accepted') color = 'info';
        if (params.value === 'Rejected') color = 'error';

        return (
          <Chip
            label={params.value}
            color={color}
            size="small"
            variant="soft"
            sx={{
              fontWeight: 600,
              borderRadius: 1,
              fontSize: 11,
            }}
          />
        );
      },
    },
  ];

  return (
    <Box>
      {/* Breadcrumb */}

      <Box mb={2}>
        <PremiumBreadcrumbs
          title="GRN"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'GRN List', href: '/grn' },
          ]}
        />
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* Filters */}

      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField size="small" label="Search GRN / PO / ASN" fullWidth />

          <Autocomplete
            size="small"
            options={['Accepted', 'Partially Accepted', 'Pending Inspection', 'Rejected']}
            sx={{ minWidth: 220 }}
            renderInput={(params) => <TextField {...params} label="GRN Status" />}
          />

          <Autocomplete
            size="small"
            options={['Chennai WH', 'Mumbai Hub', 'Bangalore DC', 'Delhi WH']}
            sx={{ minWidth: 200 }}
            renderInput={(params) => <TextField {...params} label="Warehouse" />}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              sx={{
                background: PRIMARY,
                px: 3,
                color: 'white',
              }}
            >
              Apply
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.text.primary, 0.2),
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Table */}

      <Box mt={-1} sx={{ borderRadius: 1 }}>
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',

            '& .MuiDataGrid-root': {
              border: 'none',
              bgcolor: 'transparent',
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[5, 10]}
            disableColumnFilter
            disableRowSelectionOnClick
            disableColumnMenu
            disableColumnSelector
            onRowClick={(params) => {
              router.push(`/delivery/grn/details/details?id=${params.id}`);
            }}
            slots={{
              toolbar: GridToolbar,
              footer: CustomFooter,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  page: 0,
                  pageSize: 5,
                },
              },
            }}
            sx={{
              fontSize: 13,

              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'transparent',
                minHeight: 42,
                maxHeight: 42,
              },

              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'transparent !important',
              },

              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: 13,
                fontWeight: 600,
                color: 'primary.main',
              },

              '& .MuiDataGrid-cell': {
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
              },

              '& .MuiDataGrid-row': {
                minHeight: 42,
                maxHeight: 42,
              },
            }}
          />
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}
    </Box>
  );
}

export default VendorGRNDetails;
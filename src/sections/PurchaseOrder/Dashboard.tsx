'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Chip,
  Stack,
  Button,
  TextField,
  Typography,
  Pagination,
  Autocomplete,
} from '@mui/material';

import type {
  GridColDef,
  GridRenderCellParams} from '@mui/x-data-grid';
import {
  DataGrid,
  useGridApiContext,
  GridFooterContainer,
  gridPageCountSelector,
  gridPaginationModelSelector,
} from '@mui/x-data-grid';

import { alpha, useTheme } from '@mui/material/styles';
import { GridToolbar, useGridSelector } from '@mui/x-data-grid/internals';
import { useRouter } from 'next/navigation';

import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';

// Redux Imports
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { fetchPurchaseOrders } from 'src/redux/PurchaseOrder/PurchaseOrderSlice';

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

// Helper function to determine status
const getStatusLabel = (docStatus: string, quotationStatus?: string): string => {
  if (docStatus === 'D' || quotationStatus === 'DRAFT') return 'Draft';
  if (docStatus === 'A') return 'Acknowledged';
  if (docStatus === 'P') return 'Pending';
  if (docStatus === 'C') return 'Closed';
  if (docStatus === 'R') return 'Rejected';
  return 'Open';
};

function PurchaseOrderDashboard() {
  const theme = useTheme();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { data: purchaseOrders, loading, error } = useAppSelector(
    (state) => state.purchaseOrder
  );

  const PRIMARY = theme.palette.primary.main;

  // Fetch purchase orders on component mount
  useEffect(() => {
    dispatch(fetchPurchaseOrders());
  }, [dispatch]);

  const columns: GridColDef[] = [
    {
      field: 'poNo',
      headerName: 'PO No',
      flex: 1,
    },

    {
      field: 'title',
      headerName: 'PO Title',
      flex: 1.8,
    },

    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
    },

    {
      field: 'poDate',
      headerName: 'PO Date',
      flex: 1,
    },

    {
      field: 'deliveryDate',
      headerName: 'Delivery Date',
      flex: 1,
    },

    {
      field: 'buyer',
      headerName: 'Buyer',
      flex: 1,
    },

    {
      field: 'amount',
      headerName: 'PO Amount',
      flex: 1,
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        let color = 'default';

        if (params.value === 'Open') color = 'info';
        if (params.value === 'Acknowledged') color = 'success';
        if (params.value === 'Pending') color = 'warning';
        if (params.value === 'Closed') color = 'default';
        if (params.value === 'Rejected') color = 'error';
        if (params.value === 'Draft') color = 'default';

        return (
          <Chip
            label={params.value}
            sx={{
              fontSize: 11,
              height: 24,
              fontWeight: 600,
            }}
            color={color as any}
            size="small"
          />
        );
      },
    },
  ];

  // Transform API data to match DataGrid rows
  const rows = purchaseOrders.map((po) => ({
    id: po.pk_chr_purchase_order_id,
    poNo: po.chr_po_number,
    title: po.request?.chr_title || 'N/A',
    category: 'General', // Category not available in current API response
    poDate: new Date(po.dt_issued_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    deliveryDate: new Date(po.dt_expected_delivery).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    buyer: po.vendor?.chr_vendor_name || 'N/A',
    amount: `${po.chr_currency} ${po.flt_total_value ? po.flt_total_value.toLocaleString() : '0'}`,
    status: getStatusLabel(po.chr_document_status, po.quotation?.chr_status),
  }));

  return (
    <Box>
      {/* Breadcrumbs */}

      <Box mb={2}>
        <PremiumBreadcrumbs
          title="Purchase Orders"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Purchase Orders', href: '/purchase_orders' },
          ]}
        />
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* Filters */}

      <Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            size="small"
            label="Search PO"
            placeholder="Search by PO number or title"
            fullWidth
          />

          <Autocomplete
            size="small"
            options={['Open', 'Acknowledged', 'Pending', 'Closed', 'Rejected', 'Draft']}
            sx={{ minWidth: 200 }}
            renderInput={(params) => <TextField {...params} label="Status" />}
          />

          <Autocomplete
            size="small"
            options={['IT Equipment', 'Furniture', 'Logistics', 'Safety', 'General']}
            sx={{ minWidth: 200 }}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              sx={{
                background: PRIMARY,
                px: 2.5,
                minWidth: 90,
              }}
            >
              Apply
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.text.primary, 0.2),
                minWidth: 90,
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Table */}

      <Box sx={{ borderRadius: 2, mt: -1 }}>
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
            onRowClick={(params) => {
              router.push(`/purchase_orders/details/details?id=${params.row.id}`);
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
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              },

              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'transparent !important',
              },

              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: 13,
                fontWeight: 700,
                color: 'primary.main',
              },

              '& .MuiDataGrid-cell': {
                fontSize: 13,
                alignItems: 'center',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              },

              '& .MuiDataGrid-row': {
                minHeight: 44,
                maxHeight: 44,
                cursor: 'pointer',
              },

              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
              },

              '& .MuiDataGrid-toolbarContainer': {
                px: 1,
                py: 0.5,
              },
            }}
          />
        </Box>
      </Box>

      {/* {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          Error: {error}
        </Typography>
      )} */}
    </Box>
  );
}

export default PurchaseOrderDashboard;
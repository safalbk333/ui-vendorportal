'use client';

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridFooterContainer,
  gridPageCountSelector,
  gridPaginationModelSelector,
  useGridApiContext,
} from '@mui/x-data-grid';
import type {
  GridColDef,
  GridRenderCellParams
} from '@mui/x-data-grid';
import { GridToolbar, useGridSelector } from '@mui/x-data-grid/internals';
import React, { useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';

import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import { fetchRFQs } from 'src/redux/RFQ/RfqSlice';
import { useRouter } from 'next/navigation';

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

function RFQDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data, loading, error } = useAppSelector(
    (state) => state.rfq
  );

  useEffect(() => {
    dispatch(fetchRFQs());
  }, [dispatch]);
  console.log(data,'data')

  const PRIMARY = theme.palette.primary.main;

  const columns: GridColDef[] = [
    {
      field: 'rfqNo',
      headerName: 'RFQ No',
      flex: 1,
    },

    {
      field: 'title',
      headerName: 'RFQ Title',
      flex: 1.6,
    },

    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
    },

    {
      field: 'issueDate',
      headerName: 'Issue Date',
      flex: 1,
    },

    {
      field: 'dueDate',
      headerName: 'Due Date',
      flex: 1,
    },

    {
      field: 'buyer',
      headerName: 'Buyer',
      flex: 1,
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        let color = 'default';

        if (params.value === 'Open') color = 'success';
        if (params.value === 'Submitted') color = 'info';
        if (params.value === 'Under Review') color = 'warning';
        if (params.value === 'Rejected') color = 'error';

        return (
          <Chip
            label={params.value}
            sx={{ fontSize: 12 }}
            color={color as any}
            size="small"
            variant="soft"
          />
        );
      },
    },
  ];

const rows =
  data?.map((rfq) => ({
    id: rfq.pk_chr_rfq_id,
    rfqNo: rfq.chr_rfq_code,
    title: rfq.chr_rfq_title,
    category:
      rfq.rfq_item_mappings?.[0]?.item?.chr_item_name || '-',
    issueDate: new Date(rfq.dt_issue_date).toLocaleDateString('en-GB'),
    dueDate: rfq.dt_due_date
      ? new Date(rfq.dt_due_date).toLocaleDateString('en-GB')
      : '-',
    buyer: rfq.request?.chr_title || '-',
    status: rfq.chr_status,
    quotations: rfq.quotations?.length || 0,
  })) || [];

  return (
    <Box>
      {/* Breadcrumbs */}

      <Box mb={2}>
        <PremiumBreadcrumbs
          title="Request for Quotations"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'RFQ Dashboard', href: '/rfq' },
          ]}
        />
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* Filters */}

      <Box mb={-1}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            size="small"
            label="Search RFQ"
            placeholder="Search by RFQ number or title"
            fullWidth
          />

          <Autocomplete
            size="small"
            options={['Open', 'Submitted', 'Under Review', 'Rejected']}
            sx={{ minWidth: 220 }}
            renderInput={(params) => <TextField {...params} label="Status" />}
          />

          <Autocomplete
            size="small"
            options={['IT Equipment', 'Furniture', 'Logistics', 'Safety']}
            sx={{ minWidth: 220 }}
            renderInput={(params) => <TextField {...params} label="Category" />}
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

      <Box sx={{ borderRadius: 1 }}>
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
onRowClick={(params) => {
  router.push(`/quotations/view?id=${params.row.id}`);
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
                minHeight: 40,
                maxHeight: 40,
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
                fontSize: 13,
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
    </Box>
  );
}

export default RFQDashboard;

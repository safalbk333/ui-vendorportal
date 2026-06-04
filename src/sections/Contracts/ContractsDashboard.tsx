'use client';

import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  TextField,
  IconButton,
  Pagination,
  Typography,
  CardContent,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Bar,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  PieChart,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  DataGrid,
  useGridApiContext,
  GridFooterContainer,
  gridPageCountSelector,
  gridPaginationModelSelector,
} from '@mui/x-data-grid';
import { GridToolbar, useGridSelector } from '@mui/x-data-grid/internals';
import React, { useState, useEffect, useCallback } from 'react';
import { alpha, useTheme } from '@mui/material/styles';

import AssignmentIcon from '@mui/icons-material/Assignment';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { fetchContracts, clearContracts } from 'src/redux/ContractManagement/ContractManagementSlice';
import type { Contract } from 'src/redux/ContractManagement/ContractManagementSlice';
import type { RootState } from 'src/redux/store';

type ContractStatus = 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Terminated';

interface ContractRow {
  id: number;
  contractId: string;
  contractTitle: string;
  vendor: string;
  category: string;
  value: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: ContractStatus;
  createdBy: string;
  daysToExpiry: number;
}
const mapContractToRow = (contract: Contract | null | undefined, index: number): ContractRow => {

  if (!contract) {
    return {
      id: index + 1,
      contractId: 'N/A',
      contractTitle: 'Invalid Contract',
      vendor: 'Unknown Vendor',
      category: 'N/A',
      value: '₹0',
      startDate: '—',
      endDate: '—',
      renewalDate: '—',
      status: 'Draft',
      createdBy: 'System',
      daysToExpiry: 0,
    };
  }
  
  const today = new Date();

  const endDate = contract.dt_end_date
    ? new Date(contract.dt_end_date)
    : null;

  const startDate = contract.dt_start_date
    ? new Date(contract.dt_start_date)
    : null;

  const daysToExpiry = endDate
    ? Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
    )
    : 0;

  return {
    id: index + 1,

    contractId: contract.pk_chr_contract_id || 'N/A',

    contractTitle: contract.chr_title || 'Untitled Contract',

    vendor: contract.fk_chr_vendor_id || 'Unknown Vendor',

    category: 'N/A',

    value: `₹${(contract.flt_value || 0).toLocaleString('en-IN')}`,

    startDate: startDate
      ? startDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : '—',

    endDate: endDate
      ? endDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : '—',

    renewalDate: '—',

    status: (contract.chr_status as ContractStatus) || 'Draft',

    createdBy: contract.fk_chr_created_id || 'System',

    daysToExpiry,
  };
};

const EXPIRY_WARNING_DAYS = 30;

const STATUS_COLOR: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  Draft: 'default',
  'Under Review': 'warning',
  Approved: 'info',
  Active: 'success',
  Expired: 'error',
  Terminated: 'error',
};

const STATUSES: ContractStatus[] = [
  'Draft',
  'Under Review',
  'Approved',
  'Active',
  'Expired',
  'Terminated',
];

// ─────────────────────────────────────────────────────────────────────────────
// CHART HELPERS (Computed from real data)
// ─────────────────────────────────────────────────────────────────────────────

function getContractsByStatusData(rows: ContractRow[]) {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function getContractsByVendorData(rows: ContractRow[]) {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    counts[r.vendor] = (counts[r.vendor] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([vendor, contracts]) => ({ vendor: vendor.length > 12 ? vendor.slice(0, 12) + '...' : vendor, contracts }))
    .sort((a, b) => b.contracts - a.contracts)
    .slice(0, 5);
}

function getMonthlyRenewalsData(rows: ContractRow[]) {
  // Placeholder — enhance with real renewal logic when available
  return [
    { month: 'Jan', renewals: 1 },
    { month: 'Feb', renewals: 3 },
    { month: 'Mar', renewals: 2 },
    { month: 'Apr', renewals: 4 },
    { month: 'May', renewals: 2 },
    { month: 'Jun', renewals: 5 },
  ];
}

const PIE_COLORS = ['#22c55e', '#f59e0b', '#94a3b8', '#3b82f6', '#ef4444', '#dc2626'];

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM FOOTER
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgcolor: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, color, bgcolor, loading }: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 160,
        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 1.5,
              bgcolor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box>
            {loading ? (
              <Skeleton variant="text" width={40} height={32} />
            ) : (
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                {value}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARTS (Now using real data)
// ─────────────────────────────────────────────────────────────────────────────
function ContractsByStatusChart({ rows }: { rows: ContractRow[] }) {
  const data = getContractsByStatusData(rows);

  return (
    <Card elevation={0} sx={{ flex: 1, minWidth: 220, border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`, borderRadius: 2 }}>
      <CardContent sx={{ padding: 2 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block">
          Contracts by Status
        </Typography>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={46}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value, name) => [value, name]} contentStyle={{ fontSize: 11, padding: '4px 8px' }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ContractsByVendorChart({ rows }: { rows: ContractRow[] }) {
  const data = getContractsByVendorData(rows);

  return (
    <Card elevation={0} sx={{ flex: 1, minWidth: 220, border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`, borderRadius: 2 }}>
      <CardContent sx={{ padding: 2 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block">
          Contracts by Vendor
        </Typography>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="vendor" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={52} />
            <RechartsTooltip formatter={(value) => [value, 'Contracts']} contentStyle={{ fontSize: 11, padding: '4px 8px' }} />
            <Bar dataKey="contracts" fill="#3b82f6" radius={[0, 3, 3, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MonthlyRenewalsChart() {
  const data = getMonthlyRenewalsData([]); // TODO: enhance with real data

  return (
    <Card elevation={0} sx={{ flex: 1, minWidth: 220, border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`, borderRadius: 2 }}>
      <CardContent sx={{ padding: 2 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" mb={1} display="block">
          Monthly Renewals
        </Typography>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <RechartsTooltip formatter={(value) => [value, 'Renewals']} contentStyle={{ fontSize: 11, padding: '4px 8px' }} />
            <Line type="monotone" dataKey="renewals" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPIRY BANNER
// ─────────────────────────────────────────────────────────────────────────────
interface ExpiryBannerProps {
  expiringSoon: ContractRow[];
  onDismiss: () => void;
}

function ExpiryBanner({ expiringSoon, onDismiss }: ExpiryBannerProps) {
  if (expiringSoon.length === 0) return null;

  return (
    <Alert
      severity="warning"
      icon={<WarningAmberIcon fontSize="small" />}
      action={
        <IconButton size="small" onClick={onDismiss}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
      sx={{ mb: 2, fontSize: 12 }}
    >
      <strong>
        {expiringSoon.length} contract{expiringSoon.length > 1 ? 's' : ''}
      </strong>{' '}
      expiring within {EXPIRY_WARNING_DAYS} days:&nbsp;
      {expiringSoon.map((c) => (
        <span key={c.id}>
          <strong>{c.contractId}</strong> ({c.vendor} — {c.daysToExpiry}d left)&nbsp;
        </span>
      ))}
      — initiate renewal to avoid service disruption.
    </Alert>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
interface RowActionsProps {
  row: ContractRow;
  onView: (row: ContractRow) => void;
  onEdit: (row: ContractRow) => void;
  onRenew: (row: ContractRow) => void;
  onTerminate: (row: ContractRow) => void;
  onDownload: (row: ContractRow) => void;
}

function RowActions({ row, onView, onEdit, onRenew, onTerminate, onDownload }: RowActionsProps) {
  const canEdit = row.status === 'Draft' || row.status === 'Under Review';
  const canRenew = row.status === 'Active' || row.status === 'Expired';
  const canTerminate = row.status === 'Active' || row.status === 'Approved';
  const router = useRouter();

  return (
    <Stack direction="row" spacing={0} alignItems="center">
      <Tooltip title="View">
        <IconButton size="small" onClick={() => onView(row)}>
          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title={canEdit ? 'Edit' : 'Cannot edit at this stage'}>
        <span>
          <IconButton size="small" disabled={!canEdit} onClick={() => onEdit(row)}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={canRenew ? 'Renew' : 'Renewal not applicable'}>
        <span>
          <IconButton size="small" disabled={!canRenew} onClick={() => onRenew(row)}>
            <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={canTerminate ? 'Terminate' : 'Cannot terminate at this stage'}>
        <span>
          <IconButton
            size="small"
            disabled={!canTerminate}
            onClick={() => onTerminate(row)}
            sx={{ color: canTerminate ? 'error.main' : undefined }}
          >
            <CancelOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Download">
        <IconButton size="small" onClick={() => onDownload(row)}>
          <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ContractDashboard() {
  const theme = useTheme();
  const PRIMARY = theme.palette.primary.main;
  const router = useRouter();

  const dispatch = useAppDispatch();

  // Redux state
  const { data: contracts, loading, error } = useAppSelector((state: RootState) => state.contractManagement);

  const [rows, setRows] = useState<ContractRow[]>([]);

  // ── filter states ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterVendor, setFilterVendor] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContractStatus | null>(null);
  const [filterStartFrom, setFilterStartFrom] = useState('');
  const [filterEndTo, setFilterEndTo] = useState('');

  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    vendor: null as string | null,
    status: null as ContractStatus | null,
    startFrom: '',
    endTo: '',
  });

  // ── Data Mapping & Loading ─────────────────────────────────────────────────
  useEffect(() => {
    if (contracts.length > 0) {
      const mapped = contracts
        .filter((contract): contract is Contract => contract != null)
        .map((contract, idx) => mapContractToRow(contract, idx));
      setRows(mapped);
    } else {
      setRows([]);
    }
  }, [contracts]);

  const loadContracts = useCallback(() => {
    dispatch(fetchContracts());
  }, [dispatch]);

  useEffect(() => {
    loadContracts();
    return () => {
      dispatch(clearContracts());
    };
  }, [loadContracts, dispatch]);

  // ── Derived Stats ─────────────────────────────────────────────────────────
  const totalContracts = rows.length;
  const totalActive = rows.filter((r) => r.status === 'Active').length;
  const totalExpiringSoon = rows.filter(
    (r) => r.daysToExpiry >= 0 && r.daysToExpiry <= EXPIRY_WARNING_DAYS
  ).length;
  const totalPendingApproval = rows.filter(
    (r) => r.status === 'Under Review' || r.status === 'Draft'
  ).length;
  const totalTerminated = rows.filter((r) => r.status === 'Terminated').length;

  const expiringSoon = rows.filter(
    (r) => r.daysToExpiry >= 0 && r.daysToExpiry <= EXPIRY_WARNING_DAYS
  );

  // ── Filtered Rows ─────────────────────────────────────────────────────────
  const filteredRows = rows.filter((r) => {
    const q = appliedFilters.search.toLowerCase();
    const matchSearch =
      !q ||
      r.contractId.toLowerCase().includes(q) ||
      r.contractTitle.toLowerCase().includes(q) ||
      r.vendor.toLowerCase().includes(q);

    const matchVendor = !appliedFilters.vendor || r.vendor === appliedFilters.vendor;
    const matchStatus = !appliedFilters.status || r.status === appliedFilters.status;

    const matchStart = !appliedFilters.startFrom || r.startDate >= appliedFilters.startFrom;
    const matchEnd = !appliedFilters.endTo || r.endDate <= appliedFilters.endTo;

    return matchSearch && matchVendor && matchStatus && matchStart && matchEnd;
  });

  const vendorOptions = Array.from(new Set(rows.map((r) => r.vendor))).sort();

  // ── Filter Handlers ───────────────────────────────────────────────────────
  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      vendor: filterVendor,
      status: filterStatus,
      startFrom: filterStartFrom,
      endTo: filterEndTo,
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterVendor(null);
    setFilterStatus(null);
    setFilterStartFrom('');
    setFilterEndTo('');
    setAppliedFilters({ search: '', vendor: null, status: null, startFrom: '', endTo: '' });
  };

  // ── Row Action Handlers ───────────────────────────────────────────────────
  const handleView = (row: ContractRow) => {
    router.push(paths.contract.details(row.contractId));
  };

  const handleEdit = (row: ContractRow) => {
    router.push(paths.contract.edit);
  };

  const handleRenew = (row: ContractRow) => {
    router.push(paths.contract.renewal);
  };

  const handleTerminate = (row: ContractRow) => {
    router.push(paths.contract.termination);
  };

  const handleDownload = (row: ContractRow) => {
    console.info('Download contract:', row.contractId);
    // TODO: Implement actual download logic
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: GridColDef[] = [
    { field: 'contractId', headerName: 'Contract ID', flex: 0.9 },
    { field: 'vendor', headerName: 'Vendor Name', flex: 1.3 },
    { field: 'contractTitle', headerName: 'Contract Title', flex: 1.6 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.9,
      renderCell: (params: GridRenderCellParams<ContractRow, ContractStatus>) => (
        <Chip
          label={params.value}
          size="small"
          color={STATUS_COLOR[params.value!]}
          variant="outlined"
          sx={{ fontSize: 11, height: 22, fontWeight: 600 }}
        />
      ),
    },
    { field: 'startDate', headerName: 'Start Date', flex: 0.9 },
    { field: 'endDate', headerName: 'End Date', flex: 0.9 },
    { field: 'value', headerName: 'Contract Value', flex: 0.9 },
    { field: 'createdBy', headerName: 'Created By', flex: 1 },
    {
      field: 'daysToExpiry',
      headerName: 'Expiry',
      flex: 0.75,
      renderCell: (params: GridRenderCellParams<ContractRow, number>) => {
        const days = params.value ?? 0;
        if (days < 0) return <Typography variant="caption" color="error.main" fontWeight={600}>Expired</Typography>;
        if (days <= EXPIRY_WARNING_DAYS)
          return <Typography variant="caption" color="warning.main" fontWeight={600}>{days}d left</Typography>;
        return <Typography variant="caption" color="text.secondary">{days}d</Typography>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.2,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ContractRow>) => (
        <RowActions
          row={params.row}
          onView={handleView}
          onEdit={handleEdit}
          onRenew={handleRenew}
          onTerminate={handleTerminate}
          onDownload={handleDownload}
        />
      ),
    },
  ];

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
        </Stack>
        <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} flexWrap="wrap" useFlexGap>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1, minWidth: 150 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="error" mb={2}>
          Failed to load contracts: {error}
        </Typography>
        <Button variant="outlined" onClick={loadContracts}>
          Retry
        </Button>
      </Box>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────
  if (!loading && rows.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">No contracts found.</Typography>
        <Button
          onClick={() => router.push(paths.contract.add)}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          + Create New Contract
        </Button>
      </Box>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      <Box mb={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              Home &rsaquo; Contract Dashboard
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              Contract Management
            </Typography>
          </Box>

          <Button onClick={() => router.push(paths.contract.add)} variant="outlined" size="small">
            + New Contract
          </Button>
        </Stack>
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* Expiry Banner */}
      {!bannerDismissed && <ExpiryBanner expiringSoon={expiringSoon} onDismiss={() => setBannerDismissed(true)} />}

      {/* Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} flexWrap="wrap" useFlexGap>
        <StatCard label="Total Contracts" value={totalContracts} icon={<AssignmentIcon fontSize="small" />} color={PRIMARY} bgcolor={alpha(PRIMARY, 0.1)} />
        <StatCard label="Active" value={totalActive} icon={<CheckCircleOutlineIcon fontSize="small" />} color={theme.palette.success.main} bgcolor={alpha(theme.palette.success.main, 0.1)} />
        <StatCard label="Expiring Soon" value={totalExpiringSoon} icon={<WarningAmberIcon fontSize="small" />} color={theme.palette.warning.main} bgcolor={alpha(theme.palette.warning.main, 0.1)} />
        <StatCard label="Pending Approval" value={totalPendingApproval} icon={<HourglassEmptyIcon fontSize="small" />} color={theme.palette.info.main} bgcolor={alpha(theme.palette.info.main, 0.1)} />
        <StatCard label="Terminated" value={totalTerminated} icon={<CancelOutlinedIcon fontSize="small" />} color={theme.palette.error.main} bgcolor={alpha(theme.palette.error.main, 0.1)} />
      </Stack>

      {/* Charts */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} flexWrap="wrap" useFlexGap>
        <ContractsByStatusChart rows={rows} />
        <ContractsByVendorChart rows={rows} />
        <MonthlyRenewalsChart />
      </Stack>

      <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

      {/* Filters */}
      <Box mb={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap="wrap" useFlexGap>
          <TextField size="small" label="Search by ID / Title / Vendor" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 250 }} />

          <Autocomplete size="small" options={vendorOptions} value={filterVendor} onChange={(_, v) => setFilterVendor(v)} sx={{ minWidth: 210 }} renderInput={(params) => <TextField {...params} label="Vendor" />} />

          <Autocomplete size="small" options={STATUSES} value={filterStatus} onChange={(_, v) => setFilterStatus(v as ContractStatus | null)} sx={{ minWidth: 180 }} renderInput={(params) => <TextField {...params} label="Status" />} />

          <TextField size="small" label="Start From" type="date" value={filterStartFrom} onChange={(e) => setFilterStartFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />

          <TextField size="small" label="End To" type="date" value={filterEndTo} onChange={(e) => setFilterEndTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />

          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button variant="contained" sx={{ background: PRIMARY, px: 3, color: 'white' }} onClick={handleApplyFilters}>
              Apply
            </Button>
            <Button variant="outlined" sx={{ borderColor: alpha(theme.palette.text.primary, 0.2) }} onClick={handleResetFilters}>
              Reset
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Data Grid */}
      <Box sx={{ borderRadius: 1 }}>
        <Box sx={{ borderRadius: 2, overflow: 'hidden', '& .MuiDataGrid-root': { border: 'none', bgcolor: 'transparent' } }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            autoHeight
            pageSizeOptions={[5, 10]}
            disableColumnFilter
            disableRowSelectionOnClick
            disableColumnMenu
            disableColumnSelector
            loading={loading}
            slots={{
              toolbar: GridToolbar,
              footer: CustomFooter,
              loadingOverlay: () => <Box display="flex" alignItems="center" justifyContent="center" height="100%"><CircularProgress size={28} /></Box>,
              noRowsOverlay: () => (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%" flexDirection="column" gap={1}>
                  <AssignmentIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary">No contracts match the applied filters.</Typography>
                </Box>
              ),
            }}
            slotProps={{
              toolbar: { showQuickFilter: false, printOptions: { disableToolbarButton: true }, csvOptions: { disableToolbarButton: true } },
            }}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
            sx={{
              fontSize: 13,
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'transparent', minHeight: 36, maxHeight: 36 },
              '& .MuiDataGrid-columnHeaderTitle': { fontSize: 13, fontWeight: 600, color: 'primary.main' },
              '& .MuiDataGrid-cell': { fontSize: 12 },
              '& .MuiDataGrid-row': { minHeight: 40, maxHeight: 40 },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ContractDashboard;
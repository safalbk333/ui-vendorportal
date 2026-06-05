'use client';

import {
  Box,
  Tab,
  Card,
  Chip,
  Grid,
  Tabs,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';
import React, { useEffect, useCallback } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { useSearchParams } from 'next/navigation';

import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Redux imports
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { fetchContractById, clearCurrentContract, Contract } from 'src/redux/ContractManagement/ContractManagementSlice';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ContractStatus = 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Terminated';
type DocumentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired';
type ApprovalAction = 'Approved' | 'Rejected' | 'Submitted' | 'Returned';
type AuditAction =
  | 'Created'
  | 'Updated'
  | 'Renewed'
  | 'Terminated'
  | 'Uploaded'
  | 'Approved'
  | 'Rejected';

interface ContractDocument {
  id: number;
  fileName: string;
  fileType: 'PDF' | 'DOCX';
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  status: DocumentStatus;
  fileSizeKb: number;
}

interface ApprovalHistoryEntry {
  id: number;
  action: ApprovalAction;
  actor: string;
  role: string;
  date: string;
  comments: string;
}

interface AmendmentHistoryEntry {
  id: number;
  amendmentNo: string;
  date: string;
  reason: string;
  updatedFields: string[];
  amendedBy: string;
}

interface AuditEntry {
  id: number;
  action: AuditAction;
  performedBy: string;
  date: string;
  description: string;
}

interface ContractDetail {
  // Basic Information — spec §4-C §1
  contractId: string;
  contractTitle: string;
  vendor: string;
  contractType: string;
  description: string;
  status: ContractStatus;
  category: string;
  createdBy: string;
  // Dates & Financial Info — spec §4-C §2
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractValue: string;
  currency: string;
  daysToExpiry: number;
  // Sections — spec §4-C §3-§6
  documents: ContractDocument[];
  approvalHistory: ApprovalHistoryEntry[];
  amendmentHistory: AmendmentHistoryEntry[];
  auditTrail: AuditEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTION: Transform API Contract to ContractDetail
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transforms the API contract data to the ContractDetail format expected by the UI
 * @param apiContract - The contract data from the API
 * @returns Transformed contract detail for UI consumption
 */
function transformApiContractToDetail(apiContract: Contract): ContractDetail {
  // Format dates to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate days to expiry
  const calculateDaysToExpiry = (endDate: string): number => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Map API status to UI status
  const mapStatus = (status: string): ContractStatus => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'under review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'terminated':
        return 'Terminated';
      default:
        return 'Draft';
    }
  };

  // Map document status
  const mapDocStatus = (docStatus: string): DocumentStatus => {
    switch (docStatus?.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'EXPIRED':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  // Transform documents (if any - will need to be populated from API)
  const documents: ContractDocument[] = []; // API currently doesn't return documents, this would come from a separate endpoint

  // Transform approval history (if any - to be populated from API)
  const approvalHistory: ApprovalHistoryEntry[] = []; // To be populated from API if available

  // Transform amendment history (if any - to be populated from API)
  const amendmentHistory: AmendmentHistoryEntry[] = []; // To be populated from API if available

  // Transform audit trail (if any - to be populated from API)
  const auditTrail: AuditEntry[] = []; // To be populated from API if available

  return {
    contractId: apiContract.chr_contract_code || apiContract.pk_chr_contract_id.slice(0, 8),
    contractTitle: apiContract.chr_title,
    vendor: apiContract.fk_chr_vendor_id, // This would need to be replaced with vendor name from a vendor lookup
    contractType: 'Service Agreement', // Default - would come from API
    description: apiContract.txt_description,
    status: mapStatus(apiContract.chr_status),
    category: 'General', // Default - would come from API
    createdBy: apiContract.fk_chr_created_id || 'System', // Would need user details from another API
    startDate: formatDate(apiContract.dt_start_date),
    endDate: formatDate(apiContract.dt_end_date),
    renewalDate: formatDate(apiContract.dt_end_date), // Assuming renewal date is same as end date for now
    contractValue: formatCurrency(apiContract.flt_value),
    currency: 'INR',
    daysToExpiry: calculateDaysToExpiry(apiContract.dt_end_date),
    documents,
    approvalHistory,
    amendmentHistory,
    auditTrail,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const EXPIRY_WARNING_DAYS = 30;

const STATUS_COLOR: Record<ContractStatus, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  Draft: 'default',
  'Under Review': 'warning',
  Approved: 'info',
  Active: 'success',
  Expired: 'error',
  Terminated: 'error',
};

const DOC_STATUS_COLOR: Record<DocumentStatus, 'default' | 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Expired: 'default',
};

const APPROVAL_ACTION_COLOR: Record<
  ApprovalAction,
  'default' | 'warning' | 'info' | 'success' | 'error'
> = {
  Submitted: 'info',
  Approved: 'success',
  Rejected: 'error',
  Returned: 'warning',
};

const AUDIT_ACTION_COLOR: Record<AuditAction, string> = {
  Created: '#3b82f6',
  Updated: '#f59e0b',
  Renewed: '#22c55e',
  Terminated: '#ef4444',
  Uploaded: '#8b5cf6',
  Approved: '#10b981',
  Rejected: '#ef4444',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Section wrapper — consistent card style across all detail sections ────────
interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function SectionCard({ title, icon, children, action }: SectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        borderRadius: 2,
        mb: 2,
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        {/* section header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
          </Stack>
          {action}
        </Stack>
        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
        {children}
      </CardContent>
    </Card>
  );
}

// ── Info row — label + value pair used in Basic Info & Dates/Financial ────────
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={1} mb={1.2}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 140, flexShrink: 0, pt: '2px' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ── Expiry countdown badge — shown inline in the Dates section ────────────────
interface ExpiryBadgeProps {
  daysToExpiry: number;
}

function ExpiryBadge({ daysToExpiry }: ExpiryBadgeProps) {
  if (daysToExpiry < 0)
    return (
      <Chip
        label="Expired"
        size="small"
        color="error"
        variant="outlined"
        sx={{ fontSize: 11, height: 20, fontWeight: 600 }}
      />
    );
  if (daysToExpiry <= EXPIRY_WARNING_DAYS)
    return (
      <Chip
        label={`${daysToExpiry}d left`}
        size="small"
        color="warning"
        variant="outlined"
        icon={<WarningAmberIcon sx={{ fontSize: '12px !important' }} />}
        sx={{ fontSize: 11, height: 20, fontWeight: 600 }}
      />
    );
  return (
    <Chip
      label={`${daysToExpiry}d left`}
      size="small"
      color="success"
      variant="outlined"
      sx={{ fontSize: 11, height: 20, fontWeight: 600 }}
    />
  );
}

// ── §4-C §1: Basic Information section ───────────────────────────────────────
interface BasicInfoSectionProps {
  data: ContractDetail;
}

function BasicInfoSection({ data }: BasicInfoSectionProps) {
  return (
    <SectionCard title="Basic Information" icon={<InfoOutlinedIcon fontSize="small" />}>
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoRow label="Contract ID" value={data.contractId} />
          <InfoRow label="Contract Title" value={data.contractTitle} />
          <InfoRow label="Vendor" value={data.vendor} />
          <InfoRow label="Contract Type" value={data.contractType} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoRow label="Category" value={data.category} />
          <InfoRow label="Created By" value={data.createdBy} />
          <InfoRow
            label="Status"
            value={
              // ── Status badge — reusable across modules per spec §8 ───────────
              <Chip
                label={data.status}
                size="small"
                color={STATUS_COLOR[data.status]}
                variant="outlined"
                sx={{ fontSize: 11, height: 22, fontWeight: 600 }}
              />
            }
          />
        </Grid>
        {/* Description spans full width */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1} mt={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ minWidth: 140, flexShrink: 0, pt: '2px' }}
            >
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {data.description}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

// ── §4-C §2: Dates & Financial Info section ───────────────────────────────────
interface DatesFinancialSectionProps {
  data: ContractDetail;
}

function DatesFinancialSection({ data }: DatesFinancialSectionProps) {
  return (
    <SectionCard
      title="Dates & Financial Info"
      icon={<CalendarTodayOutlinedIcon fontSize="small" />}
    >
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoRow label="Start Date" value={data.startDate} />
          <InfoRow label="End Date" value={data.endDate} />
          <InfoRow label="Renewal Date" value={data.renewalDate} />
          <InfoRow label="Expiry Status" value={<ExpiryBadge daysToExpiry={data.daysToExpiry} />} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoRow label="Contract Value" value={data.contractValue} />
          <InfoRow label="Currency" value={data.currency} />
        </Grid>
      </Grid>
    </SectionCard>
  );
}

// ── §4-C §3: Documents Section ────────────────────────────────────────────────
// Shows uploaded files, version, status, download/view/replace actions.
// Upload button triggers handler wired to file input during API integration.
interface DocumentsSectionProps {
  documents: ContractDocument[];
  // TODO: wire onUpload → dispatch(uploadContractDocument(contractId, file))
  onUpload: () => void;
  // TODO: wire onDownload → dispatch(downloadDocument(doc.id))
  onDownload: (doc: ContractDocument) => void;
  // TODO: wire onView → open preview modal or router.push(doc.previewUrl)
  onView: (doc: ContractDocument) => void;
  // TODO: wire onReplace → open file-picker, dispatch(replaceDocument(doc.id, file))
  onReplace: (doc: ContractDocument) => void;
}

function DocumentsSection({
  documents,
  onUpload,
  onDownload,
  onView,
  onReplace,
}: DocumentsSectionProps) {
  return (
    <SectionCard
      title="Documents"
      icon={<AttachFileOutlinedIcon fontSize="small" />}
      action={
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={onUpload}
          sx={{ fontSize: 12 }}
        >
          Upload
        </Button>
      }
    >
      {documents.length === 0 ? (
        <Box py={3} textAlign="center">
          <DescriptionOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No documents uploaded yet.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {documents.map((doc) => (
            <Paper
              key={doc.id}
              variant="outlined"
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 1.5,
                borderColor: (theme) => alpha(theme.palette.text.primary, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              {/* file info */}
              <Stack direction="row" alignItems="center" spacing={1.5} flex={1} minWidth={0}>
                <DescriptionOutlinedIcon
                  sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }}
                />
                <Box minWidth={0}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    display="block"
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {doc.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.version} &bull; {doc.fileType} &bull; {doc.fileSizeKb} KB &bull; Uploaded
                    by {doc.uploadedBy} on {doc.uploadedAt}
                  </Typography>
                </Box>
              </Stack>

              {/* status + actions */}
              <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
                {/* Document status badge — reusable per spec §8 */}
                <Chip
                  label={doc.status}
                  size="small"
                  color={DOC_STATUS_COLOR[doc.status]}
                  variant="outlined"
                  sx={{ fontSize: 10, height: 20, fontWeight: 600 }}
                />

                {/* View — always enabled */}
                <Tooltip title="Preview">
                  <IconButton size="small" onClick={() => onView(doc)}>
                    <RemoveRedEyeOutlinedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>

                {/* Download — always enabled */}
                <Tooltip title="Download">
                  <IconButton size="small" onClick={() => onDownload(doc)}>
                    <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>

                {/* Replace — enabled for non-Expired docs */}
                <Tooltip
                  title={doc.status !== 'Expired' ? 'Replace' : 'Cannot replace expired document'}
                >
                  <span>
                    <IconButton
                      size="small"
                      disabled={doc.status === 'Expired'}
                      onClick={() => onReplace(doc)}
                    >
                      <RefreshOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

// ── §4-C §4: Approval History — timeline showing who approved, when, comments ─
interface ApprovalHistorySectionProps {
  history: ApprovalHistoryEntry[];
}

function ApprovalHistorySection({ history }: ApprovalHistorySectionProps) {
  return (
    <SectionCard title="Approval History" icon={<CheckCircleOutlineIcon fontSize="small" />}>
      {history.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No approval history available.
        </Typography>
      ) : (
        <Stack spacing={0}>
          {history.map((entry, idx) => (
            <Stack key={entry.id} direction="row" spacing={2}>
              {/* timeline line + dot */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: 20,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    mt: '4px',
                    bgcolor:
                      entry.action === 'Approved'
                        ? 'success.main'
                        : entry.action === 'Rejected'
                          ? 'error.main'
                          : entry.action === 'Returned'
                            ? 'warning.main'
                            : 'info.main',
                    flexShrink: 0,
                  }}
                />
                {idx < history.length - 1 && (
                  <Box
                    sx={{
                      width: '1px',
                      flex: 1,
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1),
                      minHeight: 28,
                      mt: '2px',
                    }}
                  />
                )}
              </Box>

              {/* entry content */}
              <Box pb={idx < history.length - 1 ? 2 : 0} flex={1}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  {/* Approval action badge — reusable per spec §8 */}
                  <Chip
                    label={entry.action}
                    size="small"
                    color={APPROVAL_ACTION_COLOR[entry.action]}
                    variant="outlined"
                    sx={{ fontSize: 10, height: 20, fontWeight: 600 }}
                  />
                  <Typography variant="caption" fontWeight={600}>
                    {entry.actor}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({entry.role})
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    &bull; {entry.date}
                  </Typography>
                </Stack>
                {entry.comments && (
                  <Typography variant="caption" color="text.secondary" mt={0.3} display="block">
                    {entry.comments}
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

// ── §4-C §5: Amendment History ────────────────────────────────────────────────
// Shows amendment number, date, reason, updated fields, amended by
interface AmendmentHistorySectionProps {
  amendments: AmendmentHistoryEntry[];
}

function AmendmentHistorySection({ amendments }: AmendmentHistorySectionProps) {
  return (
    <SectionCard title="Amendment History" icon={<EditOutlinedIcon fontSize="small" />}>
      {amendments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No amendments recorded.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {amendments.map((amd) => (
            <Paper
              key={amd.id}
              variant="outlined"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 1.5,
                borderColor: (theme) => alpha(theme.palette.text.primary, 0.1),
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                spacing={0.5}
                mb={0.8}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    {amd.amendmentNo}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    &bull; {amd.date}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Amended by: <strong>{amd.amendedBy}</strong>
                </Typography>
              </Stack>

              <Typography variant="caption" color="text.secondary" display="block" mb={0.8}>
                <strong>Reason:</strong> {amd.reason}
              </Typography>

              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary" mr={0.5}>
                  Updated:
                </Typography>
                {amd.updatedFields.map((field) => (
                  <Chip
                    key={field}
                    label={field}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10, height: 18 }}
                  />
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

// ── §4-C §6: Audit Trail ──────────────────────────────────────────────────────
// Shows Created / Updated / Renewed / Terminated activity history
interface AuditTrailSectionProps {
  auditTrail: AuditEntry[];
}

function AuditTrailSection({ auditTrail }: AuditTrailSectionProps) {
  return (
    <SectionCard title="Audit Trail" icon={<HistoryOutlinedIcon fontSize="small" />}>
      {auditTrail.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No audit records found.
        </Typography>
      ) : (
        <Stack spacing={0}>
          {auditTrail.map((entry, idx) => (
            <Stack key={entry.id} direction="row" spacing={2}>
              {/* coloured dot + connector line */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: 20,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    mt: '5px',
                    bgcolor: AUDIT_ACTION_COLOR[entry.action],
                    flexShrink: 0,
                  }}
                />
                {idx < auditTrail.length - 1 && (
                  <Box
                    sx={{
                      width: '1px',
                      flex: 1,
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
                      minHeight: 24,
                      mt: '2px',
                    }}
                  />
                )}
              </Box>

              {/* audit entry content */}
              <Box pb={idx < auditTrail.length - 1 ? 1.5 : 0} flex={1}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: AUDIT_ACTION_COLOR[entry.action] }}
                  >
                    {entry.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    by <strong>{entry.performedBy}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    &bull; {entry.date}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.2}>
                  {entry.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}

// ── Loading skeleton — matches ContractDashboard pattern ─────────────────────
function DetailSkeleton() {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Skeleton variant="text" width={240} height={32} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={90} height={32} />
          <Skeleton variant="rounded" width={90} height={32} />
        </Stack>
      </Stack>
      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={120} sx={{ mb: 2, borderRadius: 2 }} />
      ))}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB PANEL — used when tabs mode is active (large screens)
// ─────────────────────────────────────────────────────────────────────────────
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, index, value }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} pt={2}>
      {value === index && children}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — ContractDetail
// ─────────────────────────────────────────────────────────────────────────────

interface ContractDetailPageProps {
  /** Contract ID from route params — e.g. params.contractId in Next.js App Router */
  contractId?: string;
}

function ContractDetailPage({ contractId: propContractId }: ContractDetailPageProps) {
  const theme = useTheme();
  const PRIMARY = theme.palette.primary.main;
  const searchParams = useSearchParams();

  // Get contract ID from URL params if not provided as prop
  const contractId = propContractId || searchParams.get('id');

  // Redux state
  const dispatch = useAppDispatch();
  const { currentContract, fetchingContract, fetchContractError } = useAppSelector(
    (state) => state.contractManagement
  );

  // Transform API contract data to UI format
  const [transformedData, setTransformedData] = React.useState<ContractDetail | null>(null);

  // ── active tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState(0);

  // ── data loading using Redux thunk ─────────────────────────────────────────────
  const loadDetail = useCallback(() => {
    if (contractId) {
      dispatch(fetchContractById(contractId));
    }
  }, [contractId, dispatch]);

  useEffect(() => {
    if (contractId) {
      loadDetail();
    }

    // Cleanup: clear current contract when component unmounts
    return () => {
      dispatch(clearCurrentContract());
    };
  }, [contractId, dispatch, loadDetail]);

  // Transform data when currentContract changes
  useEffect(() => {
    if (currentContract) {
      const transformed = transformApiContractToDetail(currentContract);
      setTransformedData(transformed);
    } else {
      setTransformedData(null);
    }
  }, [currentContract]);

  // ── row action handlers ─────────────────────────────────────────────────────
  // Each handler will be wired to router.push / dispatch during API integration

  const handleEdit = () => {
    // TODO: router.push(paths.contract.edit(contractId))
    console.info('[ContractDetail] Edit:', contractId);
  };

  const handleRenew = () => {
    // TODO: router.push(paths.contract.renew(contractId))
    console.info('[ContractDetail] Renew:', contractId);
  };

  const handleUploadDocument = () => {
    // TODO: open file-picker → dispatch(uploadContractDocument(contractId, file))
    console.info('[ContractDetail] Upload document for:', contractId);
  };

  const handleDownloadDocument = (doc: ContractDocument) => {
    // TODO: dispatch(downloadDocument(doc.id)) → triggers file download
    console.info('[ContractDetail] Download document:', doc.fileName);
  };

  const handleViewDocument = (doc: ContractDocument) => {
    // TODO: open preview modal or router.push(doc.previewUrl)
    console.info('[ContractDetail] Preview document:', doc.fileName);
  };

  const handleReplaceDocument = (doc: ContractDocument) => {
    // TODO: open file-picker → dispatch(replaceDocument(doc.id, file))
    console.info('[ContractDetail] Replace document:', doc.fileName);
  };

  // ── tab config ──────────────────────────────────────────────────────────────
  const TABS = [
    { label: 'Overview', icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} /> },
    { label: 'Documents', icon: <AttachFileOutlinedIcon sx={{ fontSize: 15 }} /> },
    { label: 'Approvals', icon: <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} /> },
    { label: 'Amendments', icon: <EditOutlinedIcon sx={{ fontSize: 15 }} /> },
    { label: 'Audit Trail', icon: <HistoryOutlinedIcon sx={{ fontSize: 15 }} /> },
  ];

  // ── loading state ─────────────────────────────────────────────────────────────
  if (fetchingContract) return <DetailSkeleton />;

  // ── error state ───────────────────────────────────────────────────────────────
  if (fetchContractError) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="error" mb={2}>
          Failed to load contract: {fetchContractError}
        </Typography>
        <Button variant="outlined" onClick={loadDetail}>
          Retry
        </Button>
      </Box>
    );
  }

  // ── empty state ───────────────────────────────────────────────────────────────
  if (!transformedData || !contractId) {
    return (
      <Box textAlign="center" py={8}>
        <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">Contract not found.</Typography>
        <Button variant="outlined" size="small" sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // ── expiry warning — spec §4-F ────────────────────────────────────────────────
  const showExpiryWarning = transformedData.daysToExpiry >= 0 && transformedData.daysToExpiry <= EXPIRY_WARNING_DAYS;

  // ── action button visibility by status — spec §4-B / §4-F / §4-G ─────────────
  const canEdit = transformedData.status === 'Draft' || transformedData.status === 'Under Review';
  const canRenew = transformedData.status === 'Active' || transformedData.status === 'Expired';

  // ── main render ───────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── breadcrumb / page header ─────────────────────────────────────────── */}
      <Box mb={2}>
        {/*
          Replace the block below with:
          <PremiumBreadcrumbs
            title={transformedData.contractId}
            paths={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Contract Dashboard', href: '/contract-dashboard' },
              { label: transformedData.contractId, href: '#' },
            ]}
            action={
              <>
                {canEdit && (
                  <Button variant="outlined" size="small" onClick={handleEdit}>Edit</Button>
                )}
                {canRenew && (
                  <Button variant="contained" size="small" onClick={handleRenew}>Renew</Button>
                )}
              </>
            }
          />
        */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              Home &rsaquo; Contract Dashboard &rsaquo; {transformedData.contractId}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h6" fontWeight={700}>
                {transformedData.contractId}
              </Typography>
              {/* Status badge in header — reusable per spec §8 */}
              <Chip
                label={transformedData.status}
                size="small"
                color={STATUS_COLOR[transformedData.status]}
                variant="outlined"
                sx={{ fontSize: 11, height: 22, fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              {transformedData.contractTitle}
            </Typography>
          </Box>

          {/* Header actions — conditional per contract status */}
          <Stack direction="row" spacing={1} flexShrink={0}>
            {canEdit && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
            {canRenew && (
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={handleRenew}
                sx={{ background: PRIMARY, color: 'white' }}
              >
                Renew
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* ── expiry warning banner — spec §4-F ────────────────────────────────── */}
      {showExpiryWarning && (
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="small" />}
          sx={{ mb: 2, fontSize: 12 }}
        >
          This contract expires in <strong>{transformedData.daysToExpiry} days</strong> ({transformedData.endDate}).
          Initiate renewal now to avoid service disruption.
        </Alert>
      )}

      {/* ── summary strip — quick at-a-glance metadata ───────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        mb={2.5}
        flexWrap="wrap"
        useFlexGap
      >
        {[
          {
            icon: <BusinessOutlinedIcon sx={{ fontSize: 15 }} />,
            label: 'Vendor',
            value: transformedData.vendor,
          },
          {
            icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />,
            label: 'End Date',
            value: transformedData.endDate,
          },
          {
            icon: <CurrencyRupeeOutlinedIcon sx={{ fontSize: 15 }} />,
            label: 'Value',
            value: transformedData.contractValue,
          },
          {
            icon: <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />,
            label: 'Documents',
            value: `${transformedData.documents.length} file${transformedData.documents.length !== 1 ? 's' : ''}`,
          },
          {
            icon: <TimelineIcon sx={{ fontSize: 15 }} />,
            label: 'Amendments',
            value: `${transformedData.amendmentHistory.length} amendment${transformedData.amendmentHistory.length !== 1 ? 's' : ''}`,
          },
        ].map((item) => (
          <Card
            key={item.label}
            elevation={0}
            sx={{
              flex: 1,
              minWidth: 130,
              border: (t) => `1px solid ${alpha(t.palette.text.primary, 0.08)}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ py: '10px !important', px: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.8} mb={0.3}>
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>{item.icon}</Box>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600} sx={{ pl: 0.2 }}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* ── navigation tabs — one per spec §4-C section ──────────────────────── */}
      <Box
        sx={{
          borderBottom: (t) => `1px solid ${alpha(t.palette.text.primary, 0.1)}`,
          mb: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            '& .MuiTab-root': { minHeight: 38, fontSize: 12, fontWeight: 600, py: 0 },
            '& .MuiTab-root.Mui-selected': { color: 'primary.main' },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.label}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ gap: 0.5 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* ── Tab 0: Overview (Basic Info + Dates/Financial) ───────────────────── */}
      <TabPanel value={activeTab} index={0}>
        <BasicInfoSection data={transformedData} />
        <DatesFinancialSection data={transformedData} />
      </TabPanel>

      {/* ── Tab 1: Documents — spec §4-C §3 ──────────────────────────────────── */}
      <TabPanel value={activeTab} index={1}>
        <DocumentsSection
          documents={transformedData.documents}
          onUpload={handleUploadDocument}
          onDownload={handleDownloadDocument}
          onView={handleViewDocument}
          onReplace={handleReplaceDocument}
        />
      </TabPanel>

      {/* ── Tab 2: Approval History — spec §4-C §4 ───────────────────────────── */}
      <TabPanel value={activeTab} index={2}>
        <ApprovalHistorySection history={transformedData.approvalHistory} />
      </TabPanel>

      {/* ── Tab 3: Amendment History — spec §4-C §5 ──────────────────────────── */}
      <TabPanel value={activeTab} index={3}>
        <AmendmentHistorySection amendments={transformedData.amendmentHistory} />
      </TabPanel>

      {/* ── Tab 4: Audit Trail — spec §4-C §6 ────────────────────────────────── */}
      <TabPanel value={activeTab} index={4}>
        <AuditTrailSection auditTrail={transformedData.auditTrail} />
      </TabPanel>
    </Box>
  );
}

export default ContractDetailPage;
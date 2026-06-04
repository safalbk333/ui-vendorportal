'use client';

import {
  Box,
  Card,
  Chip,
  Step,
  Alert,
  Stack,
  Button,
  Dialog,
  Divider,
  Stepper,
  Tooltip,
  StepLabel,
  TextField,
  IconButton,
  Typography,
  CardContent,
  Autocomplete,
  DialogActions,
  DialogContent,
  StepConnector,
  FormHelperText,
  LinearProgress,
  CircularProgress,
  Snackbar,
} from '@mui/material';

import React, { useRef, useState, useReducer, useCallback, useEffect } from 'react';
import { alpha, styled, useTheme } from '@mui/material/styles';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { RootState } from 'src/redux/store';
import { createContract, fetchContracts, clearCreateState } from 'src/redux/ContractManagement/ContractManagementSlice';
import type { CreateContractRequest } from 'src/redux/ContractManagement/ContractManagementSlice';
import { fetchVendors } from 'src/redux/VendorManagement/VendorManagementSlice';
import type { Vendor } from 'src/redux/VendorManagement/VendorManagementSlice';

/** Shape of the contract creation form */
interface ContractFormValues {
  contractCode: string;
  contractTitle: string;
  vendor: string | null;
  vendorId: string | null; // Added to store vendor ID
  contractType: string | null;
  category: string | null;
  description: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractValue: string;
  currency: string | null;
  strHtmlContent?: string | null
}

type FormErrors = Partial<Record<keyof ContractFormValues, string>>;
interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  done: boolean;
  error: string | null;
}

interface VendorOption {
  id: string;
  name: string;
}

// Remove static VENDOR_OPTIONS - will be fetched from API
// const VENDOR_OPTIONS: VendorOption[] = [ ... ];

const CONTRACT_TYPE_OPTIONS: string[] = [
  'Service Agreement',
  'Supply Contract',
  'Annual Maintenance Contract (AMC)',
  'Lease Agreement',
  'Non-Disclosure Agreement (NDA)',
  'Master Service Agreement (MSA)',
  'Statement of Work (SOW)',
  'Framework Agreement',
];

const CATEGORY_OPTIONS: string[] = [
  'IT Services',
  'Manufacturing',
  'Office Supplies',
  'Logistics',
  'AMC',
  'Security',
  'Infrastructure',
  'Telecom',
  'HR Services',
  'Finance',
];

const CURRENCY_OPTIONS: string[] = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_FILE_EXTENSIONS = '.pdf,.docx';

const StyledStepConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: alpha(theme.palette.text.primary, 0.12),
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
  },
}));

const STEPS = [
  { label: 'Basic Info', icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} /> },
  { label: 'Dates & Value', icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 16 }} /> },
  { label: 'Documents', icon: <ArticleOutlinedIcon sx={{ fontSize: 16 }} /> },
  { label: 'Review & Submit', icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> },
];

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        borderRadius: 2,
        mb: 2,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
          <Box
            sx={(theme) => ({
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              flexShrink: 0,
            })}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function ReviewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={0.5}
      sx={(theme) => ({
        py: 0.8,
        borderBottom: `1px dashed ${alpha(theme.palette.text.primary, 0.08)}`,
        '&:last-child': { borderBottom: 'none' },
      })}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={500}
        sx={{ minWidth: 150, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600} color="text.primary">
        {value || '—'}
      </Typography>
    </Stack>
  );
}

function validateStep(step: number, values: ContractFormValues): FormErrors {
  const errors: FormErrors = {};

  if (step === 0) {
    if (!values.contractTitle.trim()) errors.contractTitle = 'Contract Title is required.';
    if (!values.vendorId) errors.vendor = 'Please select a Vendor.';
    if (!values.contractType) errors.contractType = 'Please select a Contract Type.';
    if (!values.category) errors.category = 'Please select a Category.';
  }

  if (step === 1) {
    if (!values.startDate) errors.startDate = 'Start Date is required.';
    if (!values.endDate) errors.endDate = 'End Date is required.';
    if (values.startDate && values.endDate && values.endDate <= values.startDate) {
      errors.endDate = 'End Date must be after Start Date.';
    }
    if (!values.contractValue.trim()) {
      errors.contractValue = 'Contract Value is required.';
    } else if (isNaN(Number(values.contractValue.replace(/,/g, '')))) {
      errors.contractValue = 'Contract Value must be a valid number.';
    }
    if (!values.currency) errors.currency = 'Please select a Currency.';
  }
  if (step === 3) {
    Object.assign(errors, validateStep(0, values), validateStep(1, values));
  }

  return errors;
}

interface FileItemProps {
  entry: UploadedFile;
  onRemove: (id: string) => void;
}

function FileItem({ entry, onRemove }: FileItemProps) {
  const isPdf = entry.file.type === 'application/pdf';

  return (
    <Box
      sx={(theme) => ({
        px: 1.5,
        py: 1.2,
        borderRadius: 1.5,
        border: `1px solid ${entry.error
            ? theme.palette.error.main
            : entry.done
              ? alpha(theme.palette.success.main, 0.4)
              : alpha(theme.palette.text.primary, 0.1)
          }`,
        bgcolor: entry.error
          ? alpha(theme.palette.error.main, 0.03)
          : entry.done
            ? alpha(theme.palette.success.main, 0.03)
            : 'transparent',
        transition: 'border-color 0.2s',
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={(theme) => ({
            width: 34,
            height: 34,
            borderRadius: 1,
            bgcolor: isPdf
              ? alpha(theme.palette.error.main, 0.1)
              : alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isPdf ? 'error.main' : 'primary.main',
            flexShrink: 0,
          })}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
        </Box>

        <Box flex={1} minWidth={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 260 }}>
              {entry.file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
              {(entry.file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Stack>

          {!entry.done && !entry.error && (
            <Box mt={0.5}>
              <LinearProgress
                variant="determinate"
                value={entry.progress}
                sx={{ height: 3, borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Uploading… {entry.progress}%
              </Typography>
            </Box>
          )}

          {entry.error && (
            <Typography variant="caption" color="error.main">
              {entry.error}
            </Typography>
          )}

          {entry.done && !entry.error && (
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3}>
              <CheckCircleOutlineIcon sx={{ fontSize: 12, color: 'success.main' }} />
              <Typography variant="caption" color="success.main">
                Upload complete
              </Typography>
            </Stack>
          )}
        </Box>

        <Tooltip title="Remove file">
          <IconButton size="small" onClick={() => onRemove(entry.id)}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

interface StepBasicInfoProps {
  values: ContractFormValues;
  errors: FormErrors;
  onChange: (field: keyof ContractFormValues, value: string | null) => void;
  onVendorChange: (vendorId: string | null, vendorName: string | null) => void;
  vendorOptions: VendorOption[];
  vendorsLoading: boolean;
}

function StepBasicInfo({ values, errors, onChange, onVendorChange, vendorOptions, vendorsLoading }: StepBasicInfoProps) {
  const selectedVendor = values.vendorId
    ? vendorOptions.find(v => v.id === values.vendorId)
    : null;

  return (
    <SectionCard title="Basic Information" icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2.5}>
        {/* Contract Title — mandatory per spec §4-D */}
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            size="small"
            label="Contract Title *"
            placeholder="e.g. IT Infrastructure Support Agreement"
            value={values.contractTitle}
            onChange={(e) => onChange('contractTitle', e.target.value)}
            error={!!errors.contractTitle}
            helperText={errors.contractTitle}
          />
        </Box>

        {/* Vendor — dropdown from API, mandatory per spec §4-D */}
        <Autocomplete
          size="small"
          options={vendorOptions}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedVendor}
          loading={vendorsLoading}
          onChange={(_, vendor) => {
            onVendorChange(vendor?.id || null, vendor?.name || null);
            onChange('vendor', vendor?.name || null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vendor *"
              error={!!errors.vendor}
              helperText={errors.vendor}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {vendorsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        {/* Contract Type — dropdown, mandatory */}
        <Autocomplete
          size="small"
          options={CONTRACT_TYPE_OPTIONS}
          value={values.contractType}
          onChange={(_, v) => onChange('contractType', v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Contract Type *"
              error={!!errors.contractType}
              helperText={errors.contractType}
            />
          )}
        />

        {/* Category */}
        <Autocomplete
          size="small"
          options={CATEGORY_OPTIONS}
          value={values.category}
          onChange={(_, v) => onChange('category', v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category *"
              error={!!errors.category}
              helperText={errors.category}
            />
          )}
        />

        {/* Description — text area */}
        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
          <TextField
            fullWidth
            size="small"
            label="Description"
            placeholder="Describe the scope and purpose of this contract…"
            multiline
            rows={3}
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </Box>
      </Box>
    </SectionCard>
  );
}

interface StepDatesFinancialProps {
  values: ContractFormValues;
  errors: FormErrors;
  onChange: (field: keyof ContractFormValues, value: string | null) => void;
}

function StepDatesFinancial({ values, errors, onChange }: StepDatesFinancialProps) {
  return (
    <SectionCard
      title="Dates & Financial Info"
      icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16 }} />}
    >
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
        gap={2.5}
      >
        {/* Start Date — mandatory per spec §4-D */}
        <TextField
          fullWidth
          size="small"
          label="Start Date *"
          type="date"
          value={values.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={!!errors.startDate}
          helperText={errors.startDate}
        />

        {/* End Date — mandatory; must be after Start Date per spec §4-D Validation */}
        <TextField
          fullWidth
          size="small"
          label="End Date *"
          type="date"
          value={values.endDate}
          onChange={(e) => onChange('endDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={!!errors.endDate}
          helperText={errors.endDate}
          inputProps={{ min: values.startDate || undefined }}
        />

        {/* Renewal Date — optional */}
        <TextField
          fullWidth
          size="small"
          label="Renewal Date"
          type="date"
          value={values.renewalDate}
          onChange={(e) => onChange('renewalDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: values.endDate || undefined }}
          helperText="Optional — when to trigger renewal reminder"
        />

        {/* Contract Value — numeric, mandatory per spec §4-D */}
        <TextField
          fullWidth
          size="small"
          label="Contract Value *"
          placeholder="e.g. 1200000"
          value={values.contractValue}
          onChange={(e) => onChange('contractValue', e.target.value)}
          error={!!errors.contractValue}
          helperText={errors.contractValue || 'Enter numeric value without commas'}
          inputProps={{ inputMode: 'numeric' }}
        />

        {/* Currency — dropdown, mandatory */}
        <Autocomplete
          size="small"
          options={CURRENCY_OPTIONS}
          value={values.currency}
          onChange={(_, v) => onChange('currency', v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Currency *"
              error={!!errors.currency}
              helperText={errors.currency}
            />
          )}
        />
      </Box>

      {/* Date range validation inline hint */}
      {values.startDate && values.endDate && values.endDate > values.startDate && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="small" />}
          sx={{ mt: 2, fontSize: 12 }}
        >
          Contract duration:{' '}
          <strong>
            {Math.ceil(
              (new Date(values.endDate).getTime() - new Date(values.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
            )}{' '}
            days
          </strong>
        </Alert>
      )}
    </SectionCard>
  );
}

interface StepDocumentsProps {
  files: UploadedFile[];
  fileError: string | null;
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (id: string) => void;
}

function StepDocuments({ files, fileError, onAddFiles, onRemoveFile }: StepDocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) onAddFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <SectionCard title="Contract Documents" icon={<ArticleOutlinedIcon sx={{ fontSize: 16 }} />}>
      {/* Hidden file input — spec §4-D: Allow PDF, DOCX */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_EXTENSIONS}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && onAddFiles(e.target.files)}
      />

      {/* Drop zone */}
      <Box
        onClick={handleDropZoneClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={(theme) => ({
          border: `2px dashed ${fileError ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          transition: 'border-color 0.2s, background-color 0.2s',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
          mb: 2,
        })}
      >
        <CloudUploadOutlinedIcon
          sx={(theme) => ({ fontSize: 36, color: alpha(theme.palette.primary.main, 0.5), mb: 1 })}
        />
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Drag & drop files here, or{' '}
          <Typography component="span" variant="body2" color="primary" fontWeight={700}>
            browse
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Accepted formats: PDF, DOCX · Max file size: 10 MB per file
        </Typography>
      </Box>

      {/* Global file error — e.g. wrong type or oversized */}
      {fileError && (
        <FormHelperText error sx={{ mb: 1.5 }}>
          {fileError}
        </FormHelperText>
      )}

      {/* File list */}
      {files.length > 0 && (
        <Stack spacing={1}>
          {files.map((entry) => (
            <FileItem key={entry.id} entry={entry} onRemove={onRemoveFile} />
          ))}
        </Stack>
      )}

      {files.length === 0 && (
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          No files added yet. Documents can also be uploaded after contract creation.
        </Typography>
      )}
    </SectionCard>
  );
}

interface StepReviewProps {
  values: ContractFormValues;
  files: UploadedFile[];
  errors: FormErrors;
  vendorOptions: VendorOption[];
}

function StepReview({ values, files, errors, vendorOptions }: StepReviewProps) {
  const hasErrors = Object.keys(errors).length > 0;

  const vendorName = values.vendorId
    ? vendorOptions.find(v => v.id === values.vendorId)?.name
    : values.vendor;

  return (
    <>
      {/* Validation summary — shows if any earlier step has errors */}
      {hasErrors && (
        <Alert severity="error" icon={<ErrorOutlineIcon fontSize="small" />} sx={{ mb: 2 }}>
          Please go back and fix the following before submitting:&nbsp;
          {Object.values(errors).join(' · ')}
        </Alert>
      )}

      {/* Basic Info review */}
      <SectionCard title="Basic Information" icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}>
        <ReviewField label="Contract Title" value={values.contractTitle} />
        <ReviewField label="Vendor" value={vendorName} />
        <ReviewField label="Contract Type" value={values.contractType} />
        <ReviewField label="Category" value={values.category} />
        <ReviewField label="Description" value={values.description || 'Not provided'} />
      </SectionCard>

      {/* Dates & Financial review */}
      <SectionCard
        title="Dates & Financial Info"
        icon={<AttachMoneyOutlinedIcon sx={{ fontSize: 16 }} />}
      >
        <ReviewField label="Start Date" value={values.startDate} />
        <ReviewField label="End Date" value={values.endDate} />
        <ReviewField label="Renewal Date" value={values.renewalDate || 'Not set'} />
        <ReviewField
          label="Contract Value"
          value={
            values.contractValue
              ? `${values.currency ?? ''} ${Number(values.contractValue.replace(/,/g, '')).toLocaleString('en-IN')}`
              : undefined
          }
        />
        <ReviewField label="Currency" value={values.currency} />
      </SectionCard>

      {/* Documents review */}
      <SectionCard title="Documents" icon={<ArticleOutlinedIcon sx={{ fontSize: 16 }} />}>
        {files.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No documents attached. You can upload documents after contract creation.
          </Typography>
        ) : (
          <Stack spacing={0.8}>
            {files.map((f) => (
              <Stack key={f.id} direction="row" spacing={1} alignItems="center">
                <DescriptionOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600}>
                  {f.file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({(f.file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
                {f.done && !f.error && (
                  <Chip
                    label="Ready"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontSize: 10, height: 18 }}
                  />
                )}
                {f.error && (
                  <Chip
                    label="Upload failed"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ fontSize: 10, height: 18 }}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </SectionCard>
    </>
  );
}

// ── SuccessDialog kept in codebase but no longer triggered after submit ────────
// Retained for potential future use (e.g. draft save confirmation).
interface SuccessDialogProps {
  open: boolean;
  contractId: string;
  onViewContract: () => void;
  onCreateAnother: () => void;
  onBackToList: () => void;
}

function SuccessDialog({
  open,
  contractId,
  onViewContract,
  onCreateAnother,
  onBackToList,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 52, color: 'success.main', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Contract Created!
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Contract <strong>{contractId}</strong> has been created successfully and submitted for
          review.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
        <Button fullWidth variant="contained" onClick={onViewContract}>
          View Contract
        </Button>
        <Button fullWidth variant="outlined" onClick={onCreateAnother}>
          Create Another Contract
        </Button>
        <Button fullWidth variant="text" onClick={onBackToList} size="small">
          Back to Contract List
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Toast notification component
interface ToastProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

function ToastNotification({ open, message, severity, onClose }: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

function AddorEditContract() {
  const theme = useTheme();
  const PRIMARY = theme.palette.primary.main;

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { creating: submitting, createError: error, data: contracts } = useAppSelector(
    (state: RootState) => state.contractManagement
  );

  // Get vendors from Redux store
  const { data: vendors, loading: vendorsLoading, error: vendorsError } = useAppSelector(
    (state: RootState) => state.vendorManagement
  );

  const createdId = contracts.length > 0 ? contracts[0]?.pk_chr_contract_id : null;

  const [activeStep, setActiveStep] = useState(0);

  const [values, setValues] = useState<ContractFormValues>({
    contractCode: '',
    contractTitle: '',
    vendor: null,
    vendorId: null,
    contractType: null,
    category: null,
    description: '',
    startDate: '',
    endDate: '',
    renewalDate: '',
    contractValue: '',
    currency: 'INR',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Transform vendors from API to VendorOption format
  const vendorOptions: VendorOption[] = vendors.map((vendor: Vendor) => ({
    id: vendor.pk_chr_vendor_id,
    name: vendor.chr_vendor_name,
  }));

  // ── SuccessDialog state — kept for potential future use (e.g. draft save) ──
  const [successOpen, setSuccessOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Redirect-after-success timer ref — cleared on unmount to avoid leaks ──
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup redirect timer on component unmount
  useEffect(
    () => () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    },
    []
  );

  // ── Fetch vendors when component mounts ───────────────────────────────────
  useEffect(() => {
    if (vendors.length === 0 && !vendorsLoading) {
      dispatch(fetchVendors());
    }
  }, [dispatch, vendors.length, vendorsLoading]);

  // ── Effect: handle API error surfaced from Redux ───────────────────────────
  useEffect(() => {
    if (error) {
      setToast({
        open: true,
        message: error,
        severity: 'error',
      });
    }
  }, [error]);

  // ── Effect: handle vendor fetch errors ─────────────────────────────────────
  useEffect(() => {
    if (vendorsError) {
      setToast({
        open: true,
        message: 'Failed to load vendors. Please refresh the page.',
        severity: 'error',
      });
    }
  }, [vendorsError]);

  const handleChange = useCallback((field: keyof ContractFormValues, value: string | null) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleVendorChange = useCallback((vendorId: string | null, vendorName: string | null) => {
    setValues((prev) => ({ ...prev, vendorId, vendor: vendorName }));
  }, []);

  const handleNext = () => {
    const stepErrors = validateStep(activeStep, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((prev) => prev - 1);
  };

  const handleAddFiles = useCallback((fileList: FileList) => {
    setFileError(null);
    const newEntries: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError(`"${file.name}" is not allowed. Only PDF and DOCX files are accepted.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`"${file.name}" exceeds the 10 MB size limit.`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      newEntries.push({ id, file, progress: 0, done: false, error: null });
    });

    if (newEntries.length === 0) return;

    setFiles((prev) => [...prev, ...newEntries]);

    newEntries.forEach(({ id }) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== id) return f;
            if (f.progress >= 100) {
              clearInterval(interval);
              return { ...f, done: true };
            }
            return { ...f, progress: Math.min(f.progress + 25, 100) };
          })
        );
      }, 400);
    });
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────────
  // On success: shows a toast with the new contract ID, then auto-redirects to
  // the contract list after 3 seconds (per UX spec). On failure: shows an error
  // toast; the page stays so the user can correct issues.
  const handleSubmit = async (submitType: 'draft' | 'review') => {
    const finalErrors = validateStep(3, values);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    if (!values.vendorId) {
      setErrors({ vendor: 'Vendor is required' });
      return;
    }

    const contractData: CreateContractRequest = {
      contractCode: values.contractCode,
      title: values.contractTitle,
      description: values.description || '',
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      value: parseFloat(values.contractValue.replace(/,/g, '')),
      vendorId: values.vendorId,
    };

    try {
      const resultAction = await dispatch(createContract(contractData));

      if (createContract.fulfilled.match(resultAction)) {
        // ── Success path ────────────────────────────────────────────────────
        const newContractId =
          resultAction.payload?.pk_chr_contract_id ?? resultAction.payload?.id ?? '';

        console.log('Contract created successfully:', resultAction.payload);

        // Show success toast — stays visible for the duration of the countdown
        setToast({
          open: true,
          message: `Contract ${newContractId ? `#${newContractId}` : ''} submitted successfully! Redirecting in 3 seconds…`,
          severity: 'success',
        });

        // Auto-redirect to the previous page (contract list) after 3 seconds
        redirectTimerRef.current = setTimeout(() => {
          dispatch(clearCreateState());
          router.push(paths.contract.root);
        }, 3000);
      } else {
        // ── Failure path — rejected thunk ───────────────────────────────────
        const errMsg =
          (resultAction.payload as string) ||
          resultAction.error?.message ||
          'Contract submission failed. Please try again.';

        console.error('Contract creation failed:', resultAction.payload);

        setToast({
          open: true,
          message: errMsg,
          severity: 'error',
        });
      }
    } catch (err) {
      // ── Unexpected/network error ─────────────────────────────────────────
      console.error('Unexpected error:', err);
      setToast({
        open: true,
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
    }
  };

  // ── Handlers for SuccessDialog (kept; dialog currently not auto-triggered) ─
  const handleViewContract = () => {
    if (createdId) {
      router.push(`${paths.contract.root}/${createdId}`);
    }
    setSuccessOpen(false);
    // Clear the create state to prevent showing success again
    dispatch(clearCreateState());
  };

  const handleCreateAnother = () => {
    // Reset entire form for a new contract
    setValues({
      contractCode: '',
      contractTitle: '',
      vendor: null,
      vendorId: null,
      contractType: null,
      category: null,
      description: '',
      startDate: '',
      endDate: '',
      renewalDate: '',
      contractValue: '',
      currency: 'INR',
      strHtmlContent: ''
    });
    setFiles([]);
    setErrors({});
    setActiveStep(0);
    setSuccessOpen(false);
    // Clear the create state to prepare for new contract
    dispatch(clearCreateState());
  };

  const handleBackToList = () => {
    router.push(paths.contract.root);
    setSuccessOpen(false);
    // Clear the create state
    dispatch(clearCreateState());
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const reviewErrors = activeStep === 3 ? validateStep(3, values) : {};

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepBasicInfo
            values={values}
            errors={errors}
            onChange={handleChange}
            onVendorChange={handleVendorChange}
            vendorOptions={vendorOptions}
            vendorsLoading={vendorsLoading}
          />
        );
      case 1:
        return <StepDatesFinancial values={values} errors={errors} onChange={handleChange} />;
      case 2:
        return (
          <StepDocuments
            files={files}
            fileError={fileError}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
          />
        );
      case 3:
        return <StepReview values={values} files={files} errors={reviewErrors} vendorOptions={vendorOptions} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Toast Notification — shown on both success and error after submission */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />

      <Box mb={2}>
        {/*
          Replace the block below with:
          <PremiumBreadcrumbs
            title="New Contract"
            paths={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Contract Dashboard', href: '/contract-dashboard' },
              { label: 'New Contract' },
            ]}
          />
        */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
              <IconButton
                size="small"
                onClick={() => router.push(paths.contract.root)}
                sx={{ mr: 0.5 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                Home &rsaquo; Contract Dashboard &rsaquo; <strong>New Contract</strong>
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" pl={0.5}>
              <Typography variant="h6" fontWeight={700}>
                Create New Contract
              </Typography>
              {/* Status badge — new contracts always start as Draft per lifecycle spec §3 */}
              <Chip
                label="Draft"
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontSize: 11, height: 22, fontWeight: 600 }}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* ── Stepper — multi-step form navigation ────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          border: (t) => `1px solid ${alpha(t.palette.text.primary, 0.08)}`,
          borderRadius: 2,
          mb: 2,
        }}
      >
        <CardContent sx={{ pb: '12px !important' }}>
          <Stepper activeStep={activeStep} connector={<StyledStepConnector />} alternativeLabel>
            {STEPS.map((step, idx) => (
              <Step key={step.label} completed={idx < activeStep}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={(t) => ({
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:
                          idx < activeStep
                            ? t.palette.primary.main
                            : idx === activeStep
                              ? alpha(t.palette.primary.main, 0.12)
                              : alpha(t.palette.text.primary, 0.06),
                        color:
                          idx < activeStep
                            ? '#fff'
                            : idx === activeStep
                              ? t.palette.primary.main
                              : t.palette.text.disabled,
                        border:
                          idx === activeStep
                            ? `1.5px solid ${t.palette.primary.main}`
                            : '1.5px solid transparent',
                        transition: 'all 0.2s',
                      })}
                    >
                      {idx < activeStep ? (
                        <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                      ) : (
                        step.icon
                      )}
                    </Box>
                  )}
                >
                  <Typography
                    variant="caption"
                    fontWeight={idx === activeStep ? 700 : 500}
                    color={idx === activeStep ? 'primary' : 'text.secondary'}
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* ── Submission error banner — mirrors toast for in-page visibility ──── */}
      {error && (
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="small" />}
          sx={{ mb: 2 }}
          onClose={() => {
            dispatch(clearCreateState());
          }}
        >
          {error}
        </Alert>
      )}

      {/* ── Active step content ────────────────────────────────────────────── */}
      {renderStep()}

      <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

      {/* ── Navigation footer buttons ──────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* Back / Cancel */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={activeStep === 0 ? handleBackToList : handleBack}
          disabled={submitting}
          sx={{ borderColor: alpha(theme.palette.text.primary, 0.2) }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {/* Right-side actions */}
        <Stack direction="row" spacing={1}>
          {/* Next — steps 0-2 */}
          {activeStep < STEPS.length - 1 && (
            <Button
              variant="contained"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              sx={{ background: PRIMARY, color: 'white' }}
            >
              Next
            </Button>
          )}

          {/* Submit for Review — final step */}
          {activeStep === STEPS.length - 1 && (
            <Button
              variant="contained"
              size="small"
              startIcon={
                submitting ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon />
              }
              disabled={submitting || Object.keys(reviewErrors).length > 0}
              onClick={() => handleSubmit('review')}
              sx={{ background: PRIMARY, color: 'white' }}
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── SuccessDialog — retained for future use (e.g. draft confirmations) */}
      <SuccessDialog
        open={successOpen}
        contractId={createdId ?? ''}
        onViewContract={handleViewContract}
        onCreateAnother={handleCreateAnother}
        onBackToList={handleBackToList}
      />
    </Box>
  );
}

export default AddorEditContract;
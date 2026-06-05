'use client';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';

import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AttachmentsSection from './Attachment';
import BusinessIcon from '@mui/icons-material/Business';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ModernItemsTable from './Table';
import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import RFQHeaderCard from './RFQSummaryCard';
import RFQProcessFlow from './ProcessFlow';
import { SplashScreen } from 'src/components/loading-screen';
import { fetchRFQById } from 'src/redux/RFQ/RfqSlice';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks/use-router';
import { useSearchParams } from 'next/navigation';

function BuyingOrganizationCard({ organization }: any) {
  const hasData = !!organization;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid #E5E7EB',
      }}
    >
      <Typography
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          mb: 1.5,
        }}
      >
        Buying Organization
      </Typography>

      {!hasData ? (
        <Box
          sx={{
            py: 3,
            textAlign: 'center',
            color: '#6B7280',
          }}
        >
          <BusinessIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography fontSize={13}>
            No organization details available
          </Typography>
        </Box>
      ) : (
        <>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: '#EEF2FF',
                color: '#4F46E5',
                width: 40,
                height: 40,
              }}
            >
              <BusinessIcon sx={{ fontSize: 20 }} />
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                {organization.chr_user_name}
              </Typography>

              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#6B7280',
                }}
              >
                Request Owner
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={13} color="#6B7280">
                Name
              </Typography>

              <Typography fontSize={13} fontWeight={500}>
                {organization.chr_user_name}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={13} color="#6B7280">
                Email
              </Typography>

              <Typography fontSize={13} fontWeight={500}>
                {organization.chr_user_email}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={13} color="#6B7280">
                Role
              </Typography>

              <Chip
                label="Requester"
                size="small"
                sx={{
                  height: 22,
                  bgcolor: '#ECFDF5',
                  color: '#047857',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Stack>
        </>
      )}
    </Paper>
  );
}
function DetailedView() {
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
  const [openFlow, setOpenFlow] = useState(false);
  if (getByIdLoading){
    return <SplashScreen />
  }
  return (
    <Box>
      <Box mb={2}>
        <PremiumBreadcrumbs
          title="RFQ"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'RFQ Dashboard', href: '/quotations' },
            { label: 'View RFQ', href: '/quotations/view' },
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => setOpenFlow(true)}
                startIcon={<AccountTreeRoundedIcon />}
                sx={{ fontWeight: 600, borderRadius: 0.3 }}
                variant="contained"
                color="primary"
              >
                RFQ Flow
              </Button>

<Button
  onClick={() => {
    router.push(`${paths.quotations.submit}?id=${rfqId}`);
  }}
  sx={{ fontWeight: 600, borderRadius: 0.3 }}
  variant="outlined"
>
  Submit Quotation
</Button>
            </Stack>
          }
        />
      </Box>
      <Box mb={2.5} sx={{ borderTop: '1px dashed #d1d5db' }} />

      <Box display="flex" gap={2} mb={3}>
        {/* Left Side - Larger Area */}
        <Paper
          elevation={0}
          sx={{
            flex: 2,
            borderRadius: 0,
            overflow: 'auto',
          }}
        >
          <Box>
<RFQHeaderCard rfq={selectedRFQ} />          </Box>
          {/* divider */}
          <Divider sx={{ my: 1.5 }} />
<ModernItemsTable
  items={selectedRFQ?.rfq_item_mappings || []}
/>        </Paper>

        {/* Right Side */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 1,
            overflow: 'auto',
          }}
        >
<BuyingOrganizationCard
  organization={selectedRFQ?.request?.requested_by}
/>

<AttachmentsSection
  attachments={selectedRFQ?.attachments || []}
/>

          {/* Sidebar / summary / actions */}
        </Paper>
      </Box>
      <Drawer
        anchor="right"
        open={openFlow}
        onClose={() => setOpenFlow(false)}
        PaperProps={{
          sx: {
            width: 480,
            bgcolor: '#F8FAFC',
            borderLeft: '1px solid #E2E8F0',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 18,
                color: '#0F172A',
              }}
            >
              RFQ Workflow
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: '#64748B',
                mt: 0.3,
              }}
            >
              Vendor quotation lifecycle tracking
            </Typography>
          </Box>

          <IconButton onClick={() => setOpenFlow(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            p: 2,
            overflow: 'auto',
            flex: 1,
          }}
        >
          <RFQProcessFlow />
        </Box>
      </Drawer>
    </Box>
  );
}

export default DetailedView;

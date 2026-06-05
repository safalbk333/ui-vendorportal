'use client';

import { Box, Button, Paper, Typography } from '@mui/material';

import React from 'react';

interface RFQHeaderCardProps {
  rfq: any;
}

function RFQHeaderCard({ rfq }: RFQHeaderCardProps) {
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        maxWidth: 900,
      }}
    >
      {/* Top Section */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography
            sx={{
              color: '#6B7280',
              fontWeight: 600,
              letterSpacing: 0.6,
              mb: 0.7,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            {rfq?.chr_rfq_code}
            <Box
              component="span"
              sx={{
                color: '#B45309',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              ({rfq?.chr_status})
            </Box>
          </Typography>

          <Typography
            color="primary"
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: 1.25,
              maxWidth: 500,
            }}
          >
            {rfq?.chr_rfq_title}
          </Typography>
        </Box>

        <Button
          sx={{ borderRadius: 0.5, fontWeight: 600 }}
          variant="outlined"
          color="primary"
          size="small"
          href="/quotations/clarifications"
        >
          Ask Clarification
        </Button>
      </Box>

      {/* Bottom Info Section */}
      <Box display="flex" gap={5} flexWrap="wrap">
        <Box>
          <Typography
            sx={{
              color: '#6B7280',
              fontWeight: 500,
              mb: 0.4,
              fontSize: '11px',
            }}
          >
            Release Date
          </Typography>

          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            {formatDate(rfq?.dt_issue_date)}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              color: '#6B7280',
              fontWeight: 500,
              mb: 0.4,
              fontSize: '11px',
            }}
          >
            Submission Deadline
          </Typography>

          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#DC2626',
              lineHeight: 1.3,
            }}
          >
            {formatDate(rfq?.dt_submission_deadline)}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              color: '#6B7280',
              fontWeight: 500,
              mb: 0.4,
              fontSize: '11px',
            }}
          >
            Request Number
          </Typography>

          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            {rfq?.request?.chr_request_number || '-'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default RFQHeaderCard;


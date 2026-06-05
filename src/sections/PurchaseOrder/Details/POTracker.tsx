import {
  Box,
  Chip,
  Step,
  Paper,
  Stack,
  Stepper,
  StepLabel,
  Typography,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import React from 'react';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import { styled } from '@mui/material/styles';
import type { PurchaseOrder } from 'src/redux/PurchaseOrder/PurchaseOrderSlice';

type PurchaseOrderTrackerProps = {
  purchaseOrder: PurchaseOrder
}

const steps = [
  {
    label: 'PO Received',
    date: '13 May 2026',
    icon: <ReceiptLongRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Accepted',
    date: '14 May 2026',
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Processing',
    date: '15 May 2026',
    icon: <ShoppingBagRoundedIcon sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Dispatched',
    date: 'Pending',
    icon: <LocalShippingRoundedIcon sx={{ fontSize: 16 }} />,
  },
];

const activeStep = 2;

const Connector = styled(StepConnector)(({ theme }) => ({
  top: 16,
  left: 'calc(-50% + 14px)',
  right: 'calc(50% + 14px)',

  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#e5e7eb',
    borderTopWidth: 2,
    borderRadius: 10,
  },

  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.primary.main,
  },

  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.primary.main,
  },
}));

const StatusIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  width: 30,
  height: 30,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: ownerState.active || ownerState.completed ? theme.palette.primary.main : '#f5f5f5',
  color: ownerState.active || ownerState.completed ? '#fff' : theme.palette.text.secondary,
  border: ownerState.active || ownerState.completed ? 'none' : '1px solid #e5e7eb',
  transition: 'all 0.2s ease',
}));

function StatusStepIcon(props: any) {
  const { active, completed, className, icon } = props;

  return (
    <StatusIconRoot ownerState={{ active, completed }} className={className}>
      {steps[Number(icon) - 1].icon}
    </StatusIconRoot>
  );
}

const PurchaseOrderTracker = ({purchaseOrder}: PurchaseOrderTrackerProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mt: 2,
      borderRadius: 1,
      border: '1px solid #e5e7eb',
      mb: 3,
    }}
  >
    {/* Header */}
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Box>
        <Typography fontSize={14} fontWeight={700}>
          Purchase Order Status
        </Typography>

        <Typography fontSize={11} color="text.secondary" mt={0.3}>
          Current progress of this PO
        </Typography>
      </Box>

      <Chip
        label="Processing"
        color="primary"
        size="small"
        sx={{
          height: 24,
          fontSize: 11,
          fontWeight: 600,
          borderRadius: '6px',
        }}
      />
    </Stack>

    {/* Stepper */}
    <Stepper alternativeLabel activeStep={activeStep} connector={<Connector />}>
      {steps.map((step) => (
        <Step key={step.label}>
          <StepLabel StepIconComponent={StatusStepIcon}>
            <Box mt={0.5}>
              <Typography fontSize={11} fontWeight={600} lineHeight={1.2}>
                {step.label}
              </Typography>

              <Typography fontSize={10} color="text.secondary" mt={0.2}>
                {step.date}
              </Typography>
            </Box>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </Paper>
);

export default PurchaseOrderTracker;

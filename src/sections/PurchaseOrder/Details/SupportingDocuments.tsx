import { Box, Chip, Stack, Avatar, IconButton, Typography } from '@mui/material';

import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import type { PurchaseOrder } from 'src/redux/PurchaseOrder/PurchaseOrderSlice';

type POSupportingDocsBoxProps = {
  purchaseOrder: PurchaseOrder
}

const attachments = [
  {
    name: 'Vendor_Quotation.pdf',
    size: '1.8 MB',
    type: 'PDF',
  },
  {
    name: 'SOW.xlsx',
    size: '860 KB',
    type: 'XLSX',
  },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return <InsertDriveFileRoundedIcon sx={{ fontSize: 18 }} />;

    case 'DOCX':
      return <DescriptionRoundedIcon sx={{ fontSize: 18 }} />;

    case 'XLSX':
      return <TableChartRoundedIcon sx={{ fontSize: 18 }} />;

    default:
      return <InsertDriveFileRoundedIcon sx={{ fontSize: 18 }} />;
  }
};

export default function POSupportingDocsBox({purchaseOrder}: POSupportingDocsBoxProps) {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 1,
        border: '1px solid #e5e7eb',
        background: '#fff',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography fontSize={14} fontWeight={700}>
            Supporting Documents
          </Typography>

          <Typography fontSize={11} color="text.secondary" mt={0.3}>
            Files attached with this purchase order
          </Typography>
        </Box>

        <Chip
          label={`${attachments.length} Files`}
          size="small"
          sx={{
            height: 24,
            fontSize: 10,
            fontWeight: 600,
            borderRadius: '6px',
            bgcolor: 'primary.main',
          }}
        />
      </Stack>

      {/* File List */}
      <Stack spacing={1}>
        {attachments.map((file) => (
          <Box
            key={file.name}
            sx={{
              p: 1.2,
              borderRadius: '14px',
              border: '1px solid #edf1f5',
              background: '#fafbfc',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: '#f5f7fa',
                borderColor: '#dbe3ea',
              },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              {/* Left */}
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: 'primary.main',
                    borderRadius: '10px',
                    color: '#fff',
                  }}
                >
                  {getFileIcon(file.type)}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontSize={12} fontWeight={600} noWrap>
                    {file.name}
                  </Typography>

                  <Stack direction="row" spacing={0.8} alignItems="center" mt={0.2}>
                    <Typography fontSize={10} color="text.secondary">
                      {file.size}
                    </Typography>

                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: '#c4cdd5',
                      }}
                    />

                    <Typography fontSize={10} color="text.secondary" fontWeight={600}>
                      {file.type}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* Download */}
              <IconButton
                size="small"
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '10px',
                  bgcolor: '#fff',
                  border: '1px solid #e5e7eb',
                  '&:hover': {
                    bgcolor: '#f4f6f8',
                  },
                }}
              >
                <DownloadRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

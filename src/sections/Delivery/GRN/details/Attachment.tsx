'use client';

import { Box, Paper, IconButton, Typography } from '@mui/material';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import React from 'react';

import type { GoodsReceipt } from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';

type AttachmentSectionProps = {
  goodsReceipt: GoodsReceipt;
};

// ==================== TYPES: Internal attachment shape ====================
interface ParsedAttachment {
  name: string;
  url: string;
  type: 'pdf' | 'excel' | 'file';
  size?: string;
}

// ==================== HELPER: Detect file type from filename/url ====================
function detectFileType(filename: string): 'pdf' | 'excel' | 'file' {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) return 'excel';
  return 'file';
}

// ==================== HELPER: Parse chr_documents field ====================
// The chr_documents field on each GoodsReceiptItemDetail can be:
//   - null         → no documents for that item
//   - A JSON string → e.g. '[{"name":"file.pdf","url":"https://..."}]'
//   - A plain URL string → treated as a single unnamed attachment
function parseDocuments(raw: string | null): ParsedAttachment[] {
  if (!raw) return [];

  // Attempt JSON parse first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((doc: any) => ({
        name: doc.name ?? doc.filename ?? 'Attachment',
        url: doc.url ?? doc.path ?? '#',
        type: detectFileType(doc.name ?? doc.filename ?? ''),
        size: doc.size ?? undefined,
      }));
    }
    // If it's a JSON object (single doc)
    if (typeof parsed === 'object' && parsed !== null) {
      return [
        {
          name: parsed.name ?? parsed.filename ?? 'Attachment',
          url: parsed.url ?? parsed.path ?? '#',
          type: detectFileType(parsed.name ?? parsed.filename ?? ''),
          size: parsed.size ?? undefined,
        },
      ];
    }
  } catch {
    // Not valid JSON — treat the raw string as a direct URL
    const filename = raw.split('/').pop() ?? 'Attachment';
    return [
      {
        name: filename,
        url: raw,
        type: detectFileType(filename),
      },
    ];
  }

  return [];
}

function AttachmentSection({ goodsReceipt }: AttachmentSectionProps) {
  // ==================== DATA: Collect attachments from all line items ====================
  // Each GoodsReceiptItem has an `item` object which contains `chr_documents`.
  // We aggregate all documents across all goods_receipt_items into a flat list.
  const attachments: ParsedAttachment[] = (goodsReceipt.goods_receipt_items ?? []).flatMap(
    (lineItem) => parseDocuments(lineItem.item?.chr_documents ?? null)
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0.5,
        border: '1px solid #E5E7EB',
        bgcolor: '#fff',
        p: 2,
        mt: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: '#6B7280',
          mb: 1.5,
          letterSpacing: 0.5,
        }}
      >
        Attachments
        {/* Show document count badge if attachments exist */}
        {attachments.length > 0 && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.8,
              py: 0.1,
              borderRadius: '10px',
              bgcolor: '#EEF2FF',
              color: '#4F46E5',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {attachments.length}
          </Box>
        )}
      </Typography>

      {/* ==================== EMPTY STATE ==================== */}
      {attachments.length === 0 ? (
        <Box
          sx={{
            py: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: '#9CA3AF',
            }}
          >
            No attachments available.
          </Typography>
        </Box>
      ) : (
        // ==================== ATTACHMENT LIST ====================
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {attachments.map((item, index) => (
            <Box
              key={index}
              sx={{
                border: '1px solid #E5E7EB',
                borderRadius: 1.5,
                p: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all .2s ease',
                '&:hover': {
                  borderColor: '#CBD5E1',
                  bgcolor: '#FAFAFA',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {/* File type icon */}
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    bgcolor:
                      item.type === 'pdf'
                        ? '#EEF2FF'
                        : item.type === 'excel'
                          ? '#ECFDF5'
                          : '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.type === 'pdf' ? (
                    <PictureAsPdfOutlinedIcon
                      sx={{
                        fontSize: 18,
                        color: '#4338CA',
                      }}
                    />
                  ) : (
                    <InsertDriveFileOutlinedIcon
                      sx={{
                        fontSize: 18,
                        color: item.type === 'excel' ? '#059669' : '#64748B',
                      }}
                    />
                  )}
                </Box>

                <Box>
                  {/* Filename — from API: chr_documents parsed name */}
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </Typography>

                  {/* File size — from API: chr_documents parsed size (optional) */}
                  {item.size && (
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        color: '#6B7280',
                        mt: 0.2,
                      }}
                    >
                      {item.size}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Download button — links to the document URL from chr_documents */}
              <IconButton
                size="small"
                component="a"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#475569',
                }}
              >
                <DownloadOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default AttachmentSection;
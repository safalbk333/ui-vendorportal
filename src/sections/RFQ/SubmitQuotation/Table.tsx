'use client';

import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { createQuotation } from 'src/redux/Quotation/Quatation';
import { useAppDispatch } from 'src/redux/hooks';
import { useRouter } from 'next/navigation';

interface RFQItemMapping {
  pk_chr_rfq_item_mapping_id: string;
  int_quantity: number;
  chr_item_description?: string;
  chr_unit_of_measure?: string | null;
  txt_notes?: string | null;

  item?: {
    pk_chr_item_id: string;
    chr_item_name: string;
    chr_item_code: string;
    txt_description?: string;
    chr_unit?: string;
  };
}

interface RFQPricingModernProps {
  rfq: any;
}

interface PricingData {
  quantity: number;
  unitPrice: number;
  taxPercentage: number;
  notes: string;
}

export default function LineItemPricing({
  rfq,
}: RFQPricingModernProps) {
  const [attachments, setAttachments] = useState<
    Record<string, string[]>
  >({});

  const [pricingData, setPricingData] = useState<
    Record<string, PricingData>
  >({});
  const dispatch=useAppDispatch()
  const router=useRouter()

  useEffect(() => {
    if (!rfq?.rfq_item_mappings) return;

    const initialData: Record<string, PricingData> = {};

    rfq.rfq_item_mappings.forEach((item: RFQItemMapping) => {
      initialData[item.pk_chr_rfq_item_mapping_id] = {
        quantity: item.int_quantity || 0,
        unitPrice: 0,
        taxPercentage: 0,
        notes: '',
      };
    });

    setPricingData(initialData);
  }, [rfq]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const files = Array.from(e.target.files || []).map(
      (file) => file.name
    );

    setAttachments((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), ...files],
    }));
  };

  const updatePricing = (
    itemId: string,
    field: keyof PricingData,
    value: any
  ) => {
    setPricingData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

const itemMappings = useMemo(
  () => rfq?.rfq_item_mappings ?? [],
  [rfq?.rfq_item_mappings]
);
const totalAmount = useMemo(
  () =>
    itemMappings.reduce(
      (sum: number, mapping: RFQItemMapping) => {
        const itemData =
          pricingData[mapping.pk_chr_rfq_item_mapping_id];

        if (!itemData) return sum;

        const subtotal =
          itemData.quantity * itemData.unitPrice;

        const taxAmount =
          (subtotal * itemData.taxPercentage) / 100;

        return sum + subtotal + taxAmount;
      },
      0
    ),
  [itemMappings, pricingData]
);

const handleSubmitQuote = async () => {
  const payload = {
    strVendorId: rfq?.eoi?.vendor?.pk_chr_vendor_id || '',

    strRfqId: rfq?.pk_chr_rfq_id || '',

    strBuyerId:
      rfq?.request?.requested_by?.pk_chr_user_id || '',

    strBuyerDetails:
      rfq?.request?.requested_by?.chr_user_name || '',

    strSellerDetails:
      rfq?.eoi?.vendor?.chr_vendor_name || '',

    strStatus: 'DRAFT',

    intTotalAmount: totalAmount || 0,

    strCurrency: 'USD',

    strIssueDate: rfq?.dt_issue_date || '',

    strDueDate: rfq?.dt_due_date || '',

    strNotes: rfq?.txt_notes || '',

    arrItems: itemMappings.map(
      (mapping: RFQItemMapping) => {
        const itemData =
          pricingData[
            mapping.pk_chr_rfq_item_mapping_id
          ];

        const quantity =
          itemData?.quantity || 0;

        const unitPrice =
          itemData?.unitPrice || 0;

        const taxPercentage =
          itemData?.taxPercentage || 0;

        const subtotal =
          quantity * unitPrice;

        const taxAmount =
          (subtotal * taxPercentage) / 100;

        const totalPrice =
          subtotal + taxAmount;

        return {
          strItemId:
            mapping?.item?.pk_chr_item_id || '',

          strItemDescription:
            mapping?.chr_item_description ||
            mapping?.item?.txt_description ||
            mapping?.item?.chr_item_name ||
            '',

          intQuantity: quantity,

          strUnitOfMeasure:
            mapping?.chr_unit_of_measure ||
            mapping?.item?.chr_unit ||
            '',

          intUnitPrice: unitPrice,

          intTaxPercentage: taxPercentage,

          intTaxAmount: taxAmount,

          intTotalPrice: totalPrice,

          strCurrency: 'USD',

          strNotes: itemData?.notes || '',
        };
      }
    ),

    strHtmlContent: '',
  };

  try {
    console.log('Quotation Payload', payload);

    await dispatch(
      createQuotation(payload)
    ).unwrap();

    router.push('/quotations');
  } catch (error) {
    console.error(
      'Failed to create quotation:',
      error
    );
  }
};

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0F172A',
            }}
          >
            Pricing & Commercials
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: '#64748B',
            }}
          >
            Manage vendor pricing and supporting
            documents
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Paper
        elevation={0}
        sx={{
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {itemMappings.length > 0 ? (
          itemMappings.map(
            (
              mapping: RFQItemMapping,
              index: number
            ) => {
              const itemData =
                pricingData[
                  mapping.pk_chr_rfq_item_mapping_id
                ];

              const subtotal =
                (itemData?.quantity || 0) *
                (itemData?.unitPrice || 0);

              const taxAmount =
                (subtotal *
                  (itemData?.taxPercentage || 0)) /
                100;

              const totalPrice =
                subtotal + taxAmount;

              return (
                <Box
                  key={
                    mapping.pk_chr_rfq_item_mapping_id
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: {
                        xs: 'column',
                        md: 'row',
                      },
                      gap: 2,
                      py: 1.5,
                    }}
                  >
                    <Box flex={1}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1.3 }}
                      >
                        <Chip
                          label={`ITEM ${
                            index + 1
                          }`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 9,
                            fontWeight: 700,
                            bgcolor: '#EEF2FF',
                            color: '#4338CA',
                            borderRadius: 1,
                          }}
                        />
                      </Stack>

                      <Box sx={{ mb: 1.2 }}>
                        <Typography
                          sx={labelStyle}
                        >
                          Item Description
                        </Typography>

                        <TextField
                          fullWidth
                          size="small"
                          value={
                            mapping.chr_item_description?.trim() ||
                            mapping.item
                              ?.txt_description ||
                            mapping.item
                              ?.chr_item_name ||
                            '-'
                          }
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={fieldStyle}
                        />
                      </Box>

                      <Stack
                        direction={{
                          xs: 'column',
                          sm: 'row',
                        }}
                        spacing={1.2}
                      >
                        <Box flex={1}>
                          <Typography
                            sx={labelStyle}
                          >
                            SKU / REF
                          </Typography>

                          <TextField
                            fullWidth
                            size="small"
                            value={
                              mapping.item
                                ?.chr_item_code ||
                              '-'
                            }
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={fieldStyle}
                          />
                        </Box>

                        <Box flex={1}>
                          <Typography
                            sx={labelStyle}
                          >
                            Quantity
                          </Typography>

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={
                              itemData?.quantity ||
                              0
                            }
                            onChange={(e) =>
                              updatePricing(
                                mapping.pk_chr_rfq_item_mapping_id,
                                'quantity',
                                Number(
                                  e.target.value
                                )
                              )
                            }
                          />
                        </Box>
                      </Stack>

                      <Box mt={1.2}>
                        <Typography
                          sx={labelStyle}
                        >
                          Unit
                        </Typography>

                        <TextField
                          fullWidth
                          size="small"
                          value={
                            mapping.chr_unit_of_measure ||
                            mapping.item
                              ?.chr_unit ||
                            '-'
                          }
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={fieldStyle}
                        />
                      </Box>

                      <Stack
                        direction={{
                          xs: 'column',
                          md: 'row',
                        }}
                        spacing={1.2}
                        mt={1.2}
                      >
                        <Box flex={1}>
                          <Typography
                            sx={labelStyle}
                          >
                            Unit Price
                          </Typography>

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={
                              itemData?.unitPrice ||
                              0
                            }
                            onChange={(e) =>
                              updatePricing(
                                mapping.pk_chr_rfq_item_mapping_id,
                                'unitPrice',
                                Number(
                                  e.target.value
                                )
                              )
                            }
                          />
                        </Box>

                        <Box flex={1}>
                          <Typography
                            sx={labelStyle}
                          >
                            Tax %
                          </Typography>

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={
                              itemData?.taxPercentage ||
                              0
                            }
                            onChange={(e) =>
                              updatePricing(
                                mapping.pk_chr_rfq_item_mapping_id,
                                'taxPercentage',
                                Number(
                                  e.target.value
                                )
                              )
                            }
                          />
                        </Box>
                      </Stack>

                      <Box mt={1.2}>
                        <Typography
                          sx={labelStyle}
                        >
                          Notes
                        </Typography>

                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          value={
                            itemData?.notes || ''
                          }
                          onChange={(e) =>
                            updatePricing(
                              mapping.pk_chr_rfq_item_mapping_id,
                              'notes',
                              e.target.value
                            )
                          }
                        />
                      </Box>

                      <Box mt={1.5}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#0F172A',
                          }}
                        >
                          Item Total : $
                          {totalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        width: {
                          xs: '100%',
                          md: 220,
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: {
                          xs: 'none',
                          md: '1px solid #F1F5F9',
                        },
                        pl: {
                          xs: 0,
                          md: 1.5,
                        },
                      }}
                    >
                      <Button
                        component="label"
                        variant="outlined"
                        fullWidth
                      >
                        Add Attachments

                        <input
                          hidden
                          type="file"
                          multiple
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              mapping.pk_chr_rfq_item_mapping_id
                            )
                          }
                        />
                      </Button>

                      {attachments[
                        mapping
                          .pk_chr_rfq_item_mapping_id
                      ]?.length > 0 && (
                        <Box mt={1}>
                          <Stack spacing={1}>
                            {attachments[
                              mapping
                                .pk_chr_rfq_item_mapping_id
                            ].map(
                              (
                                file,
                                fileIndex
                              ) => (
                                <Paper
                                  key={fileIndex}
                                  sx={{
                                    p: 1,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                  >
                                    <DescriptionOutlinedIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {file}
                                    </Typography>
                                  </Stack>
                                </Paper>
                              )
                            )}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {index !==
                    itemMappings.length - 1 && (
                    <Divider />
                  )}
                </Box>
              );
            }
          )
        ) : (
          <Box py={4}>
            <Typography
              align="center"
              sx={{
                color: '#94A3B8',
                fontSize: 14,
              }}
            >
              No RFQ items found
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper
        sx={{
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 2,
          }}
        >
          Grand Total : $
          {totalAmount.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          color='primary'
          onClick={handleSubmitQuote}
          sx={{borderRadius:0.5}}
        >
          Submit Quote
        </Button>
      </Paper>
    </Box>
  );
}

const labelStyle = {
  fontSize: 12,
  color: '#94A3B8',
  fontWeight: 500,
  letterSpacing: 0.4,
  mb: 0.5,
};

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.3,
    bgcolor: '#fff',
    minHeight: 34,
  },
  '& .MuiInputBase-input': {
    fontSize: 12,
    py: 0.9,
    px: 1.2,
    color: '#0F172A',
  },
};
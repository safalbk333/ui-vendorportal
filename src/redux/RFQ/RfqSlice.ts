import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { axiosOptima } from 'src/lib/axios';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export interface RFQRequestedBy {
  pk_chr_user_id: string;
  chr_user_name: string;
  chr_user_email: string;
}

export interface RFQVendor {
  pk_chr_vendor_id: string;
  chr_vendor_name: string;
}

export interface RFQRequest {
  pk_chr_request_id: string;
  chr_request_number: string;
  chr_title: string;
  requested_by?: RFQRequestedBy;
}

export interface RFQEOI {
  pk_chr_eoi_id: string;
  chr_eoi_code: string;
  chr_eoi_title: string;
  vendor?: RFQVendor;
}

export interface RFQItem {
  pk_chr_item_id: string;
  chr_item_name: string;
  chr_item_code: string;
  txt_description: string;
  fk_chr_category_id: string;
  chr_unit: string;
  chr_documents: string | null;
  tim_created: string;
  tim_modified: string | null;
  fk_chr_created_id: string | null;
  fk_chr_modified_id: string | null;
  chr_document_status: string;
}

export interface RFQItemMapping {
  pk_chr_rfq_item_mapping_id: string;
  fk_chr_rfq_id: string;
  fk_chr_item_id: string;
  chr_item_description: string;
  int_quantity: number;
  chr_unit_of_measure: string | null;
  flt_estimated_unit_price: number | null;
  flt_total_price: number | null;
  txt_notes: string | null;
  tim_created: string;
  tim_modified: string | null;
  fk_chr_created_id: string | null;
  fk_chr_modified_id: string | null;
  chr_document_status: string;
  item: RFQItem;
}

export interface RFQ {
  pk_chr_rfq_id: string;
  chr_rfq_code: string;
  chr_rfq_title: string;
  fk_chr_request_id: string;
  fk_chr_eoi_id: string;
  chr_status: string;
  dt_issue_date: string;
  dt_due_date: string;
  dt_submission_deadline: string;
  txt_notes: string | null;
  tim_created: string;
  tim_modified: string | null;
  fk_chr_created_id: string | null;
  fk_chr_modified_id: string | null;
  txt_rendered_html: string | null;
  chr_document_status: string;
attachments:any;
  request: RFQRequest;
  eoi: RFQEOI;

  quotations: any[];
  rfq_item_mappings: RFQItemMapping[];
}

// ----------------------------------------------------------------------
// CREATE PAYLOAD
// ----------------------------------------------------------------------

export interface CreateRFQPayload {
  strRfqCode: string;
  strRfqTitle: string;
  strRequestId: string;
  strEoiId: string;
  strStatus: string;
  strIssueDate: string;
  strDueDate: string | null;
  strSubmissionDeadline: string | null;
  strNotes: string;
  strCreatedId: string;

  arrItems: {
    strItemId: string;
    intQuantity: number;
  }[];
}

// ----------------------------------------------------------------------
// STATE
// ----------------------------------------------------------------------

interface RFQState {
  data: RFQ[];
  selectedRFQ: RFQ | null;

  loading: boolean;
  createLoading: boolean;
  getByIdLoading: boolean;

  error: string | null;
}

const initialState: RFQState = {
  data: [],
  selectedRFQ: null,

  loading: false,
  createLoading: false,
  getByIdLoading: false,

  error: null,
};

// ----------------------------------------------------------------------
// GET ALL RFQs
// ----------------------------------------------------------------------

export const fetchRFQs = createAsyncThunk(
  'rfq/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosOptima.get('/request-for-quotation');

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to fetch RFQs'
      );
    }
  }
);

// ----------------------------------------------------------------------
// GET RFQ BY ID
// ----------------------------------------------------------------------

export const fetchRFQById = createAsyncThunk(
  'rfq/fetchById',
  async (rfqId: string, { rejectWithValue }) => {
    try {
      const response = await axiosOptima.get(
        `/request-for-quotation/${rfqId}`
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to fetch RFQ'
      );
    }
  }
);

// ----------------------------------------------------------------------
// CREATE RFQ
// ----------------------------------------------------------------------

export const createRFQ = createAsyncThunk(
  'rfq/create',
  async (payload: CreateRFQPayload, { rejectWithValue }) => {
    try {
      const response = await axiosOptima.post(
        '/request-for-quotation',
        payload
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to create RFQ'
      );
    }
  }
);

// ----------------------------------------------------------------------
// SLICE
// ----------------------------------------------------------------------

const rfqSlice = createSlice({
  name: 'rfq',
  initialState,

  reducers: {
    clearRFQs: (state) => {
      state.data = [];
      state.error = null;
    },

    clearRFQError: (state) => {
      state.error = null;
    },

    clearSelectedRFQ: (state) => {
      state.selectedRFQ = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================
      // FETCH RFQs
      // ==========================

      .addCase(fetchRFQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchRFQs.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================
      // FETCH RFQ BY ID
      // ==========================

      .addCase(fetchRFQById.pending, (state) => {
        state.getByIdLoading = true;
        state.error = null;
      })

      .addCase(fetchRFQById.fulfilled, (state, action) => {
        state.getByIdLoading = false;
        state.selectedRFQ = action.payload;
      })

      .addCase(fetchRFQById.rejected, (state, action: any) => {
        state.getByIdLoading = false;
        state.error = action.payload;
      })

      // ==========================
      // CREATE RFQ
      // ==========================

      .addCase(createRFQ.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })

      .addCase(createRFQ.fulfilled, (state, action) => {
        state.createLoading = false;

        if (action.payload) {
          state.data.unshift(action.payload);
        }
      })

      .addCase(createRFQ.rejected, (state, action: any) => {
        state.createLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearRFQs,
  clearRFQError,
  clearSelectedRFQ,
} = rfqSlice.actions;

export default rfqSlice.reducer;
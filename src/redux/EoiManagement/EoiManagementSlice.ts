import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosOptima } from 'src/lib/axios';

// ==================== TYPES ====================

export interface EoiRequest {
    pk_chr_request_id: string;
    chr_request_number: string;
    chr_title: string;
    txt_description: string;
    fk_chr_current_status_id: string;
    fk_chr_priority_id: string;
    flt_estimated_value: number;
    chr_currency: string;
    fk_chr_requested_by_id: string;
    fk_chr_department_id: string;
    fk_chr_category_id: string;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string;
    fk_chr_modified_id: string | null;
    chr_document_status: string;
}

export interface EoiVendor {
    pk_chr_vendor_id: string;
    chr_vendor_name: string;
    chr_vendor_email: string;
    chr_vendor_phone: string;
    fk_chr_country_id: string | null;
    fk_chr_city_id: string | null;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string | null;
    fk_chr_modified_id: string | null;
    fk_chr_company_id: string;
    chr_document_status: string;
}

export interface Eoi {
    pk_chr_eoi_id: string;
    chr_eoi_code: string;
    chr_eoi_title: string;
    fk_chr_request_id: string;
    fk_chr_vendor_id: string;
    chr_status: string;
    txt_notes: string;
    dt_submission_deadline: string;
    dt_submitted_at: string;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string;
    fk_chr_modified_id: string | null;
    chr_document_status: string;
    request: EoiRequest;
    vendor: EoiVendor;
}

interface EoiManagementState {
    data: Eoi[];
    loading: boolean;
    error: string | null;
}

// ==================== INITIAL STATE ====================

const initialState: EoiManagementState = {
    data: [],
    loading: false,
    error: null,
};

// ==================== ASYNC THUNKS ====================

// GET ALL EOIs - GET /eoi
export const fetchEois = createAsyncThunk(
    'eoiManagement/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get('/eoi');

            console.log('EOIs fetched successfully:', response.data);

            return response.data.data; // Returns array of Eois
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch Expressions of Interest'
            );
        }
    }
);

// ==================== SLICE ====================

const eoiManagementSlice = createSlice({
    name: 'eoiManagement',
    initialState,
    reducers: {
        clearEois: (state) => {
            state.data = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All EOIs
            .addCase(fetchEois.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEois.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEois.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearEois } = eoiManagementSlice.actions;

export default eoiManagementSlice.reducer;
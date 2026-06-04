import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosOptima } from 'src/lib/axios';

// TYPES
export interface Vendor {
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

interface VendorManagementState {
    data: Vendor[];
    loading: boolean;
    error: string | null;
}

// Initial State
const initialState: VendorManagementState = {
    data: [],
    loading: false,
    error: null,
};

// GET ALL VENDORS
export const fetchVendors = createAsyncThunk(
    'vendorManagement/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get('/vendor');

            console.log(response.data);

            return response.data.data; // Returns the array of vendors
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch vendors'
            );
        }
    }
);

const vendorManagementSlice = createSlice({
    name: 'vendorManagement',
    initialState,
    reducers: {
        clearVendors: (state) => {
            state.data = [];
            state.error = null;
        },
        // Optional: Add more reducers if needed (e.g., addVendor, updateVendor, etc.)
    },
    extraReducers: (builder) => {
        builder
            // Fetch Vendors
            .addCase(fetchVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchVendors.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearVendors } = vendorManagementSlice.actions;

export default vendorManagementSlice.reducer;
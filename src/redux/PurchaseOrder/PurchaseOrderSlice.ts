import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosOptima } from 'src/lib/axios';

// ==================== TYPES ====================

export interface PurchaseOrderRequest {
    pk_chr_request_id: string;
    chr_request_number: string;
    chr_title: string;
}

export interface PurchaseOrderVendor {
    pk_chr_vendor_id: string;
    chr_vendor_name: string;
    chr_vendor_email: string;
}

export interface PurchaseOrderQuotation {
    pk_chr_quotation_id: string;
    chr_status: string;
}

export interface PurchaseOrder {
    pk_chr_purchase_order_id: string;
    fk_chr_request_id: string;
    chr_po_number: string;
    fk_chr_vendor_id: string;
    flt_total_value: number;
    chr_currency: string;
    dt_issued_at: string;
    chr_delivery_address: string;
    dt_expected_delivery: string;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string;
    fk_chr_modified_id: string | null;
    chr_document_status: string;
    fk_chr_quotation_id: string;
    txt_rendered_html: string;

    // Nested relations
    request: PurchaseOrderRequest;
    vendor: PurchaseOrderVendor;
    quotation: PurchaseOrderQuotation;
}

interface PurchaseOrderState {
    data: PurchaseOrder[];                    // List of all purchase orders
    selectedPurchaseOrder: PurchaseOrder | null; // Single purchase order detail
    loading: boolean;
    detailLoading: boolean;                   // Separate loading for detail view
    error: string | null;
    detailError: string | null;
}

// ==================== INITIAL STATE ====================

const initialState: PurchaseOrderState = {
    data: [],
    selectedPurchaseOrder: null,
    loading: false,
    detailLoading: false,
    error: null,
    detailError: null,
};

// ==================== ASYNC THUNKS ====================

// GET ALL PURCHASE ORDERS
export const fetchPurchaseOrders = createAsyncThunk(
    'purchaseOrder/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get('/purchase-order');

            console.log('Purchase Orders Response:', response.data);

            return response.data.data as PurchaseOrder[];
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch purchase orders'
            );
        }
    }
);

// GET SINGLE PURCHASE ORDER BY ID
export const fetchPurchaseOrderById = createAsyncThunk(
    'purchaseOrder/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get(`/purchase-order/${id}`);

            console.log('Purchase Order Detail Response:', response.data);

            return response.data.data as PurchaseOrder;
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch purchase order details'
            );
        }
    }
);

// ==================== SLICE ====================

const purchaseOrderSlice = createSlice({
    name: 'purchaseOrder',
    initialState,
    reducers: {
        clearPurchaseOrders: (state) => {
            state.data = [];
            state.error = null;
        },
        
        clearSelectedPurchaseOrder: (state) => {
            state.selectedPurchaseOrder = null;
            state.detailError = null;
        },

        // Optional: Reset all state
        resetPurchaseOrderState: (state) => {
            state.data = [];
            state.selectedPurchaseOrder = null;
            state.error = null;
            state.detailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Purchase Orders
            .addCase(fetchPurchaseOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchPurchaseOrders.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Single Purchase Order by ID
            .addCase(fetchPurchaseOrderById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedPurchaseOrder = action.payload;
            })
            .addCase(fetchPurchaseOrderById.rejected, (state, action: any) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            });
    },
});

export const { 
    clearPurchaseOrders, 
    clearSelectedPurchaseOrder,
    resetPurchaseOrderState 
} = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;
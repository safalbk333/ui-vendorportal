import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosOptima } from 'src/lib/axios';

// ==================== TYPES ====================

export interface GoodsReceiptItemDetail {
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

export interface GoodsReceiptItem {
    pk_chr_gri_id: string;
    fk_chr_goods_receipt_id: string;
    fk_chr_item_id: string;
    int_quantity_ordered: number;
    int_quantity_received: number;
    int_quantity_rejected: number;
    chr_unit_of_measure: string;
    txt_rejection_reason: string;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string | null;
    fk_chr_modified_id: string | null;
    chr_document_status: string;
    item: GoodsReceiptItemDetail;
}

export interface GoodsReceiptPurchaseOrder {
    pk_chr_purchase_order_id: string;
    chr_po_number: string;
}

export interface GoodsReceipt {
    pk_chr_goods_receipt_id: string;
    chr_grn_code: string;
    fk_chr_purchase_order_id: string;
    chr_status: string;
    dt_received_at: string;
    chr_delivery_note_no: string;
    txt_notes: string;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string;
    fk_chr_modified_id: string | null;
    txt_rendered_html: string | null;
    chr_document_status: string;

    // Nested relations
    purchase_order: GoodsReceiptPurchaseOrder;
    goods_receipt_items: GoodsReceiptItem[];
}

interface GoodsReceiptState {
    data: GoodsReceipt[];                    // List of all goods receipts
    selectedGoodsReceipt: GoodsReceipt | null; // Single goods receipt detail
    loading: boolean;
    detailLoading: boolean;
    error: string | null;
    detailError: string | null;
}

// ==================== INITIAL STATE ====================

const initialState: GoodsReceiptState = {
    data: [],
    selectedGoodsReceipt: null,
    loading: false,
    detailLoading: false,
    error: null,
    detailError: null,
};

// ==================== ASYNC THUNKS ====================

// GET ALL GOODS RECEIPTS
export const fetchGoodsReceipts = createAsyncThunk(
    'goodsReceipt/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get('/goods-receipt');

            console.log('Goods Receipts Response:', response.data);

            return response.data.data as GoodsReceipt[];
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch goods receipts'
            );
        }
    }
);

// GET SINGLE GOODS RECEIPT BY ID
export const fetchGoodsReceiptById = createAsyncThunk(
    'goodsReceipt/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get(`/goods-receipt/${id}`);

            console.log('Goods Receipt Detail Response:', response.data);

            return response.data.data as GoodsReceipt;
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch goods receipt details'
            );
        }
    }
);

// ==================== SLICE ====================

const goodsReceiptSlice = createSlice({
    name: 'goodsReceipt',
    initialState,
    reducers: {
        clearGoodsReceipts: (state) => {
            state.data = [];
            state.error = null;
        },

        clearSelectedGoodsReceipt: (state) => {
            state.selectedGoodsReceipt = null;
            state.detailError = null;
        },

        // Optional: Reset all state
        resetGoodsReceiptState: (state) => {
            state.data = [];
            state.selectedGoodsReceipt = null;
            state.error = null;
            state.detailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Goods Receipts
            .addCase(fetchGoodsReceipts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGoodsReceipts.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchGoodsReceipts.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Single Goods Receipt by ID
            .addCase(fetchGoodsReceiptById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchGoodsReceiptById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedGoodsReceipt = action.payload;
            })
            .addCase(fetchGoodsReceiptById.rejected, (state, action: any) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            });
    },
});

export const { 
    clearGoodsReceipts, 
    clearSelectedGoodsReceipt,
    resetGoodsReceiptState 
} = goodsReceiptSlice.actions;

export default goodsReceiptSlice.reducer;
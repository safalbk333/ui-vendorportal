import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { axiosOptima } from 'src/lib/axios';

// TYPES
export interface Contract {
    pk_chr_contract_id: string;
    chr_contract_code?: string; // Added this field based on response
    chr_title: string;
    txt_description: string;
    chr_status: string;
    dt_start_date: string;
    dt_end_date: string;
    flt_value: number;
    fk_chr_vendor_id: string;
    fk_chr_request_id: string | null;
    tim_created: string;
    tim_modified: string | null;
    fk_chr_created_id: string | null;
    fk_chr_modified_id: string | null;
    chr_document_status: string;
}

export interface CreateContractRequest {
    contractCode: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    value: number;
    vendorId: string;
}

interface ContractManagementState {
    data: Contract[];
    loading: boolean;
    error: string | null;
    creating: boolean;
    createError: string | null;
    // New state for single contract fetch
    currentContract: Contract | null;
    fetchingContract: boolean;
    fetchContractError: string | null;
}

const initialState: ContractManagementState = {
    data: [],
    loading: false,
    error: null,
    creating: false,
    createError: null,
    currentContract: null,
    fetchingContract: false,
    fetchContractError: null,
};

// GET ALL CONTRACTS
export const fetchContracts = createAsyncThunk(
    'contractManagement/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get('/contract');

            console.log(response.data);

            return response.data.data; // Returns the array of contracts
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch contracts'
            );
        }
    }
);

// GET SINGLE CONTRACT BY ID (GET /contract/{id})
export const fetchContractById = createAsyncThunk(
    'contractManagement/fetchById',
    async (contractId: string, { rejectWithValue }) => {
        try {
            const response = await axiosOptima.get(`/contract/${contractId}`);

            console.log('Contract fetched successfully:', response.data);

            // The API returns the contract data inside the data property
            return response.data.data; // Returns the single contract object
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to fetch contract'
            );
        }
    }
);

// CREATE CONTRACT (POST /contract)
export const createContract = createAsyncThunk(
    'contractManagement/create',
    async (contractData: CreateContractRequest, { rejectWithValue }) => {
        try {
            const payload = {
                contractCode: contractData.contractCode,
                title: contractData.title,
                description: contractData.description,
                startDate: contractData.startDate,
                endDate: contractData.endDate,
                value: contractData.value,
                vendorId: contractData.vendorId,
                chr_status: 'Draft',
                chr_document_status: 'Pending',
                // strHtmlContent removed as it's not in the provided request body
            };

            const response = await axiosOptima.post('/contract', payload);

            console.log('Contract created successfully:', response.data);

            return response.data.data; // Return the newly created contract
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message || 'Failed to create contract'
            );
        }
    }
);

const contractManagementSlice = createSlice({
    name: 'contractManagement',
    initialState,
    reducers: {
        clearContracts: (state) => {
            state.data = [];
            state.error = null;
        },
        clearCreateState: (state) => {
            state.creating = false;
            state.createError = null;
        },
        // Clear current contract from state
        clearCurrentContract: (state) => {
            state.currentContract = null;
            state.fetchContractError = null;
        },
        // Optional: Add more reducers if needed (e.g., addContract, updateContract, etc.)
    },
    extraReducers: (builder) => {
        builder
            // Fetch Contracts
            .addCase(fetchContracts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContracts.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchContracts.rejected, (state, action: any) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Single Contract by ID
            .addCase(fetchContractById.pending, (state) => {
                state.fetchingContract = true;
                state.fetchContractError = null;
                state.currentContract = null;
            })
            .addCase(fetchContractById.fulfilled, (state, action) => {
                state.fetchingContract = false;
                state.currentContract = action.payload;
            })
            .addCase(fetchContractById.rejected, (state, action: any) => {
                state.fetchingContract = false;
                state.fetchContractError = action.payload;
            })

            // Create Contract
            .addCase(createContract.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createContract.fulfilled, (state, action) => {
                state.creating = false;
                // Add the newly created contract to the list
                state.data.unshift(action.payload); // Add at the beginning
            })
            .addCase(createContract.rejected, (state, action: any) => {
                state.creating = false;
                state.createError = action.payload;
            });
    },
});

export const { clearContracts, clearCreateState, clearCurrentContract } = contractManagementSlice.actions;

export default contractManagementSlice.reducer;
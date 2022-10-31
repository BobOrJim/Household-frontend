import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  isAnyOf,
  isRejectedWithValue,
  PayloadAction,
  Reducer,
} from "@reduxjs/toolkit";
import { Profile } from "../profile/profileTypes";
import { Household, HouseholdCreateDto, HouseholdEditDto } from "./householdTypes";
import { useAppSelector } from "../../hooks/reduxHooks";
import { selectToken } from "../authentication/authenticationSelectors";
import {
  deleteProfile,
  DeleteProfilePayloadAction,
  editProfile,
  EditProfilePayloadAction,
} from "../profile/profileSlice";

const baseUrl = "https://household-backend.azurewebsites.net/api/V01/Household/";

const Token = () => useAppSelector(selectToken);

export const hydrateHouseholdSliceFromBackendThunk = createAsyncThunk<
  Household,
  string,
  { rejectValue: string }
>("household/getHousehold", async (householdId: string, thunkApi) => {
  const response = await fetch(baseUrl + "GetHouseholdById/" + householdId);
  if (response.ok) {
    const household = await response.json();
    thunkApi.dispatch(getProfilesByHouseholdId(household.id));
    return household as Household;
  } else {
    return thunkApi.rejectWithValue(JSON.stringify(response.body));
  }
});

export const createHouseholdThunk = createAsyncThunk<
  Household,
  HouseholdCreateDto,
  { rejectValue: string }
>("household/CreateHousehold", async (householdCreateDto: HouseholdCreateDto, thunkApi) => {
  if (Token()) {
    return thunkApi.rejectWithValue("User not logged in");
  }
  try {
    const response = await fetch(baseUrl + "createHousehold", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + Token(),
      },
      body: JSON.stringify(householdCreateDto),
    });

    if (response.ok) {
      return (await response.json()) as Household;
    }

    return thunkApi.rejectWithValue(JSON.stringify(response.body));
  } catch (err) {
    if (err instanceof Error) {
      return thunkApi.rejectWithValue(err.message);
    } else {
      return thunkApi.rejectWithValue("");
    }
  }
});

export const editHouseholdThunk = createAsyncThunk<
  Household,
  { householdEditDto: HouseholdEditDto; householdId: string },
  { rejectValue: string }
>("household/EditHousehold", async ({ householdEditDto, householdId }, thunkApi) => {
/*   if (Token()) {
    return thunkApi.rejectWithValue("User not logged in");
  } */
  try {
    const response = await fetch(baseUrl + "EditHousehold/" + householdId, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        //authorization: "Bearer " + Token(),
      },
      body: JSON.stringify(householdEditDto),
    });

    if (response.ok) {
      return (await response.json()) as Household;
    }

    return thunkApi.rejectWithValue(JSON.stringify(response.body));
  } catch (err) {
    if (err instanceof Error) {
      return thunkApi.rejectWithValue(err.message);
    } else {
      return thunkApi.rejectWithValue("");
    }
  }
});

export const deleteHouseholdThunk = createAsyncThunk<Household, string, { rejectValue: string }>(
  "household/deleteHousehold",
  async (householdId: string, thunkApi) => {
    if (Token()) {
      return thunkApi.rejectWithValue("User not logged in");
    }
    try {
      const response = await fetch(baseUrl + "deleteHousehold/" + householdId, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + Token(),
        },
      });

      if (response.status == 204) {
        return {} as Household;
      }

      return thunkApi.rejectWithValue(JSON.stringify(response.body));
    } catch (err) {
      if (err instanceof Error) {
        return thunkApi.rejectWithValue(err.message);
      } else {
        return thunkApi.rejectWithValue("");
      }
    }
  },
);

export const getProfilesByHouseholdId = createAsyncThunk<
  Profile[],
  string,
  { rejectValue: string }
>("household/getProfilesByHouseholdId", async (householdId: string, thunkApi) => {
  try {
    const response = await fetch(
      "https://household-backend.azurewebsites.net/api/V01/profile/GetByHouseholdId/" + householdId,
    );
    if (response.ok) {
      return await response.json();
    } else {
      return isRejectedWithValue(response.status);
    }
  } catch (err) {
    if (err instanceof Error) {
      return thunkApi.rejectWithValue(err.message);
    } else {
      return thunkApi.rejectWithValue("Unknown error in getProfilesByHouseholdId");
    }
  }
});

interface HouseholdState {
  error: string;
  isLoading: boolean;
  profiles: Profile[];
  household: Household;
}

const initialState: HouseholdState = {
  household: {} as Household,
  error: "",
  isLoading: false,
  profiles: [],
};

const householdSlice = createSlice({
  name: "household",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(hydrateHouseholdSliceFromBackendThunk.fulfilled, (state, action) => {
      state.household = action.payload;
    }),
      builder.addCase(createHouseholdThunk.fulfilled, (state, action) => {
        state.household.name = action.payload.name;
      }),
      builder.addCase(editHouseholdThunk.fulfilled, (state, action) => {
        state.household.name = action.payload.name;
      }),
      builder.addCase(deleteHouseholdThunk.fulfilled, (state, action) => {
        state.household.id = action.payload.id;
      }),
      builder.addCase(getProfilesByHouseholdId.fulfilled, (state, action) => {
        state.profiles = action.payload;
      }),
      builder.addCase(
        editProfile.fulfilled,
        (state, action: PayloadAction<EditProfilePayloadAction>) => {
          state.profiles = state.profiles.map((p) =>
            p.id === action.payload.profile.id ? action.payload.profile : p,
          );
        },
      ),
      builder.addCase(
        deleteProfile.fulfilled,
        (state, action: PayloadAction<DeleteProfilePayloadAction>) => {
          state.profiles = state.profiles.filter((p) => p.id !== action.payload.profileId);
        },
      ),
      builder.addMatcher(
        isAnyOf(
          editHouseholdThunk.pending,
          deleteHouseholdThunk.pending,
          createHouseholdThunk.pending,
          editHouseholdThunk.pending,
          hydrateHouseholdSliceFromBackendThunk.pending,
        ),
        (state, _) => {
          state.isLoading = true;
        },
      ),
      builder.addMatcher(
        isAnyOf(
          editHouseholdThunk.rejected,
          deleteHouseholdThunk.rejected,
          createHouseholdThunk.rejected,
          editHouseholdThunk.rejected,
          hydrateHouseholdSliceFromBackendThunk.rejected,
        ),
        (state, action) => {
          if (action.payload) {
            state.error = action.payload;
          }
          state.isLoading = false;
        },
      ),
      builder.addMatcher(
        isAnyOf(
          editHouseholdThunk.fulfilled,
          deleteHouseholdThunk.fulfilled,
          createHouseholdThunk.fulfilled,
          editHouseholdThunk.fulfilled,
          hydrateHouseholdSliceFromBackendThunk.fulfilled,
        ),
        (state) => {
          state.isLoading = false;
        },
      );
  },
});

export const householdReducer: Reducer<HouseholdState, AnyAction> = householdSlice.reducer;

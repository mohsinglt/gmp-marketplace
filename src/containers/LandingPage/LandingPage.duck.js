import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as log from '../../util/log';
import { isForbiddenError, storableError } from '../../util/errors';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';

export const ASSET_NAME = 'landing-page';

// Global Marketplace: the listing type agencies and freelancers use to list their services.
export const AGENCY_LISTING_TYPE = 'agency-services';

// One query feeds the hero cards, the category counts and the featured agencies.
// 100 is the Marketplace API page size limit; plenty for the counts at this stage.
const AGENCY_QUERY_PER_PAGE = 100;

// ================ Async Thunks ================ //

const fetchHomeAgenciesPayloadCreator = async (_, thunkAPI) => {
  const { extra: sdk, rejectWithValue, dispatch } = thunkAPI;

  return sdk.listings
    .query({
      pub_listingType: AGENCY_LISTING_TYPE,
      perPage: AGENCY_QUERY_PER_PAGE,
      page: 1,
      include: ['author', 'author.profileImage', 'images'],
      'fields.listing': ['title', 'description', 'publicData', 'state', 'deleted'],
      'fields.user': ['profile.displayName', 'profile.abbreviatedName', 'profile.publicData'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
      ...createImageVariantConfig('square-small', 120, 1),
      ...createImageVariantConfig('square-small2x', 240, 1),
      'limit.images': 1,
    })
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      const listingIds = response.data.data.map(l => l.id);
      return { listingIds };
    })
    .catch(error => {
      // A private marketplace or a user pending approval gets 403 here. That is expected:
      // the home page then simply shows no agency cards.
      log.error(error, 'home-agencies-fetch-failed', {}, { skipSentry: isForbiddenError(error) });
      return rejectWithValue(storableError(error));
    });
};

export const fetchHomeAgencies = createAsyncThunk(
  'LandingPage/fetchHomeAgencies',
  fetchHomeAgenciesPayloadCreator
);

// ================ Slice ================ //

const initialState = {
  agencyIds: [],
  agenciesInProgress: false,
  agenciesError: null,
};

const landingPageSlice = createSlice({
  name: 'LandingPage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchHomeAgencies.pending, state => {
        state.agenciesInProgress = true;
        state.agenciesError = null;
      })
      .addCase(fetchHomeAgencies.fulfilled, (state, action) => {
        state.agenciesInProgress = false;
        state.agencyIds = action.payload.listingIds;
      })
      .addCase(fetchHomeAgencies.rejected, (state, action) => {
        state.agenciesInProgress = false;
        state.agenciesError = action.payload;
      });
  },
});

export default landingPageSlice.reducer;

// ================ Load data ================ //

export const loadData = (params, search) => dispatch => {
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };
  return Promise.all([
    dispatch(fetchPageAssets(pageAsset, true)),
    // The agency query must never block the page from rendering.
    dispatch(fetchHomeAgencies()).catch(() => null),
  ]);
};

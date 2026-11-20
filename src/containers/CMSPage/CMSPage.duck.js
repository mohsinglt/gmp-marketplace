import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { fetchHomeAgencies } from '../LandingPage/LandingPage.duck';

// Global Marketplace: coded pages that also show live agency data.
const PAGES_WITH_AGENCIES = ['services', 'for-agencies'];

export const loadData = (params, search) => dispatch => {
  const pageId = params.pageId;
  const pageAsset = { [pageId]: `content/pages/${pageId}.json` };
  const hasFallbackContent = false;
  const assets = dispatch(fetchPageAssets(pageAsset, hasFallbackContent));
  if (PAGES_WITH_AGENCIES.includes(pageId)) {
    return Promise.all([assets, dispatch(fetchHomeAgencies()).catch(() => null)]);
  }
  return assets;
};

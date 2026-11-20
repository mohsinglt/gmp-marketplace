import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { getFeaturedListingsProps } from '../../util/data';

import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
import GmpServicesPage from '../GmpPages/GmpServicesPage';
import GmpHowItWorksPage from '../GmpPages/GmpHowItWorksPage';
import GmpForAgenciesPage from '../GmpPages/GmpForAgenciesPage';
import GmpFaqPage from '../GmpPages/GmpFaqPage';

// Global Marketplace: these pages use coded designs that match the approved prototype.
// Their SEO title and description still come from Console > Pages. Other pages
// (terms, privacy, any new page) keep using the Console page builder.
const GMP_PAGES = {
  services: GmpServicesPage,
  about: GmpHowItWorksPage,
  'for-agencies': GmpForAgenciesPage,
  faqs: GmpFaqPage,
};
const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const CMSPageComponent = props => {
  const { params, pageAssetsData, inProgress, error, agencyListings } = props;
  const pageId = params.pageId || props.pageId;

  const GmpPage = GMP_PAGES[pageId];
  if (GmpPage) {
    return <GmpPage pageData={pageAssetsData?.[pageId]?.data} agencyListings={agencyListings} />;
  }

  if (!inProgress && error?.status === 404) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  return (
    <PageBuilder
      pageAssetsData={pageAssetsData?.[pageId]?.data}
      inProgress={inProgress}
      schemaType="Article"
      featuredListings={getFeaturedListingsProps(pageId, props)}
    />
  );
};

CMSPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const featuredListingData = state.featuredListings || {};

  const getListingEntitiesById = listingIds => getListingsById(state, listingIds);
  const { agencyIds = [] } = state.LandingPage || {};
  const agencyListings = getListingsById(state, agencyIds);

  return {
    pageAssetsData,
    featuredListingData,
    getListingEntitiesById,
    inProgress,
    error,
    agencyListings,
  };
};

const mapDispatchToProps = dispatch => ({
  onFetchFeaturedListings: (sectionId, parentPage, listingImageConfig, allSections) =>
    dispatch(fetchFeaturedListings({ sectionId, parentPage, listingImageConfig, allSections })),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const CMSPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(CMSPageComponent);

export default CMSPage;

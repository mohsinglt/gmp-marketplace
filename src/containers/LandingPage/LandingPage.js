import React from 'react';

import { bool, object, array } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';
import { getListingsById } from '../../ducks/marketplaceData.duck';

import { LayoutComposer, StaticPage } from '../PageBuilder/PageBuilder';
import { validProps } from '../PageBuilder/Field';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import FallbackPage from './FallbackPage';
import GmpHome from './GmpHome/GmpHome';
import { ASSET_NAME } from './LandingPage.duck';

// SEO title and description still come from Console > Pages > landing-page > SEO & Social.
const getMeta = pageData => {
  const { pageTitle, pageDescription, socialSharing } = pageData?.meta || {};
  return {
    title: validProps(pageTitle)?.content,
    description: validProps(pageDescription)?.content,
    socialSharing: validProps(socialSharing),
  };
};

/**
 * Global Marketplace landing page. The content is a coded design (GmpHome) instead of
 * Console page sections, so it can match the approved prototype exactly.
 */
export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error, agencyListings } = props;
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  if (!pageData && !inProgress && error) {
    return <FallbackPage error={error} />;
  }

  const layoutAreas = `
    topbar
    main
    footer
  `;

  return (
    <StaticPage {...getMeta(pageData)}>
      <LayoutComposer areas={layoutAreas}>
        {layoutProps => {
          const { Topbar, Main, Footer } = layoutProps;
          return (
            <>
              <Topbar as="header">
                <TopbarContainer currentPage="LandingPage" />
              </Topbar>
              <Main as="main" id="main-content">
                <GmpHome agencyListings={agencyListings} />
              </Main>
              <Footer>
                <FooterContainer />
              </Footer>
            </>
          );
        }}
      </LayoutComposer>
    </StaticPage>
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
  agencyListings: array,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const { agencyIds = [] } = state.LandingPage || {};
  const agencyListings = getListingsById(state, agencyIds);
  return { pageAssetsData, inProgress, error, agencyListings };
};

const LandingPage = compose(connect(mapStateToProps))(LandingPageComponent);

export default LandingPage;

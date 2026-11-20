import React from 'react';

import { LayoutComposer, StaticPage } from '../PageBuilder/PageBuilder';
import { validProps } from '../PageBuilder/Field';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

// SEO title, description and social image still come from the page's Console asset.
export const getPageMeta = pageData => {
  const { pageTitle, pageDescription, socialSharing } = pageData?.meta || {};
  return {
    title: validProps(pageTitle)?.content,
    description: validProps(pageDescription)?.content,
    socialSharing: validProps(socialSharing),
  };
};

/**
 * Page frame for the coded Global Marketplace pages: top bar, main content and footer.
 *
 * @component
 * @param {Object} props
 * @param {Object?} props.pageData hosted page asset data (used for SEO meta only)
 * @param {string?} props.currentPage route name for the top bar's active state
 * @param {ReactNode} props.children page content
 * @returns {JSX.Element}
 */
const GmpLayout = props => {
  const { pageData, currentPage, children } = props;
  const layoutAreas = `
    topbar
    main
    footer
  `;
  return (
    <StaticPage {...getPageMeta(pageData)}>
      <LayoutComposer areas={layoutAreas}>
        {layoutProps => {
          const { Topbar, Main, Footer } = layoutProps;
          return (
            <>
              <Topbar as="header">
                <TopbarContainer currentPage={currentPage} />
              </Topbar>
              <Main as="main" id="main-content">
                {children}
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

export default GmpLayout;

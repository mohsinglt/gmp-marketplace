import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { LandingPageComponent } from './LandingPage';

const { waitFor } = testingLibrary;

describe('LandingPage', () => {
  it('renders the Fallback page on error', async () => {
    const errorMessage = 'LandingPage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText } = render(
      <LandingPageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    await waitFor(() => {
      expect(getByText('Oops, something went wrong!')).toBeInTheDocument();
      expect(getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('renders the GMP home page with agency cards', async () => {
    const agency = {
      id: { uuid: 'agency-1' },
      type: 'listing',
      attributes: {
        title: 'CalibreOn International: Accounting',
        description: 'Bookkeeping on QuickBooks and Xero for international clients.',
        deleted: false,
        publicData: {
          listingType: 'agency-services',
          services: ['accounting'],
          years_operating: 13,
        },
      },
      author: {
        id: { uuid: 'user-1' },
        type: 'user',
        attributes: {
          profile: {
            displayName: 'CalibreOn International',
            abbreviatedName: 'CI',
            publicData: { city: 'Gilgit', country: 'pakistan' },
          },
        },
      },
    };

    const { getByText, getAllByText } = render(
      <LandingPageComponent
        pageAssetsData={{ landingPage: { data: { sections: [] } } }}
        inProgress={false}
        error={null}
        agencyListings={[agency]}
      />
    );

    await waitFor(() => {
      expect(getByText('GmpHome.categoriesTitle')).toBeInTheDocument();
      expect(getByText('GmpHome.featuredTitle')).toBeInTheDocument();
      expect(getAllByText('CalibreOn International').length).toBeGreaterThan(0);
      expect(getAllByText('Gilgit, Pakistan').length).toBeGreaterThan(0);
      expect(getByText('GmpHome.modelsTitle')).toBeInTheDocument();
    });
  });
});

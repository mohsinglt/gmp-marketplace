import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { CMSPageComponent } from '../CMSPage/CMSPage';

const { waitFor, fireEvent } = testingLibrary;

const agency = {
  id: { uuid: 'agency-1' },
  type: 'listing',
  attributes: {
    title: 'CalibreOn International: Accounting',
    description: 'Bookkeeping for international clients.',
    deleted: false,
    publicData: { listingType: 'agency-services', services: ['accounting'] },
  },
  author: {
    id: { uuid: 'user-1' },
    type: 'user',
    attributes: { profile: { displayName: 'CalibreOn International', abbreviatedName: 'CI' } },
  },
};

const renderPage = pageId =>
  render(
    <CMSPageComponent
      params={{ pageId }}
      pageAssetsData={{ [pageId]: { data: { sections: [] } } }}
      inProgress={false}
      error={null}
      agencyListings={[agency]}
    />
  );

describe('GMP coded content pages', () => {
  it('renders the Services page with live provider names', async () => {
    const { getByText } = renderPage('services');
    await waitFor(() => {
      expect(getByText('GmpServices.title')).toBeInTheDocument();
      expect(getByText('GmpServices.accounting.title')).toBeInTheDocument();
      expect(getByText('CalibreOn International')).toBeInTheDocument();
    });
  });

  it('renders How it works with a working FAQ accordion', async () => {
    const { getByText, queryByText } = renderPage('about');
    await waitFor(() => {
      expect(getByText('GmpHow.title')).toBeInTheDocument();
      expect(getByText('GmpFaq.a1')).toBeInTheDocument();
    });
    expect(queryByText('GmpFaq.a2')).not.toBeInTheDocument();
    fireEvent.click(getByText('GmpFaq.q2'));
    expect(getByText('GmpFaq.a2')).toBeInTheDocument();
  });

  it('renders For agencies with sign-up options and members', async () => {
    const { getByText } = renderPage('for-agencies');
    await waitFor(() => {
      expect(getByText('GmpAgencies.joinAgency')).toBeInTheDocument();
      expect(getByText('GmpAgencies.joinFreelancer')).toBeInTheDocument();
      expect(getByText('CalibreOn International')).toBeInTheDocument();
    });
  });

  it('renders the FAQs page', async () => {
    const { getByText } = renderPage('faqs');
    await waitFor(() => {
      expect(getByText('GmpFaq.title')).toBeInTheDocument();
      expect(getByText('GmpFaq.q10')).toBeInTheDocument();
    });
  });
});

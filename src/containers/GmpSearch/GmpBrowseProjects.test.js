import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import GmpBrowseProjects, { getProjectAccess } from './GmpBrowseProjects';

const { fireEvent, screen } = testingLibrary;

const config = {
  listing: {
    listingFields: [
      {
        key: 'engagement_type',
        enumOptions: [
          { option: 'fixed_price', label: 'Fixed price' },
          { option: 'hourly', label: 'Hourly' },
        ],
      },
    ],
  },
};

const project = (id, title, type, country) => ({
  id: { uuid: id },
  type: 'listing',
  attributes: {
    title,
    description: `${title} for a growing business.`,
    deleted: false,
    createdAt: new Date(),
    publicData: { listingType: 'project-request', engagement_type: type, budget: '$5,000' },
  },
  author: {
    id: { uuid: `user-${id}` },
    type: 'user',
    attributes: { profile: { displayName: 'Maple Dental', publicData: { country } } },
  },
});

const listings = [
  project('p1', 'Shopify store rebuild', 'fixed_price', 'united_states'),
  project('p2', 'Monthly bookkeeping on Xero', 'hourly', 'united_kingdom'),
];

const approvedAgency = {
  id: { uuid: 'me' },
  attributes: { state: 'active', profile: { publicData: { userType: 'agency' } } },
};

const renderPage = currentUser =>
  render(
    <GmpBrowseProjects
      listings={listings}
      inProgress={false}
      currentUser={currentUser}
      location={{ search: '' }}
      config={config}
    />
  );

describe('GmpBrowseProjects', () => {
  it('works out who may see projects', () => {
    expect(getProjectAccess(null)).toBe('anonymous');
    expect(getProjectAccess({ id: 'x', attributes: { state: 'pendingApproval' } })).toBe('pending');
    expect(
      getProjectAccess({
        id: 'x',
        attributes: { state: 'active', profile: { publicData: { userType: 'business' } } },
      })
    ).toBe('business');
    expect(getProjectAccess(approvedAgency)).toBe('allowed');
  });

  it('hides projects from visitors who are not approved providers', () => {
    renderPage(null);
    expect(screen.getByText('GmpProjects.gate.anonymous.title')).toBeInTheDocument();
    expect(screen.queryByText('Shopify store rebuild')).not.toBeInTheDocument();
  });

  it('lists and filters projects for an approved agency', () => {
    renderPage(approvedAgency);
    expect(screen.getByText('Shopify store rebuild')).toBeInTheDocument();
    expect(screen.getByText('Monthly bookkeeping on Xero')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Hourly/ }));
    expect(screen.queryByText('Shopify store rebuild')).not.toBeInTheDocument();
    expect(screen.getByText('Monthly bookkeeping on Xero')).toBeInTheDocument();

    fireEvent.click(screen.getByText('GmpFindTalent.clearAll'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'shopify' } });
    expect(screen.getByText('Shopify store rebuild')).toBeInTheDocument();
    expect(screen.queryByText('Monthly bookkeeping on Xero')).not.toBeInTheDocument();
  });
});

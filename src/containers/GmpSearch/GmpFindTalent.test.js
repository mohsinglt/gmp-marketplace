import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import GmpFindTalent from './GmpFindTalent';

const { fireEvent, screen } = testingLibrary;

const agency = (id, name, services, country) => ({
  id: { uuid: id },
  type: 'listing',
  attributes: {
    title: `${name}: services`,
    description: `${name} delivers work for international clients.`,
    deleted: false,
    publicData: { listingType: 'agency-services', services, years_operating: 10 },
  },
  author: {
    id: { uuid: `user-${id}` },
    type: 'user',
    attributes: {
      profile: { displayName: name, abbreviatedName: 'XX', publicData: { country } },
    },
  },
});

const listings = [
  agency('a1', 'CalibreOn International', ['accounting'], 'pakistan'),
  agency('a2', 'Growffic', ['digital_marketing'], 'india'),
];

const renderPage = (search = '') =>
  render(
    <GmpFindTalent
      listings={listings}
      inProgress={false}
      location={{ search }}
      config={{ listing: { listingFields: [] } }}
    />
  );

describe('GmpFindTalent', () => {
  it('lists all agencies with their location', () => {
    renderPage();
    expect(screen.getByText('CalibreOn International')).toBeInTheDocument();
    expect(screen.getByText('Growffic')).toBeInTheDocument();
    // once in the Based in filter, once on the card
    expect(screen.getAllByText('India')).toHaveLength(2);
  });

  it('filters by service, country and keyword', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Accounting/ }));
    expect(screen.getByText('CalibreOn International')).toBeInTheDocument();
    expect(screen.queryByText('Growffic')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('GmpFindTalent.clearAll'));
    fireEvent.click(screen.getByRole('button', { name: /^India/ }));
    expect(screen.queryByText('CalibreOn International')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('GmpFindTalent.clearAll'));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'growffic' } });
    expect(screen.getByText('Growffic')).toBeInTheDocument();
    expect(screen.queryByText('CalibreOn International')).not.toBeInTheDocument();
  });

  it('reads a service filter from the URL', () => {
    renderPage('?pub_services=has_all%3Adigital_marketing');
    expect(screen.getByText('Growffic')).toBeInTheDocument();
    expect(screen.queryByText('CalibreOn International')).not.toBeInTheDocument();
  });
});

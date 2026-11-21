import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { createSlug } from '../../util/urlHelpers';

import { Avatar, NamedLink } from '../../components';

import { CATEGORIES, COUNTRY_LABELS, ShieldIcon } from './gmpShared';
import base from '../LandingPage/GmpHome/GmpHome.module.css';
import css from './GmpCards.module.css';

export const AGENCY_LISTING_TYPE = 'agency-services';
export const PROJECT_LISTING_TYPE = 'project-request';

const truncate = (text = '', max) =>
  text.length > max ? `${text.slice(0, max - 3).trim()}…` : text;

export const enumLabel = (config, fieldKey, value) => {
  const field = (config?.listing?.listingFields || []).find(f => f.key === fieldKey);
  return (field?.enumOptions || []).find(o => o.option === value)?.label || value;
};

/**
 * Short service labels: the GMP category names first, then the hosted option labels.
 *
 * @param {Object} config marketplace configuration
 * @returns {Object} map of option key to label
 */
export const getServiceLabels = config => {
  const field = (config?.listing?.listingFields || []).find(f => f.key === 'services');
  const hosted = (field?.enumOptions || []).reduce(
    (acc, o) => ({ ...acc, [o.option]: o.label }),
    {}
  );
  return CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: c.label }), hosted);
};

const authorLocation = author => {
  const pd = author?.attributes?.profile?.publicData || {};
  return [pd.city, COUNTRY_LABELS[pd.country]].filter(Boolean).join(', ');
};

/**
 * Turn an agency listing entity into card data.
 *
 * @param {Object} listing listing entity with author
 * @param {Object} serviceLabels map from getServiceLabels
 * @returns {Object}
 */
export const toAgency = (listing, serviceLabels) => {
  const { title = '', description = '', publicData = {} } = listing.attributes || {};
  const author = listing.author;
  const name = author?.attributes?.profile?.displayName || title.split(':')[0];
  return {
    id: listing.id.uuid,
    slug: createSlug(title || name),
    name,
    author,
    location: authorLocation(author),
    services: (publicData.services || []).map(k => serviceLabels[k] || k),
    tagline: truncate(description, 120),
    years: publicData.years_operating,
    team: publicData.team_size,
  };
};

/**
 * Agency card used on the home page and in Find talent results.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.agency data from toAgency
 * @returns {JSX.Element}
 */
export const AgencyCard = ({ agency: a }) => {
  const chips =
    a.services.length > 3 ? [...a.services.slice(0, 3), `+${a.services.length - 3}`] : a.services;
  const meta = a.years ? (
    <FormattedMessage id="GmpHome.agencyYears" values={{ years: a.years }} />
  ) : a.team ? (
    <FormattedMessage id="GmpHome.agencyTeam" values={{ team: a.team }} />
  ) : null;
  return (
    <article className={base.agencyCard}>
      <div className={base.agencyHead}>
        <Avatar className={base.agencyAvatar} user={a.author} disableProfileLink />
        <div className={base.agencyHeadText}>
          <h3 className={base.agencyName}>
            <NamedLink
              name="ListingPage"
              params={{ id: a.id, slug: a.slug }}
              className={css.titleLink}
            >
              {a.name}
            </NamedLink>
          </h3>
          {a.location ? (
            <div className={base.agencyLocation}>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="none" />
                <circle cx="12" cy="10" r="2.5" fill="none" />
              </svg>
              {a.location}
            </div>
          ) : null}
        </div>
      </div>
      <p className={base.agencyTagline}>{a.tagline}</p>
      <div className={base.chips}>
        {chips.map(ch => (
          <span key={ch} className={base.chip}>
            {ch}
          </span>
        ))}
      </div>
      <div className={base.agencyFoot}>
        <span className={base.vetted}>
          <ShieldIcon className={base.tealIcon} />
          <FormattedMessage id="GmpHome.vetted" />
          {meta ? <> · {meta}</> : null}
        </span>
        <NamedLink
          name="ListingPage"
          params={{ id: a.id, slug: a.slug }}
          className={base.agencyLink}
        >
          <FormattedMessage id="GmpHome.viewProfile" />
        </NamedLink>
      </div>
    </article>
  );
};

/**
 * Project request card used in Browse projects results.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.listing project-request listing entity with author
 * @param {Object} props.config marketplace configuration
 * @returns {JSX.Element}
 */
export const ProjectCard = ({ listing, config }) => {
  const { title = '', description = '', publicData = {} } = listing.attributes || {};
  const author = listing.author;
  const by = author?.attributes?.profile?.displayName;
  const location = authorLocation(author);
  const id = listing.id.uuid;
  const slug = createSlug(title);
  const chips = [
    publicData.engagement_type && enumLabel(config, 'engagement_type', publicData.engagement_type),
    publicData.budget,
    publicData.duration && enumLabel(config, 'duration', publicData.duration),
  ].filter(Boolean);
  return (
    <article className={base.agencyCard}>
      <h3 className={base.agencyName}>
        <NamedLink name="ListingPage" params={{ id, slug }} className={css.titleLink}>
          {title}
        </NamedLink>
      </h3>
      {by || location ? (
        <p className={css.projectBy}>{[by, location].filter(Boolean).join(' · ')}</p>
      ) : null}
      <p className={base.agencyTagline}>{truncate(description, 180)}</p>
      <div className={base.chips}>
        {chips.map((ch, i) => (
          <span key={ch} className={i === 0 ? css.chipTeal : base.chip}>
            {ch}
          </span>
        ))}
      </div>
      <div className={base.agencyFoot}>
        <span />
        <NamedLink name="ListingPage" params={{ id, slug }} className={base.agencyLink}>
          <FormattedMessage id="GmpCards.viewProject" />
        </NamedLink>
      </div>
    </article>
  );
};

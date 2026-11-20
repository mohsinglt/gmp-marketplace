import React, { useState } from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { useIntl, FormattedMessage } from '../../../util/reactIntl';
import { createSlug } from '../../../util/urlHelpers';

import { Avatar, NamedLink } from '../../../components';

import css from './GmpHome.module.css';

// Global Marketplace home page. Copy lives in src/translations/en.json under "GmpHome.*",
// so it can be edited from Console > Marketplace texts without a code change.

const AGENCY_SEARCH = '/s/agency-services';
const serviceSearch = key => `${AGENCY_SEARCH}?pub_services=has_all%3A${key}`;

// Order and icons for the ten service categories. Labels come from the hosted listing field
// "services" when available, with these as fallbacks.
const CATEGORIES = [
  { key: 'web_software_apps', label: 'Web & software', icon: 'M3 4h18v12H3zM8 20h8M12 16v4' },
  {
    key: 'ai_automation',
    label: 'AI & automation',
    icon: 'M5 8h14v11H5zM12 4v4M9 13h.01M15 13h.01M9 16h6',
  },
  { key: 'data_analytics', label: 'Data & analytics', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  {
    key: 'cloud_devops',
    label: 'Cloud & DevOps',
    icon: 'M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.5 12 3.5 3.5 0 0 0 6 19h11.5z',
  },
  { key: 'digital_marketing', label: 'Marketing & SEO', icon: 'm3 17 6-6 4 4 8-8M15 7h6v6' },
  {
    key: 'accounting',
    label: 'Accounting',
    icon: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2zM9 7h6M9 11h6M9 15h3',
  },
  {
    key: 'design_video',
    label: 'Design & video',
    icon: 'M12 22a10 10 0 1 1 10-10M13.5 6.5h.01M6.5 12.5h.01M17.5 15.5h.01',
  },
  { key: 'architecture', label: 'Architecture', icon: 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6' },
  {
    key: 'ecommerce',
    label: 'E-commerce',
    icon: 'M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6',
  },
  {
    key: 'remote_staffing',
    label: 'Remote staffing',
    icon: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M19 8v6M16 11h6',
  },
];

const COUNTRY_LABELS = {
  pakistan: 'Pakistan',
  india: 'India',
  united_kingdom: 'United Kingdom',
  united_states: 'United States',
  canada: 'Canada',
};

const Icon = ({ path, className, size = 22 }) => (
  <svg
    className={className}
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} fill="none" />
  </svg>
);

const ShieldIcon = ({ className, size = 15 }) => (
  <svg className={className} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 2 4 5v7c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5l-8-3z" />
    <path
      d="m8.5 12 2.3 2.3L15.5 9.6"
      stroke="#fff"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

// Turn a listing entity into what the cards need.
const toAgency = (listing, serviceLabels) => {
  const { title = '', description = '', publicData = {} } = listing.attributes || {};
  const author = listing.author;
  const authorPublic = author?.attributes?.profile?.publicData || {};
  const name = author?.attributes?.profile?.displayName || title.split(':')[0];
  const city = authorPublic.city;
  const country = COUNTRY_LABELS[authorPublic.country];
  const location = [city, country].filter(Boolean).join(', ');
  const services = (publicData.services || []).map(k => serviceLabels[k] || k);
  const tagline = description.length > 120 ? `${description.slice(0, 117).trim()}…` : description;
  const years = publicData.years_operating;
  const team = publicData.team_size;
  return {
    id: listing.id.uuid,
    slug: createSlug(title || name),
    name,
    author,
    location,
    services,
    tagline,
    years,
    team,
  };
};

const AgencyMeta = ({ agency }) => {
  if (agency.years) {
    return <FormattedMessage id="GmpHome.agencyYears" values={{ years: agency.years }} />;
  }
  if (agency.team) {
    return <FormattedMessage id="GmpHome.agencyTeam" values={{ team: agency.team }} />;
  }
  return null;
};

const SectionHeader = ({ titleId, subtitleId, link }) => (
  <div className={css.sectionHeader}>
    <div>
      <h2 className={css.sectionTitle}>
        <FormattedMessage id={titleId} />
      </h2>
      {subtitleId ? (
        <p className={css.sectionSubtitle}>
          <FormattedMessage id={subtitleId} />
        </p>
      ) : null}
    </div>
    {link}
  </div>
);

const Hero = ({ agencies, intl }) => {
  const heroCards = agencies.slice(0, 3);
  return (
    <section className={css.hero}>
      <div className={classNames(css.wrap, css.heroInner)}>
        <div className={css.heroMain}>
          <div className={css.heroBadge}>
            <ShieldIcon size={16} className={css.heroBadgeIcon} />
            <FormattedMessage id="GmpHome.heroBadge" />
          </div>
          <h1 className={css.heroTitle}>
            <FormattedMessage
              id="GmpHome.heroTitle"
              values={{ accent: text => <span className={css.heroAccent}>{text}</span> }}
            />
          </h1>
          <p className={css.heroText}>
            <FormattedMessage id="GmpHome.heroText" />
          </p>
          <form className={css.heroSearch} action={AGENCY_SEARCH} method="get" role="search">
            <label htmlFor="gmp-hero-search" className={css.visuallyHidden}>
              <FormattedMessage id="GmpHome.searchLabel" />
            </label>
            <input
              id="gmp-hero-search"
              name="keywords"
              type="search"
              className={css.heroSearchInput}
              placeholder={intl.formatMessage({ id: 'GmpHome.searchPlaceholder' })}
            />
            <button type="submit" className={css.heroSearchButton}>
              <Icon path="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5" size={18} />
              <FormattedMessage id="GmpHome.searchButton" />
            </button>
          </form>
          <div className={css.popular}>
            <span>
              <FormattedMessage id="GmpHome.popular" />
            </span>
            {['digital_marketing', 'accounting', 'web_software_apps', 'ai_automation'].map(k => (
              <a key={k} href={serviceSearch(k)} className={css.popularChip}>
                {CATEGORIES.find(c => c.key === k).label}
              </a>
            ))}
          </div>
        </div>
        {heroCards.length > 0 ? (
          <div className={css.heroSide} aria-hidden="true">
            {heroCards.map((a, i) => (
              <div
                key={a.id}
                className={classNames(css.heroCard, { [css.heroCardOffset]: i === 1 })}
              >
                <Avatar className={css.heroAvatar} user={a.author} disableProfileLink />
                <div className={css.heroCardBody}>
                  <div className={css.heroCardName}>
                    {a.name}
                    <ShieldIcon className={css.tealIcon} size={16} />
                  </div>
                  <div className={css.heroCardServices}>{a.services.slice(0, 3).join(' · ')}</div>
                </div>
                {a.location ? <div className={css.heroCardLocation}>{a.location}</div> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const TrustedBy = () => {
  const names = [
    'Insight Software',
    'Equium Group',
    'Tribes.ai',
    'Shirin Group',
    'CANEI',
    'Generations Calgary',
    'Xola.com',
  ];
  return (
    <section className={css.trusted}>
      <div className={classNames(css.wrap, css.trustedInner)}>
        <span className={css.trustedLabel}>
          <FormattedMessage id="GmpHome.trustedBy" />
        </span>
        {names.map(n => (
          <span key={n} className={css.trustedName}>
            {n}
          </span>
        ))}
      </div>
    </section>
  );
};

const Categories = ({ counts, labels }) => (
  <section className={classNames(css.wrap, css.section)}>
    <SectionHeader
      titleId="GmpHome.categoriesTitle"
      subtitleId="GmpHome.categoriesSubtitle"
      link={
        <NamedLink name="CMSPage" params={{ pageId: 'services' }} className={css.sectionLink}>
          <FormattedMessage id="GmpHome.categoriesLink" />
        </NamedLink>
      }
    />
    <div className={css.categoryGrid}>
      {CATEGORIES.map((c, i) => (
        <a key={c.key} href={serviceSearch(c.key)} className={css.categoryCard}>
          <span className={classNames(css.categoryIcon, { [css.categoryIconTeal]: i % 2 === 1 })}>
            <Icon path={c.icon} />
          </span>
          <span className={css.categoryName}>{labels[c.key] || c.label}</span>
          <span className={css.categoryCount}>
            <FormattedMessage id="GmpHome.providerCount" values={{ count: counts[c.key] || 0 }} />
          </span>
        </a>
      ))}
    </div>
  </section>
);

const FeaturedAgencies = ({ agencies }) => (
  <section className={classNames(css.wrap, css.section)}>
    <SectionHeader
      titleId="GmpHome.featuredTitle"
      subtitleId="GmpHome.featuredSubtitle"
      link={
        <a href={AGENCY_SEARCH} className={css.sectionLink}>
          <FormattedMessage id="GmpHome.featuredLink" values={{ count: agencies.length }} />
        </a>
      }
    />
    {agencies.length === 0 ? (
      <div className={css.emptyState}>
        <FormattedMessage id="GmpHome.featuredEmpty" />
      </div>
    ) : (
      <div className={css.agencyGrid}>
        {agencies.slice(0, 6).map(a => {
          const chips =
            a.services.length > 3
              ? [...a.services.slice(0, 3), `+${a.services.length - 3}`]
              : a.services;
          return (
            <article key={a.id} className={css.agencyCard}>
              <div className={css.agencyHead}>
                <Avatar className={css.agencyAvatar} user={a.author} disableProfileLink />
                <div className={css.agencyHeadText}>
                  <h3 className={css.agencyName}>{a.name}</h3>
                  {a.location ? (
                    <div className={css.agencyLocation}>
                      <PinIcon />
                      {a.location}
                    </div>
                  ) : null}
                </div>
              </div>
              <p className={css.agencyTagline}>{a.tagline}</p>
              <div className={css.chips}>
                {chips.map(ch => (
                  <span key={ch} className={css.chip}>
                    {ch}
                  </span>
                ))}
              </div>
              <div className={css.agencyFoot}>
                <span className={css.vetted}>
                  <ShieldIcon className={css.tealIcon} />
                  <FormattedMessage id="GmpHome.vetted" />
                  {a.years || a.team ? (
                    <>
                      {' · '}
                      <AgencyMeta agency={a} />
                    </>
                  ) : null}
                </span>
                <NamedLink
                  name="ListingPage"
                  params={{ id: a.id, slug: a.slug }}
                  className={css.agencyLink}
                >
                  <FormattedMessage id="GmpHome.viewProfile" />
                </NamedLink>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
);

const HowItWorks = () => {
  const [tab, setTab] = useState('biz');
  const steps = [1, 2, 3, 4];
  const prefix = tab === 'biz' ? 'GmpHome.bizStep' : 'GmpHome.talentStep';
  return (
    <section className={css.howBand}>
      <div className={classNames(css.wrap, css.section)}>
        <div className={css.centerHeader}>
          <h2 className={css.sectionTitle}>
            <FormattedMessage id="GmpHome.howTitle" />
          </h2>
          <div className={css.tabs} role="tablist">
            {[['biz', 'GmpHome.howTabBusinesses'], ['talent', 'GmpHome.howTabTalent']].map(
              ([id, msg]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={classNames(css.tab, { [css.tabActive]: tab === id })}
                  onClick={() => setTab(id)}
                >
                  <FormattedMessage id={msg} />
                </button>
              )
            )}
          </div>
        </div>
        <ol className={css.stepGrid}>
          {steps.map(n => (
            <li key={n} className={css.step}>
              <span className={css.stepNumber}>{n}</span>
              <h3 className={css.stepTitle}>
                <FormattedMessage id={`${prefix}${n}Title`} />
              </h3>
              <p className={css.stepText}>
                <FormattedMessage id={`${prefix}${n}Text`} />
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const EngagementModels = () => {
  const models = [
    ['fixed', 'M3 4h18v16H3zM8 2v4M16 2v4M3 10h18'],
    ['hourly', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2'],
    ['staff', 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M19 8v6M16 11h6'],
  ];
  return (
    <section className={classNames(css.wrap, css.section)}>
      <div className={css.centerHeader}>
        <h2 className={css.sectionTitle}>
          <FormattedMessage id="GmpHome.modelsTitle" />
        </h2>
        <p className={css.sectionSubtitle}>
          <FormattedMessage id="GmpHome.modelsSubtitle" />
        </p>
      </div>
      <div className={css.threeGrid}>
        {models.map(([id, icon]) => (
          <div key={id} className={css.infoCard}>
            <Icon path={icon} size={28} className={css.tealIcon} />
            <h3 className={css.infoTitle}>
              <FormattedMessage id={`GmpHome.model.${id}.title`} />
            </h3>
            <p className={css.infoText}>
              <FormattedMessage id={`GmpHome.model.${id}.text`} />
            </p>
          </div>
        ))}
      </div>
      <div className={css.centerCta}>
        <NamedLink name="NewListingPage" className={css.primaryButton}>
          <FormattedMessage id="GmpHome.postProject" />
        </NamedLink>
      </div>
    </section>
  );
};

const Results = () => (
  <section className={classNames(css.wrap, css.section)}>
    <div className={css.centerHeader}>
      <h2 className={css.sectionTitle}>
        <FormattedMessage id="GmpHome.resultsTitle" />
      </h2>
    </div>
    <div className={css.threeGrid}>
      {[1, 2, 3].map(n => (
        <div key={n} className={css.resultCard}>
          <span className={css.resultFigure}>
            <FormattedMessage id={`GmpHome.result${n}Figure`} />
          </span>
          <span className={css.resultText}>
            <FormattedMessage id={`GmpHome.result${n}Text`} />
          </span>
        </div>
      ))}
    </div>
  </section>
);

const WhyGmp = () => (
  <section className={classNames(css.wrap, css.section)}>
    <div className={css.fourGrid}>
      {[1, 2, 3, 4].map(n => (
        <div key={n}>
          <h3 className={css.whyTitle}>
            <FormattedMessage id={`GmpHome.why${n}Title`} />
          </h3>
          <p className={css.infoText}>
            <FormattedMessage id={`GmpHome.why${n}Text`} />
          </p>
        </div>
      ))}
    </div>
  </section>
);

const CtaBand = () => (
  <section className={classNames(css.wrap, css.ctaSection)}>
    <div className={css.ctaBand}>
      <div className={css.ctaText}>
        <h2 className={css.ctaTitle}>
          <FormattedMessage id="GmpHome.ctaTitle" />
        </h2>
        <p className={css.ctaBody}>
          <FormattedMessage id="GmpHome.ctaText" />
        </p>
      </div>
      <div className={css.ctaButtons}>
        <NamedLink name="NewListingPage" className={css.whiteButton}>
          <FormattedMessage id="GmpHome.postProject" />
        </NamedLink>
        <a href="mailto:mohsin.amir@globalmarketplaceconnect.com" className={css.outlineButton}>
          <FormattedMessage id="GmpHome.emailUs" />
        </a>
      </div>
    </div>
  </section>
);

/**
 * Global Marketplace home page content (everything between the top bar and the footer).
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.agencyListings listing entities of type agency-services, with author
 * @returns {JSX.Element}
 */
const GmpHome = props => {
  const { agencyListings = [] } = props;
  const intl = useIntl();
  const config = useConfiguration();

  // Short category labels read better on chips than the long hosted option labels;
  // unknown options fall back to the hosted label from the "services" listing field.
  const servicesField = (config?.listing?.listingFields || []).find(f => f.key === 'services');
  const hostedLabels = (servicesField?.enumOptions || []).reduce(
    (acc, o) => ({ ...acc, [o.option]: o.label }),
    {}
  );
  const serviceLabels = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: c.label }), hostedLabels);
  const categoryLabels = {};

  const listings = agencyListings.filter(l => l?.attributes && !l.attributes.deleted);
  const agencies = listings.map(l => toAgency(l, serviceLabels));
  const counts = listings.reduce((acc, l) => {
    (l.attributes.publicData?.services || []).forEach(k => {
      acc[k] = (acc[k] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className={css.root}>
      <Hero agencies={agencies} intl={intl} />
      <TrustedBy />
      <Categories counts={counts} labels={categoryLabels} />
      <FeaturedAgencies agencies={agencies} />
      <HowItWorks />
      <EngagementModels />
      <Results />
      <WhyGmp />
      <CtaBand />
    </div>
  );
};

export default GmpHome;

import React, { useState } from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { useIntl, FormattedMessage } from '../../../util/reactIntl';

import { Avatar, NamedLink } from '../../../components';

import {
  AGENCY_SEARCH,
  CATEGORIES,
  Icon,
  ShieldIcon,
  serviceSearch,
} from '../../GmpPages/gmpShared';
import { AgencyCard, getServiceLabels, toAgency } from '../../GmpPages/GmpCards';
import css from './GmpHome.module.css';

export { AGENCY_SEARCH, CATEGORIES, Icon, ShieldIcon, serviceSearch };

// Global Marketplace home page. Copy lives in src/translations/en.json under "GmpHome.*",
// so it can be edited from Console > Marketplace texts without a code change.

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
        {agencies.slice(0, 6).map(a => (
          <AgencyCard key={a.id} agency={a} />
        ))}
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

  const serviceLabels = getServiceLabels(config);
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

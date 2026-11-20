import React from 'react';
import classNames from 'classnames';

import { useIntl, FormattedMessage } from '../../util/reactIntl';

import { NamedLink } from '../../components';

import { CATEGORIES, Icon, serviceSearch } from '../LandingPage/GmpHome/GmpHome';
import base from '../LandingPage/GmpHome/GmpHome.module.css';
import GmpLayout from './GmpLayout';
import css from './GmpPages.module.css';

/**
 * Services page (/p/services): the ten categories with live provider names and counts.
 * Copy lives in en.json under "GmpServices.*".
 *
 * @component
 * @param {Object} props
 * @param {Object?} props.pageData hosted page asset (SEO only)
 * @param {Array<Object>} props.agencyListings agency-services listing entities with author
 * @returns {JSX.Element}
 */
const GmpServicesPage = props => {
  const { pageData, agencyListings = [] } = props;
  const intl = useIntl();

  // Provider names per category, from approved agency listings.
  const providers = agencyListings
    .filter(l => l?.attributes && !l.attributes.deleted)
    .reduce((acc, l) => {
      const name =
        l.author?.attributes?.profile?.displayName || (l.attributes.title || '').split(':')[0];
      (l.attributes.publicData?.services || []).forEach(k => {
        acc[k] = acc[k] || [];
        if (!acc[k].includes(name)) acc[k].push(name);
      });
      return acc;
    }, {});

  return (
    <GmpLayout pageData={pageData} currentPage="CMSPage">
      <div className={base.root}>
        <section className={css.pageHero}>
          <div className={classNames(base.wrap, css.pageHeroInner)}>
            <nav className={css.breadcrumb} aria-label="Breadcrumb">
              <NamedLink name="LandingPage">
                <FormattedMessage id="GmpPages.home" />
              </NamedLink>
              {' / '}
              <FormattedMessage id="GmpServices.breadcrumb" />
            </nav>
            <h1 className={css.pageTitle}>
              <FormattedMessage id="GmpServices.title" />
            </h1>
            <p className={css.pageLead}>
              <FormattedMessage id="GmpServices.lead" />
            </p>
          </div>
        </section>

        <section className={classNames(base.wrap, base.section)}>
          <div className={css.serviceGrid}>
            {CATEGORIES.map((c, i) => {
              const names = providers[c.key] || [];
              const examples = intl
                .formatMessage({ id: `GmpServices.${c.key}.examples` })
                .split(',')
                .map(e => e.trim())
                .filter(Boolean);
              return (
                <article key={c.key} className={css.serviceCard}>
                  <span
                    className={classNames(css.serviceIcon, { [css.serviceIconTeal]: i % 2 === 1 })}
                  >
                    <Icon path={c.icon} size={26} />
                  </span>
                  <div className={css.serviceBody}>
                    <div className={css.serviceHead}>
                      <h2 className={css.serviceTitle}>
                        <FormattedMessage id={`GmpServices.${c.key}.title`} />
                      </h2>
                      <span className={css.serviceCount}>
                        <FormattedMessage
                          id="GmpHome.providerCount"
                          values={{ count: names.length }}
                        />
                      </span>
                    </div>
                    <p className={css.serviceText}>
                      <FormattedMessage id={`GmpServices.${c.key}.text`} />
                    </p>
                    <div className={base.chips}>
                      {examples.map(e => (
                        <span key={e} className={css.exampleChip}>
                          {e}
                        </span>
                      ))}
                    </div>
                    {names.length > 0 ? (
                      <p className={css.serviceProviders}>
                        <strong>
                          <FormattedMessage id="GmpServices.providers" />
                        </strong>{' '}
                        {names.join(', ')}
                      </p>
                    ) : null}
                    <a href={serviceSearch(c.key)} className={css.textLink}>
                      <FormattedMessage id="GmpServices.browse" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={classNames(base.wrap, base.section, css.bottomSpace)}>
          <div className={css.twoGrid}>
            <div className={classNames(css.ctaCard, css.ctaCardTeal)}>
              <h2 className={css.ctaCardTitle}>
                <FormattedMessage id="GmpServices.ctaProjectTitle" />
              </h2>
              <p className={css.ctaCardText}>
                <FormattedMessage id="GmpServices.ctaProjectText" />
              </p>
              <NamedLink name="NewListingPage" className={base.whiteButton}>
                <FormattedMessage id="GmpHome.postProject" />
              </NamedLink>
            </div>
            <div className={classNames(css.ctaCard, css.ctaCardNavy)}>
              <h2 className={css.ctaCardTitle}>
                <FormattedMessage id="GmpServices.ctaJoinTitle" />
              </h2>
              <p className={css.ctaCardText}>
                <FormattedMessage id="GmpServices.ctaJoinText" />
              </p>
              <NamedLink
                name="CMSPage"
                params={{ pageId: 'for-agencies' }}
                className={base.whiteButton}
              >
                <FormattedMessage id="GmpPages.applyToJoin" />
              </NamedLink>
            </div>
          </div>
        </section>
      </div>
    </GmpLayout>
  );
};

export default GmpServicesPage;

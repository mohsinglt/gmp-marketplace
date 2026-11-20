import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import { Avatar, NamedLink } from '../../components';

import { Icon } from '../LandingPage/GmpHome/GmpHome';
import base from '../LandingPage/GmpHome/GmpHome.module.css';
import GmpLayout from './GmpLayout';
import css from './GmpPages.module.css';

const CHECK = 'm5 12 5 5 9-10';

/**
 * For agencies page (/p/for-agencies). Copy lives in en.json under "GmpAgencies.*".
 *
 * @component
 * @param {Object} props
 * @param {Object?} props.pageData hosted page asset (SEO only)
 * @param {Array<Object>} props.agencyListings agency-services listing entities with author
 * @returns {JSX.Element}
 */
const GmpForAgenciesPage = props => {
  const { pageData, agencyListings = [] } = props;

  // One chip per approved agency or freelancer with a live listing.
  const members = [];
  const seen = new Set();
  agencyListings
    .filter(l => l?.attributes && !l.attributes.deleted && l.author)
    .forEach(l => {
      const id = l.author.id?.uuid;
      if (id && !seen.has(id)) {
        seen.add(id);
        members.push(l.author);
      }
    });

  return (
    <GmpLayout pageData={pageData} currentPage="CMSPage">
      <div className={base.root}>
        <section className={css.pageHero}>
          <div className={classNames(base.wrap, css.pageHeroInner)}>
            <div className={css.joinHero}>
              <div className={base.heroMain}>
                <h1 className={css.pageTitle}>
                  <FormattedMessage id="GmpAgencies.title" />
                </h1>
                <p className={css.pageLead}>
                  <FormattedMessage id="GmpAgencies.lead" />
                </p>
                <ul className={css.perks}>
                  {[1, 2, 3].map(n => (
                    <li key={n}>
                      <Icon path={CHECK} size={20} className={css.perkIcon} />
                      <FormattedMessage id={`GmpAgencies.perk${n}`} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className={css.joinCard}>
                <h2 className={css.joinCardTitle}>
                  <FormattedMessage id="GmpAgencies.joinTitle" />
                </h2>
                <NamedLink
                  name="SignupForUserTypePage"
                  params={{ userType: 'agency' }}
                  className={css.joinOption}
                >
                  <span className={css.joinOptionTitle}>
                    <FormattedMessage id="GmpAgencies.joinAgency" />
                  </span>
                  <span className={css.joinOptionText}>
                    <FormattedMessage id="GmpAgencies.joinAgencyText" />
                  </span>
                </NamedLink>
                <NamedLink
                  name="SignupForUserTypePage"
                  params={{ userType: 'freelancer' }}
                  className={css.joinOption}
                >
                  <span className={css.joinOptionTitle}>
                    <FormattedMessage id="GmpAgencies.joinFreelancer" />
                  </span>
                  <span className={css.joinOptionText}>
                    <FormattedMessage id="GmpAgencies.joinFreelancerText" />
                  </span>
                </NamedLink>
                <p className={css.joinNote}>
                  <FormattedMessage
                    id="GmpAgencies.joinNote"
                    values={{
                      link: text => (
                        <NamedLink name="SignupForUserTypePage" params={{ userType: 'business' }}>
                          {text}
                        </NamedLink>
                      ),
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={classNames(base.wrap, base.section)}>
          <div className={base.centerHeader}>
            <h2 className={base.sectionTitle}>
              <FormattedMessage id="GmpAgencies.stepsTitle" />
            </h2>
          </div>
          <ol className={css.fourSteps}>
            {[1, 2, 3, 4].map(n => (
              <li key={n} className={css.stepCard}>
                <span className={css.stepBig}>{`0${n}`}</span>
                <h3 className={base.stepTitle}>
                  <FormattedMessage id={`GmpAgencies.step${n}Title`} />
                </h3>
                <p className={base.stepText}>
                  <FormattedMessage id={`GmpAgencies.step${n}Text`} />
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className={classNames(base.wrap, base.section)}>
          <div className={base.centerHeader}>
            <h2 className={base.sectionTitle}>
              <FormattedMessage id="GmpAgencies.criteriaTitle" />
            </h2>
            <p className={base.sectionSubtitle}>
              <FormattedMessage id="GmpAgencies.criteriaLead" />
            </p>
          </div>
          <div className={base.threeGrid}>
            {[1, 2, 3].map(n => (
              <div key={n} className={base.infoCard}>
                <h3 className={base.infoTitle}>
                  <FormattedMessage id={`GmpAgencies.criteria${n}Title`} />
                </h3>
                <p className={base.infoText}>
                  <FormattedMessage id={`GmpAgencies.criteria${n}Text`} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {members.length > 0 ? (
          <section className={classNames(base.wrap, base.section)}>
            <div className={css.listCard}>
              <h2 className={css.listCardTitle}>
                <FormattedMessage id="GmpAgencies.membersTitle" />
              </h2>
              <div className={css.memberList}>
                {members.map(u => (
                  <a key={u.id.uuid} href="/s/agency-services" className={css.memberChip}>
                    <Avatar className={css.memberAvatar} user={u} disableProfileLink />
                    {u.attributes?.profile?.displayName}
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className={classNames(base.wrap, base.ctaSection, base.section)}>
          <div className={base.ctaBand}>
            <div className={base.ctaText}>
              <h2 className={base.ctaTitle}>
                <FormattedMessage id="GmpAgencies.ctaTitle" />
              </h2>
              <p className={base.ctaBody}>
                <FormattedMessage id="GmpAgencies.ctaText" />
              </p>
            </div>
            <div className={base.ctaButtons}>
              <NamedLink
                name="SignupForUserTypePage"
                params={{ userType: 'agency' }}
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

export default GmpForAgenciesPage;

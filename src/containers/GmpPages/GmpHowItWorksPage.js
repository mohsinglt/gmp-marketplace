import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import { NamedLink } from '../../components';

import base from '../LandingPage/GmpHome/GmpHome.module.css';
import GmpLayout from './GmpLayout';
import css from './GmpPages.module.css';

export const FAQ_COUNT = 10;

/**
 * Accordion of frequently asked questions. Questions and answers are in en.json as
 * GmpFaq.q1 / GmpFaq.a1 ... GmpFaq.q10 / GmpFaq.a10.
 *
 * @component
 * @returns {JSX.Element}
 */
export const FaqList = () => {
  const [open, setOpen] = useState(1);
  const items = Array.from({ length: FAQ_COUNT }, (_, i) => i + 1);
  return (
    <div className={css.faqList}>
      {items.map(n => {
        const isOpen = open === n;
        const answerId = `gmp-faq-answer-${n}`;
        return (
          <div key={n} className={css.faqItem}>
            <h3 className={base.stepTitle}>
              <button
                type="button"
                className={css.faqQuestion}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? -1 : n)}
              >
                <FormattedMessage id={`GmpFaq.q${n}`} />
                <svg
                  className={classNames(css.faqChevron, { [css.faqChevronOpen]: isOpen })}
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" fill="none" />
                </svg>
              </button>
            </h3>
            {isOpen ? (
              <p id={answerId} className={css.faqAnswer}>
                <FormattedMessage id={`GmpFaq.a${n}`} />
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/**
 * How it works page (/p/about). Copy lives in en.json under "GmpHow.*" and "GmpFaq.*".
 *
 * @component
 * @param {Object} props
 * @param {Object?} props.pageData hosted page asset (SEO only)
 * @returns {JSX.Element}
 */
const GmpHowItWorksPage = props => {
  const { pageData } = props;
  const steps = [1, 2, 3, 4, 5];

  return (
    <GmpLayout pageData={pageData} currentPage="CMSPage">
      <div className={base.root}>
        <section className={css.pageHero}>
          <div className={classNames(base.wrap, css.pageHeroInner, css.pageHeroCentered)}>
            <h1 className={css.pageTitle}>
              <FormattedMessage id="GmpHow.title" />
            </h1>
            <p className={css.pageLead}>
              <FormattedMessage id="GmpHow.lead" />
            </p>
          </div>
        </section>

        <section className={classNames(base.wrap, base.section)}>
          <div className={base.centerHeader}>
            <h2 className={base.sectionTitle}>
              <FormattedMessage id="GmpHow.stepsTitle" />
            </h2>
          </div>
          <ol className={css.fiveSteps}>
            {steps.map(n => (
              <li key={n} className={css.stepCard}>
                <span className={classNames(base.stepNumber, { [css.stepNumberTeal]: n === 5 })}>
                  {n}
                </span>
                <h3 className={base.stepTitle}>
                  <FormattedMessage id={`GmpHow.step${n}Title`} />
                </h3>
                <p className={base.stepText}>
                  <FormattedMessage id={`GmpHow.step${n}Text`} />
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className={classNames(base.wrap, base.section)}>
          <div className={css.twoGrid}>
            {['do', 'dont'].map(kind => (
              <div key={kind} className={css.listCard}>
                <h2 className={css.listCardTitle}>
                  <FormattedMessage id={`GmpHow.${kind}Title`} />
                </h2>
                <ul className={css.bulletList}>
                  {[1, 2, 3, 4].map(n => (
                    <li key={n}>
                      <FormattedMessage id={`GmpHow.${kind}${n}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="faqs" className={classNames(base.wrap, base.section, css.bottomSpace)}>
          <div className={css.faqWrap}>
            <div className={base.centerHeader}>
              <h2 className={base.sectionTitle}>
                <FormattedMessage id="GmpFaq.title" />
              </h2>
            </div>
            <p className={css.faqContact}>
              <FormattedMessage
                id="GmpFaq.contact"
                values={{
                  email: (
                    <a href="mailto:mohsin.amir@globalmarketplaceconnect.com">
                      mohsin.amir@globalmarketplaceconnect.com
                    </a>
                  ),
                }}
              />
            </p>
            <FaqList />
            <div className={base.centerCta}>
              <NamedLink name="NewListingPage" className={base.primaryButton}>
                <FormattedMessage id="GmpHome.postProject" />
              </NamedLink>
            </div>
          </div>
        </section>
      </div>
    </GmpLayout>
  );
};

export default GmpHowItWorksPage;

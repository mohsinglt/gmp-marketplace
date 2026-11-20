import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';

import { NamedLink } from '../../components';

import base from '../LandingPage/GmpHome/GmpHome.module.css';
import GmpLayout from './GmpLayout';
import { FaqList } from './GmpHowItWorksPage';
import css from './GmpPages.module.css';

/**
 * FAQs page (/p/faqs). Uses the same questions as the How it works page.
 *
 * @component
 * @param {Object} props
 * @param {Object?} props.pageData hosted page asset (SEO only)
 * @returns {JSX.Element}
 */
const GmpFaqPage = props => {
  const { pageData } = props;
  return (
    <GmpLayout pageData={pageData} currentPage="CMSPage">
      <div className={base.root}>
        <section className={css.pageHero}>
          <div className={classNames(base.wrap, css.pageHeroInner, css.pageHeroCentered)}>
            <h1 className={css.pageTitle}>
              <FormattedMessage id="GmpFaq.title" />
            </h1>
            <p className={css.pageLead}>
              <FormattedMessage id="GmpFaq.lead" />
            </p>
          </div>
        </section>
        <section className={classNames(base.wrap, base.section, css.bottomSpace)}>
          <div className={css.faqWrap}>
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
              <NamedLink name="CMSPage" params={{ pageId: 'about' }} className={base.primaryButton}>
                <FormattedMessage id="GmpFaq.howLink" />
              </NamedLink>
            </div>
          </div>
        </section>
      </div>
    </GmpLayout>
  );
};

export default GmpFaqPage;

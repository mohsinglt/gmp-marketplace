import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { NamedLink } from '../../components';

import css from './AuthenticationPage.module.css';

// Global Marketplace sign-up layout, from the approved prototype: a side panel per account
// type and a stepped form. Each step lists the custom user field keys it shows; step 0 also
// holds the account fields (name, email, password, terms). Text lives under GmpSignup.* keys.
export const SIGNUP_STEPS = {
  business: [[], ['country', 'company_size', 'industry', 'heard_from']],
  agency: [
    ['rep_role'],
    ['city', 'country', 'year_founded', 'team_size', 'provider_services'],
    ['portfolio_link'],
  ],
  freelancer: [
    [],
    [
      'headline',
      'provider_services',
      'experience',
      'availability',
      'hourly_rate',
      'city',
      'country',
    ],
    ['portfolio_link'],
  ],
};

export const SIGNUP_TYPE_ORDER = ['business', 'agency', 'freelancer'];

const PERK_ICONS = [
  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11l2 2 4-4',
  'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
];

const PanelIcon = ({ path }) => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} fill="none" />
  </svg>
);

/**
 * Left panel of the sign-up page. Business gets benefits; agencies and freelancers get the
 * application steps, with the current one highlighted.
 *
 * @component
 * @param {Object} props
 * @param {string} props.userType business, agency or freelancer
 * @param {number} props.step current step index
 * @returns {JSX.Element}
 */
export const GmpSignupPanel = props => {
  const { userType, step } = props;
  const steps = SIGNUP_STEPS[userType] || SIGNUP_STEPS.business;
  const isBusiness = userType !== 'agency' && userType !== 'freelancer';
  const panelClass = userType === 'freelancer' ? css.gmpBrandPanelTeal : css.gmpBrandPanel;

  return (
    <aside className={panelClass} aria-label={`${userType} sign-up`}>
      <div className={css.gmpBrandInner}>
        <div className={css.gmpBrandHead}>
          <h2 className={css.gmpBrandTitle}>
            <FormattedMessage id={`GmpSignup.${userType}.panelTitle`} />
          </h2>
          <p className={css.gmpBrandText}>
            <FormattedMessage id={`GmpSignup.${userType}.panelText`} />
          </p>
        </div>

        {isBusiness ? (
          <ul className={css.gmpPerks}>
            {PERK_ICONS.map((path, i) => (
              <li key={path} className={css.gmpPerk}>
                <span className={css.gmpPerkIcon}>
                  <PanelIcon path={path} />
                </span>
                <span>
                  <strong className={css.gmpPerkTitle}>
                    <FormattedMessage id={`GmpSignup.business.perk${i + 1}Title`} />
                  </strong>
                  <span className={css.gmpPerkText}>
                    <FormattedMessage id={`GmpSignup.business.perk${i + 1}Text`} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ol className={css.gmpRail}>
            {steps.map((_, i) => {
              const isCurrent = i === step;
              const isPast = i < step;
              return (
                <li
                  key={i}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={classNames(css.gmpRailItem, { [css.gmpRailItemCurrent]: isCurrent })}
                >
                  <span
                    className={classNames(css.gmpRailDot, {
                      [css.gmpRailDotActive]: isCurrent || isPast,
                    })}
                  >
                    {isPast ? '✓' : i + 1}
                  </span>
                  <span>
                    <strong className={css.gmpRailTitle}>
                      <FormattedMessage id={`GmpSignup.${userType}.rail${i + 1}Title`} />
                    </strong>
                    <span className={css.gmpRailText}>
                      <FormattedMessage id={`GmpSignup.${userType}.rail${i + 1}Text`} />
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {!isBusiness ? (
          <p className={css.gmpPanelFoot}>
            <FormattedMessage id="GmpSignup.questions" />{' '}
            <a href="mailto:mohsin.amir@globalmarketplaceconnect.com" className={css.gmpPanelLink}>
              <FormattedMessage id="GmpSignup.emailTeam" />
            </a>
          </p>
        ) : null}
      </div>
    </aside>
  );
};

/**
 * Account type switch, progress bar and step heading above the sign-up form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.userType current account type
 * @param {Array<string>} props.availableTypes user types configured in Console
 * @param {number} props.step current step index
 * @param {Object} props.fromState router state to keep when switching type
 * @returns {JSX.Element}
 */
export const GmpSignupHeader = props => {
  const { userType, availableTypes, step, fromState } = props;
  const steps = SIGNUP_STEPS[userType] || SIGNUP_STEPS.business;
  const total = steps.length;
  const types = SIGNUP_TYPE_ORDER.filter(t => availableTypes.includes(t));
  const pct = `${((step + 1) / total) * 100}%`;

  return (
    <div className={css.gmpSignupHeader}>
      {types.length > 1 ? (
        <nav className={css.gmpTypeSwitch} aria-label="Account type">
          {types.map(t => (
            <NamedLink
              key={t}
              name="SignupForUserTypePage"
              params={{ userType: t }}
              to={fromState ? { state: fromState } : undefined}
              className={t === userType ? css.gmpTypeTabActive : css.gmpTypeTab}
              aria-current={t === userType ? 'page' : undefined}
            >
              <FormattedMessage id={`GmpSignup.tab.${t}`} />
            </NamedLink>
          ))}
        </nav>
      ) : null}
      <div className={css.gmpStepInfo}>
        <p className={css.gmpStepCount}>
          <FormattedMessage id="GmpSignup.stepCount" values={{ step: step + 1, total }} />
        </p>
        <div
          className={css.gmpProgress}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
        >
          <div className={css.gmpProgressBar} style={{ width: pct }} />
        </div>
        <h1 className={css.gmpStepTitle}>
          <FormattedMessage id={`GmpSignup.${userType}.step${step + 1}Title`} />
        </h1>
        <p className={css.gmpStepText}>
          <FormattedMessage id={`GmpSignup.${userType}.step${step + 1}Text`} />
        </p>
      </div>
    </div>
  );
};

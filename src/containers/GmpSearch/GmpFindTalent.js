import React, { useEffect, useMemo, useState } from 'react';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { parse, stringify } from '../../util/urlHelpers';

import { Avatar, NamedLink } from '../../components';

import { COUNTRY_LABELS, ShieldIcon } from '../GmpPages/gmpShared';
import { getServiceLabels, toAgency } from '../GmpPages/GmpCards';
import { CATEGORIES } from '../GmpPages/gmpShared';

import css from './GmpFindTalent.module.css';

// Global Marketplace "Find talent" page (/s/agency-services), built from the approved
// prototype design. All approved agency listings are loaded once (up to 100) and filtered
// here, so filters respond instantly and can use the agency's country from its profile.
// Filter state is mirrored to the URL: ?keywords=…&pub_services=has_all:a,b&based_in=pakistan

const SERVICES_PARAM = 'pub_services';
const COUNTRY_PARAM = 'based_in';

const readServices = value =>
  (value || '')
    .replace(/^has_(all|any):/, '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const initialState = search => {
  const params = parse(search || '');
  return {
    q: params.keywords || '',
    services: readServices(params[SERVICES_PARAM]),
    country: params[COUNTRY_PARAM] || '',
  };
};

const initials = name =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="7" fill="none" />
    <path d="m20 20-3.5-3.5" fill="none" />
  </svg>
);

const CheckIcon = () => (
  <svg
    aria-hidden="true"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFFFFF"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 5 5 9-10" fill="none" />
  </svg>
);

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6 6 18" fill="none" />
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
    <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="none" />
    <circle cx="12" cy="10" r="2.5" fill="none" />
  </svg>
);

const FilterOption = ({ selected, onClick, label, count, round }) => (
  <button
    type="button"
    className={selected ? css.optionSelected : css.option}
    onClick={onClick}
    aria-pressed={selected ? 'true' : 'false'}
  >
    <span className={css.optionLabel}>
      <span className={round ? css.radio : css.checkbox}>
        {!round && selected ? <CheckIcon /> : null}
      </span>
      {label}
    </span>
    <span className={css.optionCount}>{count}</span>
  </button>
);

const ResultCard = ({ agency: a, index }) => {
  const params = { id: a.id, slug: a.slug };
  const hasImage = !!a.author?.profileImage?.id;
  const facts = [
    a.years
      ? {
          key: 'years',
          node: <FormattedMessage id="GmpHome.agencyYears" values={{ years: a.years }} />,
        }
      : null,
    a.team
      ? {
          key: 'team',
          node: <FormattedMessage id="GmpHome.agencyTeam" values={{ team: a.team }} />,
        }
      : null,
  ].filter(Boolean);
  return (
    <article className={css.card}>
      <div className={css.cardHead}>
        {hasImage ? (
          <Avatar className={css.cardAvatar} user={a.author} disableProfileLink />
        ) : (
          <div className={index % 2 ? css.initialsTeal : css.initialsNavy} aria-hidden="true">
            {initials(a.name)}
          </div>
        )}
        <div className={css.cardHeadText}>
          <div className={css.cardNameRow}>
            <h2 className={css.cardName}>
              <NamedLink name="ListingPage" params={params} className={css.cardNameLink}>
                {a.name}
              </NamedLink>
            </h2>
            <span className={css.vetted}>
              <ShieldIcon size={12} className={css.vettedIcon} />
              <FormattedMessage id="GmpFindTalent.vetted" />
            </span>
          </div>
          {a.location ? (
            <div className={css.cardLocation}>
              <PinIcon />
              {a.location}
            </div>
          ) : null}
        </div>
      </div>
      {a.description ? <p className={css.cardText}>{a.description}</p> : null}
      {a.services.length > 0 ? (
        <div className={css.chips}>
          {a.services.map(s => (
            <span key={s} className={css.chip}>
              {s}
            </span>
          ))}
        </div>
      ) : null}
      {facts.length > 0 ? (
        <div className={css.facts}>
          {facts.map(f => (
            <span key={f.key}>{f.node}</span>
          ))}
        </div>
      ) : null}
      <div className={css.cardActions}>
        <NamedLink name="ListingPage" params={params} className={css.outlineButton}>
          <FormattedMessage id="GmpFindTalent.viewProfile" />
        </NamedLink>
        <NamedLink name="ListingPage" params={params} className={css.primaryButton}>
          <FormattedMessage id="GmpFindTalent.sendEnquiry" />
        </NamedLink>
      </div>
    </article>
  );
};

/**
 * Find talent page body (hero, filters, results).
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.listings approved agency-services listings with authors
 * @param {boolean} props.inProgress true while agencies load
 * @param {Object} props.location router location
 * @param {Object} props.config marketplace configuration
 * @returns {JSX.Element}
 */
const GmpFindTalent = props => {
  const { listings = [], inProgress, location, config } = props;
  const intl = useIntl();
  const [state, setState] = useState(() => initialState(location?.search));
  const { q, services, country } = state;

  // Keep the address bar shareable without triggering a new data load.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = parse(window.location.search);
    const next = {
      ...current,
      keywords: q.trim() || undefined,
      [SERVICES_PARAM]: services.length ? `has_all:${services.join(',')}` : undefined,
      [COUNTRY_PARAM]: country || undefined,
      page: undefined,
    };
    Object.keys(next).forEach(k => next[k] === undefined && delete next[k]);
    const search = stringify(next);
    const url = `${window.location.pathname}${search ? `?${search}` : ''}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [q, services, country]);

  const serviceLabels = useMemo(() => getServiceLabels(config), [config]);

  const agencies = useMemo(
    () =>
      listings.map(l => {
        const a = toAgency(l, serviceLabels);
        const pd = l.attributes?.publicData || {};
        const profile = l.author?.attributes?.profile?.publicData || {};
        return {
          ...a,
          description: l.attributes?.description || '',
          serviceKeys: pd.services || [],
          country: profile.country || '',
          searchText: [
            a.name,
            l.attributes?.title,
            l.attributes?.description,
            a.services.join(' '),
            a.location,
          ]
            .join(' ')
            .toLowerCase(),
        };
      }),
    [listings, serviceLabels]
  );

  const query = q.trim().toLowerCase();
  const results = agencies.filter(
    a =>
      (!services.length || services.every(s => a.serviceKeys.includes(s))) &&
      (!country || a.country === country) &&
      (!query || a.searchText.includes(query))
  );

  const toggleService = key =>
    setState(s => ({
      ...s,
      services: s.services.includes(key)
        ? s.services.filter(x => x !== key)
        : s.services.concat([key]),
    }));
  const setCountry = c => setState(s => ({ ...s, country: s.country === c ? '' : c }));
  const clearAll = () => setState({ q: '', services: [], country: '' });

  const countries = Array.from(new Set(agencies.map(a => a.country).filter(Boolean))).sort((x, y) =>
    (COUNTRY_LABELS[x] || x).localeCompare(COUNTRY_LABELS[y] || y)
  );

  const chips = services
    .map(key => ({ key, label: serviceLabels[key] || key, remove: () => toggleService(key) }))
    .concat(
      country
        ? [
            {
              key: `c-${country}`,
              label: COUNTRY_LABELS[country] || country,
              remove: () => setCountry(country),
            },
          ]
        : []
    );

  const loading = inProgress && agencies.length === 0;

  return (
    <>
      <section className={css.hero}>
        <div className={css.heroInner}>
          <nav
            aria-label={intl.formatMessage({ id: 'GmpFindTalent.breadcrumb' })}
            className={css.breadcrumb}
          >
            <NamedLink name="LandingPage" className={css.breadcrumbLink}>
              <FormattedMessage id="GmpPages.home" />
            </NamedLink>
            {' / '}
            <span className={css.breadcrumbCurrent}>
              <FormattedMessage id="GmpFindTalent.crumb" />
            </span>
          </nav>
          <h1 className={css.heroTitle}>
            <FormattedMessage id="GmpFindTalent.title" />
          </h1>
          <form className={css.searchBox} role="search" onSubmit={e => e.preventDefault()}>
            <label htmlFor="gmp-find-talent-q" className={css.visuallyHidden}>
              <FormattedMessage id="GmpFindTalent.searchLabel" />
            </label>
            <input
              id="gmp-find-talent-q"
              type="search"
              value={q}
              onChange={e => {
                const value = e.target.value;
                setState(s => ({ ...s, q: value }));
              }}
              placeholder={intl.formatMessage({ id: 'GmpFindTalent.searchPlaceholder' })}
              className={css.searchInput}
            />
            <button type="submit" className={css.searchButton}>
              <SearchIcon />
              <FormattedMessage id="GmpFindTalent.searchButton" />
            </button>
          </form>
        </div>
      </section>

      <div className={css.layout}>
        <aside
          className={css.side}
          aria-label={intl.formatMessage({ id: 'GmpFindTalent.filters' })}
        >
          <div className={css.sideHead}>
            <h2 className={css.sideTitle}>
              <FormattedMessage id="GmpFindTalent.filters" />
            </h2>
            <button type="button" className={css.clearButton} onClick={clearAll}>
              <FormattedMessage id="GmpFindTalent.clearAll" />
            </button>
          </div>

          <fieldset className={css.fieldset}>
            <legend className={css.legend}>
              <FormattedMessage id="GmpFindTalent.service" />
            </legend>
            {CATEGORIES.map(c => (
              <FilterOption
                key={c.key}
                selected={services.includes(c.key)}
                onClick={() => toggleService(c.key)}
                label={serviceLabels[c.key] || c.label}
                count={agencies.filter(a => a.serviceKeys.includes(c.key)).length}
              />
            ))}
          </fieldset>

          {countries.length > 0 ? (
            <fieldset className={css.fieldset}>
              <legend className={css.legend}>
                <FormattedMessage id="GmpFindTalent.basedIn" />
              </legend>
              {countries.map(c => (
                <FilterOption
                  key={c}
                  round
                  selected={country === c}
                  onClick={() => setCountry(c)}
                  label={COUNTRY_LABELS[c] || c}
                  count={agencies.filter(a => a.country === c).length}
                />
              ))}
            </fieldset>
          ) : null}

          <div className={css.helpBox}>
            <span className={css.helpTitle}>
              <FormattedMessage id="GmpFindTalent.helpTitle" />
            </span>
            <span className={css.helpText}>
              <FormattedMessage id="GmpFindTalent.helpText" />
            </span>
            <NamedLink name="NewListingPage" className={css.helpLink}>
              <FormattedMessage id="GmpFindTalent.helpLink" />
            </NamedLink>
          </div>
        </aside>

        <main id="main-content" className={css.main}>
          <div className={css.toolbar}>
            <p className={css.count} aria-live="polite">
              {loading ? (
                <FormattedMessage id="GmpFindTalent.loading" />
              ) : (
                <FormattedMessage
                  id="GmpFindTalent.count"
                  values={{ count: results.length, strong: t => <strong>{t}</strong> }}
                />
              )}
            </p>
            {chips.length > 0 ? (
              <div className={css.activeChips}>
                {chips.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    className={css.activeChip}
                    onClick={c.remove}
                    aria-label={intl.formatMessage(
                      { id: 'GmpFindTalent.removeFilter' },
                      { label: c.label }
                    )}
                  >
                    {c.label}
                    <CloseIcon />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {!loading && results.length === 0 ? (
            <div className={css.empty}>
              <span className={css.emptyTitle}>
                <FormattedMessage id="GmpFindTalent.emptyTitle" />
              </span>
              <span className={css.emptyText}>
                <FormattedMessage id="GmpFindTalent.emptyText" />
              </span>
              <button type="button" className={css.emptyButton} onClick={clearAll}>
                <FormattedMessage id="GmpFindTalent.clearFilters" />
              </button>
            </div>
          ) : null}

          <div className={css.results}>
            {results.map((a, i) => (
              <ResultCard key={a.id} agency={a} index={i} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default GmpFindTalent;

import React, { useEffect, useMemo, useState } from 'react';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { parse, stringify, createSlug } from '../../util/urlHelpers';

import { NamedLink } from '../../components';

import { COUNTRY_LABELS } from '../GmpPages/gmpShared';
import { enumLabel } from '../GmpPages/GmpCards';

import css from './GmpFindTalent.module.css';
import own from './GmpBrowseProjects.module.css';

// Global Marketplace "Browse projects" page (/s/project-request), in the same design as
// Find talent. Only approved agencies and freelancers see projects: everyone else sees a
// message explaining how to get access. All open projects (up to 100) load once and are
// filtered here. URL: ?keywords=…&pub_engagement_type=…&client_in=united_kingdom

const PROVIDER_TYPES = ['agency', 'freelancer'];

/**
 * Who may see projects: signed in, approved (not pending) and an agency or freelancer.
 *
 * @param {Object} currentUser current user entity
 * @returns {string} 'allowed', 'anonymous', 'pending' or 'business'
 */
export const getProjectAccess = currentUser => {
  if (!currentUser?.id) return 'anonymous';
  if (currentUser.attributes?.state === 'pendingApproval') return 'pending';
  const userType = currentUser.attributes?.profile?.publicData?.userType;
  if (userType && !PROVIDER_TYPES.includes(userType)) return 'business';
  return 'allowed';
};

const fieldOptions = (config, key) =>
  ((config?.listing?.listingFields || []).find(f => f.key === key)?.enumOptions || []).map(o => ({
    value: o.option,
    label: o.label,
  }));

const daysAgo = createdAt => {
  if (!createdAt) return null;
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
};

const typeTone = value => {
  const v = String(value || '').toLowerCase();
  if (v.includes('hour')) return own.toneTeal;
  if (v.includes('staff') || v.includes('team') || v.includes('dedicated')) return own.toneOrange;
  return own.toneNavy;
};

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

const BuildingIcon = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" fill="none" />
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

const ProjectResult = ({ project: p }) => {
  const params = { id: p.id, slug: p.slug };
  return (
    <article className={css.card}>
      <div className={own.cardTop}>
        {p.typeLabel ? (
          <span className={`${own.typeBadge} ${typeTone(p.type)}`}>
            <span className={own.typeDot} />
            {p.typeLabel}
          </span>
        ) : (
          <span />
        )}
        {p.days != null ? (
          <span className={own.posted}>
            {p.days <= 3 ? (
              <span className={own.newTag}>
                <FormattedMessage id="GmpProjects.new" />
              </span>
            ) : null}
            <FormattedMessage id="GmpProjects.posted" values={{ days: p.days }} />
          </span>
        ) : null}
      </div>
      <h2 className={own.projectTitle}>
        <NamedLink name="ListingPage" params={params} className={css.cardNameLink}>
          {p.title}
        </NamedLink>
      </h2>
      {p.client ? (
        <div className={css.cardLocation}>
          <BuildingIcon />
          {p.client}
        </div>
      ) : null}
      {p.description ? <p className={css.cardText}>{p.description}</p> : null}
      {p.skills.length > 0 ? (
        <div className={css.chips}>
          {p.skills.map(s => (
            <span key={s} className={css.chip}>
              {s}
            </span>
          ))}
        </div>
      ) : null}
      {p.budget || p.durationLabel ? (
        <div className={own.facts}>
          {p.budget ? (
            <span className={own.fact}>
              <span className={own.factLabel}>
                <FormattedMessage id="GmpProjects.budget" />
              </span>
              <strong>{p.budget}</strong>
            </span>
          ) : null}
          {p.durationLabel ? (
            <span className={own.fact}>
              <span className={own.factLabel}>
                <FormattedMessage id="GmpProjects.duration" />
              </span>
              <strong>{p.durationLabel}</strong>
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={css.cardActions}>
        <NamedLink name="ListingPage" params={params} className={css.outlineButton}>
          <FormattedMessage id="GmpProjects.viewProject" />
        </NamedLink>
        <NamedLink name="ListingPage" params={params} className={css.primaryButton}>
          <FormattedMessage id="GmpProjects.sendProposal" />
        </NamedLink>
      </div>
    </article>
  );
};

const AccessGate = ({ access }) => {
  const key = access === 'pending' ? 'pending' : access === 'business' ? 'business' : 'anonymous';
  return (
    <div className={own.gate} role="status">
      <span className={own.gateIcon} aria-hidden="true">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" fill="none" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" />
        </svg>
      </span>
      <h2 className={own.gateTitle}>
        <FormattedMessage id={`GmpProjects.gate.${key}.title`} />
      </h2>
      <p className={own.gateText}>
        <FormattedMessage id={`GmpProjects.gate.${key}.text`} />
      </p>
      <div className={own.gateActions}>
        {key === 'anonymous' ? (
          <>
            <NamedLink name="LoginPage" className={css.primaryButton}>
              <FormattedMessage id="GmpProjects.gate.logIn" />
            </NamedLink>
            <NamedLink
              name="SignupForUserTypePage"
              params={{ userType: 'agency' }}
              className={css.outlineButton}
            >
              <FormattedMessage id="GmpProjects.gate.apply" />
            </NamedLink>
          </>
        ) : null}
        {key === 'pending' ? (
          <NamedLink name="ProfileSettingsPage" className={css.primaryButton}>
            <FormattedMessage id="GmpProjects.gate.profile" />
          </NamedLink>
        ) : null}
        {key === 'business' ? (
          <NamedLink name="NewListingPage" className={css.primaryButton}>
            <FormattedMessage id="GmpProjects.gate.post" />
          </NamedLink>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Browse projects page body (hero, filters, results, access gate).
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.listings open project-request listings with authors
 * @param {boolean} props.inProgress true while projects load
 * @param {Object} props.currentUser current user entity
 * @param {Object} props.location router location
 * @param {Object} props.config marketplace configuration
 * @returns {JSX.Element}
 */
const GmpBrowseProjects = props => {
  const { listings = [], inProgress, currentUser, location, config } = props;
  const intl = useIntl();
  const access = getProjectAccess(currentUser);
  const canSee = access === 'allowed';

  const [state, setState] = useState(() => {
    const params = parse(location?.search || '');
    return {
      q: params.keywords || '',
      types: String(params.pub_engagement_type || '')
        .replace(/^has_(all|any):/, '')
        .split(',')
        .filter(Boolean),
      country: params.client_in || '',
    };
  });
  const { q, types, country } = state;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const next = {
      ...parse(window.location.search),
      keywords: q.trim() || undefined,
      pub_engagement_type: types.length ? types.join(',') : undefined,
      client_in: country || undefined,
      page: undefined,
    };
    Object.keys(next).forEach(k => next[k] === undefined && delete next[k]);
    const search = stringify(next);
    const url = `${window.location.pathname}${search ? `?${search}` : ''}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [q, types, country]);

  const typeOptions = useMemo(() => fieldOptions(config, 'engagement_type'), [config]);

  const projects = useMemo(
    () =>
      listings
        .map(l => {
          const { title = '', description = '', publicData = {}, createdAt } = l.attributes || {};
          const profile = l.author?.attributes?.profile || {};
          const authorData = profile.publicData || {};
          const countryKey = authorData.country || '';
          const skillsRaw = publicData.skills_required;
          const skills = Array.isArray(skillsRaw)
            ? skillsRaw.map(v => enumLabel(config, 'skills_required', v))
            : String(skillsRaw || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
          const client = [profile.displayName, COUNTRY_LABELS[countryKey] || null]
            .filter(Boolean)
            .join(' · ');
          return {
            id: l.id.uuid,
            slug: createSlug(title),
            title,
            description,
            type: publicData.engagement_type || '',
            typeLabel: publicData.engagement_type
              ? enumLabel(config, 'engagement_type', publicData.engagement_type)
              : null,
            budget: publicData.budget || null,
            durationLabel: publicData.duration
              ? enumLabel(config, 'duration', publicData.duration)
              : null,
            skills: skills.slice(0, 5),
            client,
            country: countryKey,
            days: daysAgo(createdAt),
            createdAt: createdAt ? new Date(createdAt).getTime() : 0,
            searchText: [title, description, skills.join(' '), client].join(' ').toLowerCase(),
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt),
    [listings, config]
  );

  const query = q.trim().toLowerCase();
  const results = projects.filter(
    p =>
      (!types.length || types.includes(p.type)) &&
      (!country || p.country === country) &&
      (!query || p.searchText.includes(query))
  );

  const toggleType = v =>
    setState(s => ({
      ...s,
      types: s.types.includes(v) ? s.types.filter(x => x !== v) : s.types.concat([v]),
    }));
  const setCountry = c => setState(s => ({ ...s, country: s.country === c ? '' : c }));
  const clearAll = () => setState({ q: '', types: [], country: '' });

  const countries = Array.from(new Set(projects.map(p => p.country).filter(Boolean))).sort((x, y) =>
    (COUNTRY_LABELS[x] || x).localeCompare(COUNTRY_LABELS[y] || y)
  );
  const typeLabel = v => typeOptions.find(o => o.value === v)?.label || v;
  const chips = types
    .map(v => ({ key: v, label: typeLabel(v), remove: () => toggleType(v) }))
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
  const loading = inProgress && projects.length === 0;

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
              <FormattedMessage id="GmpProjects.crumb" />
            </span>
          </nav>
          <h1 className={css.heroTitle}>
            <FormattedMessage id="GmpProjects.title" />
          </h1>
          <p className={own.heroText}>
            <FormattedMessage id="GmpProjects.subtitle" />
          </p>
          {canSee ? (
            <form className={css.searchBox} role="search" onSubmit={e => e.preventDefault()}>
              <label htmlFor="gmp-projects-q" className={css.visuallyHidden}>
                <FormattedMessage id="GmpProjects.searchLabel" />
              </label>
              <input
                id="gmp-projects-q"
                type="search"
                value={q}
                onChange={e => {
                  const value = e.target.value;
                  setState(s => ({ ...s, q: value }));
                }}
                placeholder={intl.formatMessage({ id: 'GmpProjects.searchPlaceholder' })}
                className={css.searchInput}
              />
              <button type="submit" className={css.searchButton}>
                <SearchIcon />
                <FormattedMessage id="GmpFindTalent.searchButton" />
              </button>
            </form>
          ) : null}
        </div>
      </section>

      {!canSee ? (
        <div className={css.layout}>
          <AccessGate access={access} />
        </div>
      ) : (
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

            {typeOptions.length > 0 ? (
              <fieldset className={css.fieldset}>
                <legend className={css.legend}>
                  <FormattedMessage id="GmpProjects.engagement" />
                </legend>
                {typeOptions.map(o => (
                  <FilterOption
                    key={o.value}
                    selected={types.includes(o.value)}
                    onClick={() => toggleType(o.value)}
                    label={o.label}
                    count={projects.filter(p => p.type === o.value).length}
                  />
                ))}
              </fieldset>
            ) : null}

            {countries.length > 0 ? (
              <fieldset className={css.fieldset}>
                <legend className={css.legend}>
                  <FormattedMessage id="GmpProjects.clientLocation" />
                </legend>
                {countries.map(c => (
                  <FilterOption
                    key={c}
                    round
                    selected={country === c}
                    onClick={() => setCountry(c)}
                    label={COUNTRY_LABELS[c] || c}
                    count={projects.filter(p => p.country === c).length}
                  />
                ))}
              </fieldset>
            ) : null}

            <div className={css.helpBox}>
              <span className={css.helpTitle}>
                <FormattedMessage id="GmpProjects.helpTitle" />
              </span>
              <span className={css.helpText}>
                <FormattedMessage id="GmpProjects.helpText" />
              </span>
              <NamedLink name="ProfileSettingsPage" className={css.helpLink}>
                <FormattedMessage id="GmpProjects.helpLink" />
              </NamedLink>
            </div>
          </aside>

          <main id="main-content" className={css.main}>
            <div className={css.toolbar}>
              <p className={css.count} aria-live="polite">
                {loading ? (
                  <FormattedMessage id="GmpProjects.loading" />
                ) : (
                  <FormattedMessage
                    id="GmpProjects.count"
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
                  <FormattedMessage
                    id={projects.length ? 'GmpProjects.emptyTitle' : 'GmpProjects.noneTitle'}
                  />
                </span>
                <span className={css.emptyText}>
                  <FormattedMessage
                    id={projects.length ? 'GmpProjects.emptyText' : 'GmpProjects.noneText'}
                  />
                </span>
                {projects.length ? (
                  <button type="button" className={css.emptyButton} onClick={clearAll}>
                    <FormattedMessage id="GmpFindTalent.clearFilters" />
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className={css.results}>
              {results.map(p => (
                <ProjectResult key={p.id} project={p} />
              ))}
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default GmpBrowseProjects;

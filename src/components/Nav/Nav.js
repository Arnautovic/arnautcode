import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';

import useSite from 'hooks/use-site';
import useSearch, { SEARCH_STATE_LOADED } from 'hooks/use-search';
import { postPathBySlug } from 'lib/posts';
import { findMenuByLocation, MENU_LOCATION_NAVIGATION_DEFAULT } from 'lib/menus';

import Section from 'components/Section';
import NavListItem from 'components/NavListItem';

import styles from './Nav.module.scss';

const SEARCH_VISIBLE = 'visible';
const SEARCH_HIDDEN = 'hidden';

const Nav = () => {
  const formRef = useRef();
  const [searchVisibility, setSearchVisibility] = useState(SEARCH_HIDDEN);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => setMobileOpen((o) => !o);

  const { metadata = {}, menus } = useSite();
  const { title } = metadata;

  const navigationLocation =
    process.env.WORDPRESS_MENU_LOCATION_NAVIGATION ||
    MENU_LOCATION_NAVIGATION_DEFAULT;
  const navigation = findMenuByLocation(menus, navigationLocation);

  const { query, results, search, clearSearch, state } = useSearch({
    maxResults: 5,
  });
  const searchIsLoaded = state === SEARCH_STATE_LOADED;

  // Close on outside click / add keyboard nav when visible
  useEffect(() => {
    if (searchVisibility === SEARCH_HIDDEN) {
      document.body.removeEventListener('click', handleOnDocumentClick, true);
      document.body.removeEventListener('keydown', handleResultsRoving);
      return;
    }

    document.body.addEventListener('click', handleOnDocumentClick, true);
    document.body.addEventListener('keydown', handleResultsRoving);

    const searchInput = Array.from(formRef.current.elements).find(
      (input) => input.type === 'search'
    );
    searchInput.focus();

    return () => {
      document.body.removeEventListener('click', handleOnDocumentClick, true);
      document.body.removeEventListener('keydown', handleResultsRoving);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVisibility]);

  function handleOnDocumentClick(e) {
    if (!e.composedPath().includes(formRef.current)) {
      setSearchVisibility(SEARCH_HIDDEN);
      clearSearch();
    }
  }

  function handleOnSearch({ currentTarget }) {
    search({ query: currentTarget.value });
  }

  function handleOnToggleSearch() {
    setSearchVisibility(SEARCH_VISIBLE);
  }

  function handleResultsRoving(e) {
    const focusElement = document.activeElement;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (
        focusElement.nodeName === 'INPUT' &&
        focusElement.nextSibling.children[0].nodeName !== 'P'
      ) {
        focusElement.nextSibling.children[0].firstChild.firstChild.focus();
      } else if (focusElement.parentElement.nextSibling) {
        focusElement.parentElement.nextSibling.firstChild.focus();
      } else {
        focusElement.parentElement.parentElement.firstChild.firstChild.focus();
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (
        focusElement.nodeName === 'A' &&
        focusElement.parentElement.previousSibling
      ) {
        focusElement.parentElement.previousSibling.firstChild.focus();
      } else {
        focusElement.parentElement.parentElement.lastChild.firstChild.focus();
      }
    }
  }

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      clearSearch();
      setSearchVisibility(SEARCH_HIDDEN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', escFunction, false);
    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [escFunction]);

  return (
    <nav className={styles.nav}>
      <Section className={styles.navSection}>
        <p className={styles.navName}>
          <Link href="/">
            <a>
              <img
                src="/arnautcode-logo-min.svg"
                alt={`${title} logo`}
                className={styles.navLogo}
              />
            </a>
          </Link>
        </p>

        <button
          className={styles.mobileToggle}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation Arnautcode"
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`${styles.navMenu} ${mobileOpen ? styles.open : ''}`}>
          {navigation?.map((item) => (
            <NavListItem
              key={item.id}
              className={styles.navSubMenu}
              item={item}
            />
          ))}
        </ul>

        <div className={styles.navSearch}>
          {searchVisibility === SEARCH_HIDDEN ? (
            <button onClick={handleOnToggleSearch} disabled={!searchIsLoaded}>
              <span className="sr-only">Toggle Search</span>
              <FaSearch />
            </button>
          ) : (
            <form ref={formRef} action="/search" data-search-is-active={!!query}>
              <input
                type="search"
                name="q"
                value={query || ''}
                onChange={handleOnSearch}
                autoComplete="off"
                placeholder="Search..."
                required
              />
              <div className={styles.navSearchResults}>
                {results.length > 0 ? (
                  <ul>
                    {results.map(({ slug, title }, idx) => (
                      <li key={slug}>
                        <Link tabIndex={idx} href={postPathBySlug(slug)}>
                          <a>{title}</a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Sorry, not finding anything for <strong>{query}</strong>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </Section>
    </nav>
  );
};

export default Nav;

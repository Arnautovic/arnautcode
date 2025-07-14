import { getApolloClient } from 'lib/apollo-client';

import {
  QUERY_ALL_PAGES_INDEX,
  QUERY_ALL_PAGES_ARCHIVE,
  QUERY_ALL_PAGES,
  QUERY_PAGE_BY_URI,
  QUERY_PAGE_SEO_BY_URI,
} from 'data/pages';

/**
 * pagePathBySlug
 */
export function pagePathBySlug(slug) {
  return `/${slug}`;
}

/**
 * getPageByUri
 */
export async function getPageByUri(uri) {
  const apolloClient = getApolloClient();
  const apiHost = new URL(process.env.WORDPRESS_GRAPHQL_ENDPOINT).host;

  // Fetch raw page
  const { data: pageData } = await apolloClient.query({
    query: QUERY_PAGE_BY_URI,
    variables: { uri },
  });

  if (!pageData.page) {
    return { page: undefined };
  }

  const rawPage = pageData.page;

  // Map basic WP fields
  const mapped = mapPageData(rawPage);

  // Clone and override ACF fields immutably
  const acfFields = rawPage.pocetnastranafields ?? {};
  const heroImageUrl = acfFields.heroImage?.node?.sourceUrl;
  const acf = {
    ...acfFields,
    heroImage: heroImageUrl ? { sourceUrl: heroImageUrl } : {},
  };

  // Assemble final page object
  const page = {
    ...mapped,
    acf,
  };

  // SEO plugin data
  if (process.env.WORDPRESS_PLUGIN_SEO === true) {
    const { data: seoData } = await apolloClient.query({
      query: QUERY_PAGE_SEO_BY_URI,
      variables: { uri },
    });
    const { seo = {} } = seoData.page || {};

    page.metaTitle = seo.title;
    page.description = seo.metaDesc;
    page.readingTime = seo.readingTime;
    if (seo.canonical && !seo.canonical.includes(apiHost)) {
      page.canonical = seo.canonical;
    }
    page.og = {
      author: seo.opengraphAuthor,
      description: seo.opengraphDescription,
      image: seo.opengraphImage,
      modifiedTime: seo.opengraphModifiedTime,
      publishedTime: seo.opengraphPublishedTime,
      publisher: seo.opengraphPublisher,
      title: seo.opengraphTitle,
      type: seo.opengraphType,
    };
    page.robots = {
      nofollow: seo.metaRobotsNofollow,
      noindex: seo.metaRobotsNoindex,
    };
    page.twitter = {
      description: seo.twitterDescription,
      image: seo.twitterImage,
      title: seo.twitterTitle,
    };
  }

  return { page };
}

/**
 * getAllPages
 */
const allPagesIncludesTypes = {
  all: QUERY_ALL_PAGES,
  archive: QUERY_ALL_PAGES_ARCHIVE,
  index: QUERY_ALL_PAGES_INDEX,
};

export async function getAllPages(options = {}) {
  const { queryIncludes = 'index' } = options;
  const apolloClient = getApolloClient();
  const data = await apolloClient.query({
    query: allPagesIncludesTypes[queryIncludes],
  });
  const pages = data?.data.pages.edges
    .map(({ node = {} }) => node)
    .map(mapPageData);
  return { pages };
}

/**
 * getTopLevelPages
 */
export async function getTopLevelPages(options) {
  const { pages } = await getAllPages(options);
  const navPages = pages.filter(({ parent }) => parent === null);
  navPages.sort((a, b) => parseFloat(a.menuOrder) - parseFloat(b.menuOrder));
  return navPages;
}

/**
 * mapPageData
 */
export function mapPageData(page = {}) {
  const data = { ...page };
  if (data.featuredImage) data.featuredImage = data.featuredImage.node;
  if (data.parent) data.parent = data.parent.node;
  if (data.children) data.children = data.children.edges.map(({ node }) => node);
  return data;
}

/**
 * getBreadcrumbsByUri
 */
export function getBreadcrumbsByUri(uri, pages) {
  const breadcrumbs = [];
  const uriSegments = uri.split('/').filter((segment) => segment !== '');
  uriSegments.pop();
  do {
    const crumb = pages.find((page) => page.uri === `/${uriSegments.join('/')}/`);
    if (crumb) {
      breadcrumbs.push({
        id: crumb.id,
        title: crumb.title,
        uri: crumb.uri,
      });
    }
    uriSegments.pop();
  } while (uriSegments.length > 0);
  breadcrumbs.reverse();
  return breadcrumbs;
}

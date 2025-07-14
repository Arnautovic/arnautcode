import useSite from 'hooks/use-site';
import { getPaginatedPosts } from 'lib/posts';
import { WebsiteJsonLd } from 'lib/json-ld';
import { getPageByUri } from 'lib/pages';
import { getPageBySlug } from 'lib/pages';


import Layout from 'components/Layout';
import Header from 'components/Header';
import Section from 'components/Section';
import Container from 'components/Container';
import PostCard from 'components/PostCard';
import Pagination from 'components/Pagination';

import styles from 'styles/pages/Home.module.scss';

export default function Home({ posts, pagination, page }) {
  console.log('🏷️ page props:', page);
  console.log('🏷️ page.pocetna:', page?.pocetna);

  const { metadata = {} } = useSite();
  const { title, description } = metadata;
  const { title: heroTitle, text: heroText, imageUrl: heroImageUrl } = page?.pocetna || {};

  return (
    <Layout>
      <WebsiteJsonLd siteTitle={title} />
      <Header>
        <h1
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
        {heroImageUrl && <img src={heroImageUrl} alt={heroTitle} />}
        <h1>{heroTitle}</h1>
        <p>{heroText}</p>
        <p
          className={styles.description}
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </Header>

      <Section>
        <Container>
          <h2 className="sr-only">Posts</h2>
          <ul className={styles.posts}>
            {posts.map((post) => {
              return (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              );
            })}
          </ul>
          {pagination && (
            <Pagination
              addCanonical={false}
              currentPage={pagination?.currentPage}
              pagesCount={pagination?.pagesCount}
              basePath={pagination?.basePath}
            />
          )}
        </Container>
      </Section>
    </Layout>
  );
}

export async function getStaticProps() {
  const { posts, pagination } = await getPaginatedPosts({
    queryIncludes: 'archive',
  });

  let { page } = await getPageByUri('/');

  if (!page) {
    console.warn('Page "/" not found, falling back to slug "pocetna-strana"');
    const fallback = await getPageBySlug('pocetna-strana');
    ({ page } = fallback);
  }

  const cleanPage = page ? JSON.parse(JSON.stringify(page)) : null;

  return {
    props: {
      posts,
      pagination: {
        ...pagination,
        basePath: '/posts',
      },
      page: cleanPage,
    },
  };
}

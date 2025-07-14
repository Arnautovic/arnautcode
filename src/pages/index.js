import useSite from 'hooks/use-site';
//import { getPaginatedPosts } from 'lib/posts';
import { WebsiteJsonLd } from 'lib/json-ld';

import Layout from 'components/Layout';
import Header from 'components/Header';
import Section from 'components/Section';
import Container from 'components/Container';
import PostCard from 'components/PostCard';
import Pagination from 'components/Pagination';
import styles from 'styles/pages/Home.module.scss';
export * from './pages'; 
import { getPageByUri } from 'data/pages';
export async function getStaticProps() {
  const { page } = await getPageByUri('/');
  return {
    props: { page },
  };
}

export default function Home({ page, posts, pagination }) {
  const { metadata = {} } = useSite();
  const { title, description } = metadata;
  const { heroTitle, heroText } = page.acf;

  return (
    <Layout>
      <WebsiteJsonLd siteTitle={title} />
      <Header>
        {heroTitle && <h1>{heroTitle}</h1>}
        {heroText && <p>{heroText}</p>}
        <h1
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />

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

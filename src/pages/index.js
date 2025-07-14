import useSite from 'hooks/use-site';
import { getPaginatedPosts } from 'lib/posts';
import { getPageByUri } from 'lib/pages';
import { WebsiteJsonLd } from 'lib/json-ld';

import Layout from 'components/Layout';
import Header from 'components/Header';
import Section from 'components/Section';
import Container from 'components/Container';
import PostCard from 'components/PostCard';
import Pagination from 'components/Pagination';

import styles from 'styles/pages/Home.module.scss';

export default function Home({ posts, pagination, homePage }) {
  const { metadata = {} } = useSite();
  const { title, description } = metadata;

  // Povuci hero podatke iz homePage (ACF)
  const hero = homePage?.pocetnastranafields;

  return (
    <Layout>
      <WebsiteJsonLd siteTitle={title} />
      <Header>
        {hero && (
          <div className="flex flex-col items-center mb-8">
            {hero.heroImage?.node?.sourceUrl && (
              <img
                src={hero.heroImage.node.sourceUrl}
                alt="Hero"
                className="w-32 h-32 object-cover rounded-full mb-4"
              />
            )}
            <h1
              className="text-3xl font-bold text-center"
              dangerouslySetInnerHTML={{ __html: hero.heroTitle }}
            />
            <div
              className="text-lg text-center mt-2"
              dangerouslySetInnerHTML={{ __html: hero.heroText }}
            />
          </div>
        )}

        {/* Možeš izbaciti title/desc ako ne želiš duplikat */}
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
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
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
  const { page: homePage } = await getPageByUri('/pocetna-strana/');
  return {
    props: {
      posts,
      pagination: {
        ...pagination,
        basePath: '/posts',
      },
      homePage: homePage || null,
    },
  };
}

import useSite from 'hooks/use-site';
import { getPaginatedPosts } from 'lib/posts';
import { getPageByUri } from 'lib/pages';
import { WebsiteJsonLd } from 'lib/json-ld';

import Layout from 'components/Layout';
import Section from 'components/Section';
import Container from 'components/Container';
import PostCard from 'components/PostCard';
import styles from 'styles/pages/Home.module.scss';

export default function Home({ posts, homePage }) {
  const { metadata = {} } = useSite();
  const { title } = metadata;

  // Povuci hero podatke iz homePage (ACF)
  const hero = homePage?.pocetnastranafields;
  console.log('homePage:', homePage);
  console.log('hero:', homePage?.pocetnastranafields);

  return (
    <Layout>
      <WebsiteJsonLd siteTitle={title} />

      <Section>
        <Container>
          <div className={styles.okvir}>
            <div className={styles.levastrana}>
              <h1 dangerouslySetInnerHTML={{ __html: hero.heroTitle }} />
              <div dangerouslySetInnerHTML={{ __html: hero.heroText }} />
            </div>
            <div className={styles.desnastrana}>
              {hero.heroImage?.node?.sourceUrl && (<img src={hero.heroImage.node.sourceUrl} alt="Hero" />)}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className={styles.Levastrana}>Posts</h2>
          <div className={styles.posts}>
            {posts.slice(0, 3).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
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
  console.log('SSR homePage', homePage);

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

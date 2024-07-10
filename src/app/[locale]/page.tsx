import { client } from "@/lib/client";
import { notFound } from "next/navigation";
import { ArticleHero } from "@/components/contentful/ArticleHero";
import ArticleTileGrid from "@/components/contentful/ArticleTileGrid";
import { Container } from "@/components/contentful/container/Container";
import { draftMode } from "next/headers";
// Internationalization
import { locales, LocaleTypes } from "@/app/i18n/settings";
import { createTranslation } from "@/app/i18n/server";
//SEO - JSON-LD
import { Article, WithContext } from "schema-dts";
import path from "path";
import Script from "next/script";
import { Metadata, ResolvingMetadata } from "next";
// New Fields Part 9 of tutorial
import { PageBlogPostOrder } from "@/lib/__generated/sdk";
import { TextHighLight } from "@/components/contentful/TextHighLight";
import { revalidateDuration } from "@/utils/constants";
import { TagCloudSimpleHome } from "@/components/search/tagcloudsimpleHome.component";
import Link from "next/link";
import { LandingContent } from "@/components/contentful/ArticleContentLanding";

import { TableSkeleton } from "@/components/pagination/skeleton.component";
import { Suspense } from "react";

import SyntaxHighlight from "@/components/tools/syntaxhighlight/syntaxhighlight.component";

import Sitemapcounter from "@/components/tools/sitemapcounter/counter.component";
// import WordCount from "@/components/tools/wordcount/wordcount.component";
import SitemapChecker from "@/components/tools/sitemapchecker/sitemapchecker.component";
// import Slugify from "@/components/tools/slugify/slugify.component";

//Kafka
// import { consumeMessages } from "@/lib/kafkaconsmer";

export const revalidate = revalidateDuration; // revalidate at most every hour
export const dynamic = "force-dynamic";

interface PageParams {
  slug: string;
  locale: string;
}

interface SearchParamsProps {
  query?: string;
  page?: string;
}

interface PageProps {
  params: PageParams;
  searchParams?: SearchParamsProps;
}

const generateUrl = (locale: string, slug: string) => {
  if (locale === "en-US") {
    return new URL(slug, process.env.NEXT_PUBLIC_BASE_URL!).toString();
  } else {
    return new URL(locale, process.env.NEXT_PUBLIC_BASE_URL!).toString();
  }
};

const WebUrl = process.env.NEXT_PUBLIC_BASE_URL as string;

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const [PagedataSeo] = await Promise.all([
    client.pageLanding({
      slug: "/",
      locale: params.locale.toString(),
      preview: draftMode().isEnabled,
    }),
  ]);

  const landingPage = PagedataSeo.pageLandingCollection?.items[0];

  if (!landingPage) {
    return notFound();
  }

  const url = generateUrl(params.locale || "", "");

  return {
    title: landingPage.seoFields?.pageTitle,
    description: landingPage.seoFields?.pageDescription,
    metadataBase: new URL(WebUrl),
    alternates: {
      canonical: url,
      languages: {
        "en-US": "/",
        "de-DE": "/de-DE",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Example.dev - Free Tutorials and Resources for Developers",
      locale: params.locale,
      url: url || "",

      title: landingPage.seoFields?.pageTitle || undefined,
      description: landingPage.seoFields?.pageDescription || undefined,
      images: landingPage.seoFields?.shareImagesCollection?.items.map(
        (item) => ({
          url: item?.url || "",
          width: item?.width || 0,
          height: item?.height || 0,
          alt: item?.description || "",
          type: item?.contentType || "",
        })
      ),
    },
    robots: {
      follow: landingPage.seoFields?.follow || false,
      index: landingPage.seoFields?.index || false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

async function Home({ params, searchParams }: PageProps) {
  const { isEnabled } = draftMode();
  //declare JSON-LD schema
  let jsonLd: WithContext<Article> = {} as WithContext<Article>;
  const [landingPageData] = await Promise.all([
    client.pageLanding({
      slug: "/",
      locale: params.locale.toString(),
      preview: isEnabled,
    }),
  ]);

  const NUMBER_TO_FETCH = 10;

  const currentPage = Number(searchParams?.page) || 1;

  const page = landingPageData.pageLandingCollection?.items[0];

  // const handleMessage = async (message: string) => {
  //   console.log("Received message:", message);
  //   // Add your trigger logic here
  // };

  // consumeMessages("tracking", handleMessage);

  if (!page) {
    // If a blog post can't be found,
    // tell Next.js to render a 404 page.
    return notFound();
  }

  // TagCloud
  const showTagCloud = page.showTagCloud === "Yes";

  let { datanew, minSize, maxSize } = {
    datanew: [],
    minSize: 0,
    maxSize: 0,
  };

  if (showTagCloud) {
    const searchFacets = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/search/facets`,
      {}
    )
      .then((res) => res.json())
      .catch((error) => {
        console.log("No data found");
      });

    if (searchFacets) {
      maxSize = searchFacets.maxSize;
      minSize = searchFacets.minSize;
      datanew = searchFacets.datanew;
    }
  }

  const newOffset = Number(currentPage - 1) * NUMBER_TO_FETCH;

  // Getting BlogPosts
  const blogPostsData = await client.pageBlogPostCollection({
    limit: 10,
    locale: params.locale.toString(),
    skip: newOffset,
    preview: isEnabled,
    order: PageBlogPostOrder.PublishedDateDesc,
    where: {
      slug_not: page?.featuredBlogPost?.slug,
    },
  });
  const posts = blogPostsData.pageBlogPostCollection?.items;
  const postCount = blogPostsData.pageBlogPostCollection?.total;

  // Create JSON-LD schema only if blogPost is available
  if (page) {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page?.seoFields?.pageTitle || undefined,
      author: {
        "@type": "Person",
        name: page?.featuredBlogPost?.author?.name || undefined,
        // The full URL must be provided, including the website's domain.
        url: new URL(
          path.join(
            params.locale.toString() || "",
            params.slug?.toString() || ""
          ),
          process.env.NEXT_PUBLIC_BASE_URL!
        ).toString(),
      },
      publisher: {
        "@type": "Organization",
        name: "Example.dev - Free Tutorials and Resources for Developers",
        logo: {
          "@type": "ImageObject",
          url: "https://www.example.dev/favicons/icon-192x192.png",
        },
      },
      image: page?.featuredBlogPost?.featuredImage?.url || undefined,
      datePublished: page.sys.firstPublishedAt,
      dateModified: page.sys.publishedAt,
    };
  }

  // Internationalization, get the translation function
  const { t } = await createTranslation(params.locale as LocaleTypes, "common");

  const highLightHeadings: any = page.textHighlightCollection?.items[0];

  if (!page?.featuredBlogPost || !posts) return;

  return (
    <>
      {page && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      )}
      <Container className="mt-5">
        {highLightHeadings && <TextHighLight headings={highLightHeadings} />}
        {showTagCloud && datanew.length > 0 && (
          <TagCloudSimpleHome
            datanew={datanew}
            minSize={minSize * 10}
            maxSize={maxSize * 5}
            locale={params.locale.toString()}
            source={"homepage"}
          />
        )}
        <Link
          href={`/${params.locale.toString()}/${page.featuredBlogPost.slug}`}
        >
          <ArticleHero article={page.featuredBlogPost} isHomePage={true} />
        </Link>
        <div className="md:mx-24 md:my-24 sm:mx-16 sm:my-16">
          <LandingContent landing={page} />
        </div>
        <SyntaxHighlight code="let a = 1 + 4" filename="index.js" />
        <SyntaxHighlight
          code="console.log('Hello, world kajfdadjfasdjfaösdjfaskdjfakdsjfkasdjfksadjfkasdjföajdsfökajsdfökjadsfökjasdöfkjadskfjasdöfjasödfkj    akdsfjakdjfkadjsföasdjfaösfkdjö!') // [!code --]"
          lang="typescript"
          filename="index.ts"
        />
        <SyntaxHighlight
          code={`fn main() { println!(\"Hello, world!\"); } // [!code highlight]`}
          lang="rust"
          theme="github-dark"
          filename="main.rs"
        />
        <SyntaxHighlight
          code="console.log('Hello, world!') // [!code ++]"
          lang="typescript"
        />

        <SyntaxHighlight
          code={`return (// [!code ++]
  <div className="rounded-lg bg-gradient-to-r from-sky-300 to-sky-500 p-4 !pr-0 md:p-8 lg:p-12 [&>pre]:rounded-none max-w-xl">// [!code --]
    <div className="overflow-hidden rounded-s-lg">// [!code highlight]
      <div className="flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800 py-2 pl-2 pr-4 text-sm">
        <span className="-mb-[calc(0.5rem+2px)] rounded-t-lg border-2 border-white/5 border-b-neutral-700 bg-neutral-800 px-4 py-2 ">
          {filename}
        </span>
      </div>
      <div
        className="border-t-2 border-neutral-700 text-sm [&>pre]:overflow-x-auto [&>pre]:!bg-neutral-900 [&>pre]:py-3 [&>pre]:pl-4 [&>pre]:pr-5 [&>pre]:leading-snug [&_code]:block [&_code]:w-fit [&_code]:min-w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </div>
  </div>
);
`}
          lang="tsx"
          theme="ayu-dark"
          filename="app/page.tsx"
        />
      </Container>

      <Container className="my-8 md:mb-10 lg:mb-16">
        {posts.length > 0 && (
          <h2 className="mb-4 md:mb-6">{t("landingPage.latestArticles")}</h2>
        )}

        <Suspense key={currentPage} fallback={<TableSkeleton />}>
          <ArticleTileGrid
            className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            articles={posts}
            postCount={postCount}
            slug={page.featuredBlogPost.slug}
            source="loadmore"
            locale={params.locale.toString()}
          />
        </Suspense>

        {/* SitemapCounter */}
        <Sitemapcounter />
        {/* SitemapChecker */}
        {/* <SitemapChecker /> */}
        {/* WordCount */}
        {/* <WordCount /> */}
        {/* Slugify */}
        {/* <Slugify /> */}
      </Container>
    </>
  );
}

export default Home;

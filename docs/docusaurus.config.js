// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'React Native Header',
  tagline: 'A simple, yet powerful, React Native Header component library.',
  favicon: 'favicon.ico',

  // Set the production url of your site here
  url: 'https://react-native-header.codeherence.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'codeherence', // Usually your GitHub org/user name.
  projectName: 'react-native-header', // Usually your repo name.

  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'shortcut icon', href: '/favicon.ico' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/x-icon', href: '/favicon-16x16.ico', sizes: '16x16' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/x-icon', href: '/favicon-32x32.ico', sizes: '32x32' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/x-icon', href: '/favicon-96x96.ico', sizes: '96x96' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'manifest', href: '/site.webmanifest' },
    },
  ],

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/react-native-header-social-card.png',
      metadata: [
        { name: 'author', content: 'Codeherence Inc.' },
        { name: 'keywords', content: 'React Native Header, Codeherence, documentation, docs' },
      ],
      navbar: {
        title: 'React Native Header',
        logo: {
          alt: 'Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://codeherence.com',
            label: 'Work with us',
            position: 'right',
          },
          {
            'href': 'https://github.com/codeherence/react-native-header',
            'position': 'right',
            'className': 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'Example',
                to: '/docs/example',
              },
              {
                label: 'API Reference',
                to: '/docs/components/scroll-view-with-headers',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Codeherence',
                href: 'https://codeherence.com',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/aseNHjaUQB',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/codeherence',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/codeherence',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/codeherence/react-native-header',
              },
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/@codeherence/react-native-header',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Codeherence, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'ZDJCB729YA',
        apiKey: '236e9347eae6f053a9ce35a93d67d5c6',
        indexName: 'react-native-header-codeherence',
        contextualSearch: true,
        externalUrlRegex: 'external\\.com|domain\\.com',
        searchParameters: {},
        searchPagePath: 'search',
      },
    }),
};

module.exports = config;

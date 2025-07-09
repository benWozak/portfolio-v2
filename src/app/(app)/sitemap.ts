export default async function sitemap() {
  const routes = [
    '',
    '/projects',
  ];

  return routes.map((route) => ({
    url: `https://benwozak.dev${route}`,
    lastModified: new Date().toISOString(),
  }));
}
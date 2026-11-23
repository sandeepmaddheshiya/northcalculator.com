/** Renders a JSON-LD graph. JSON scripts are data blocks and are not executed (CSP-safe). */
export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

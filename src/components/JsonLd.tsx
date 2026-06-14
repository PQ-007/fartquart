// Renders a JSON-LD <script> tag. Server component — emitted into the DOM
// so crawlers see structured data without client JS.

export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    // JSON.stringify output is safe here; escape "<" to avoid breaking out of the script.
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
)

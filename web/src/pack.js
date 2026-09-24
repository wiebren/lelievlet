// A configuration in an address, after the #: its JSON deflated and written in base64url behind a
// version mark (`v1.`), about half as long as the JSON written out and without its %22 and %7B. The
// install link carries the boat this way to the app page, whose installed app starts with it. Plain
// JSON after the # is read as well, as it always was: links made before, and ones written by hand.
// A browser without CompressionStream writes the plain form.

const MARK = 'v1.';

const toBase64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64url = (text) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const through = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

/** The configuration as the text to put after the #. */
export async function packConfig(config) {
  const json = JSON.stringify(config);
  if (typeof CompressionStream === 'undefined') return encodeURIComponent(json);
  return MARK + toBase64url(await through(new TextEncoder().encode(json), new CompressionStream('deflate-raw')));
}

/** The configuration from the text after the # (with or without it): an object, or null. */
export async function unpackConfig(hash) {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;
  try {
    const json = raw.startsWith(MARK)
      ? new TextDecoder().decode(await through(fromBase64url(raw.slice(MARK.length)), new DecompressionStream('deflate-raw')))
      : decodeURIComponent(raw);
    const config = JSON.parse(json);
    return config && typeof config === 'object' && !Array.isArray(config) ? config : null;
  } catch {
    return null;
  }
}

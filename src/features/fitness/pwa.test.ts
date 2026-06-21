import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("PWA metadata", () => {
  it("defines an installable FitLog manifest", () => {
    const manifest = JSON.parse(
      readFileSync("src/app/manifest.json", "utf8"),
    ) as {
      name: string;
      short_name: string;
      display: string;
      start_url: string;
      background_color: string;
      theme_color: string;
      icons: Array<{ src: string; sizes: string; type: string }>;
    };

    assert.equal(manifest.name, "FitLog");
    assert.equal(manifest.short_name, "FitLog");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.background_color, "#0B0F14");
    assert.equal(manifest.theme_color, "#0B0F14");
    assert.deepEqual(
      manifest.icons.map((icon) => `${icon.src}:${icon.sizes}:${icon.type}`),
      [
        "/fitlog-icon-192.png:192x192:image/png",
        "/fitlog-icon-512.png:512x512:image/png",
        "/fitlog-icon-512.png:512x512:image/png",
      ],
    );
  });

  it("ships mobile home screen icons with expected dimensions", () => {
    assert.deepEqual(readPngSize("public/fitlog-icon-192.png"), {
      width: 192,
      height: 192,
    });
    assert.deepEqual(readPngSize("public/fitlog-icon-512.png"), {
      width: 512,
      height: 512,
    });
    assert.deepEqual(readPngSize("public/apple-touch-icon.png"), {
      width: 180,
      height: 180,
    });
  });

  it("ships a service worker entry for browser installability checks", () => {
    const serviceWorker = readFileSync("public/sw.js", "utf8");

    assert.match(serviceWorker, /install/);
    assert.match(serviceWorker, /activate/);
    assert.match(serviceWorker, /fetch/);
  });
});

function readPngSize(filePath: string) {
  const file = readFileSync(filePath);

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

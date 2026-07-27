import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("vatandaş ana sayfasını Kocaeli park envanteriyle sunar", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /KO-PARK/);
  assert.match(html, /57<\/strong><span>Park/);
  assert.match(html, /Hakkımızda/);
  assert.match(html, /Misyon/);
  assert.match(html, /Vizyon/);
  assert.match(html, /İlçene göre parkları incele/);
  assert.match(html, /Yetkili Girişi/);
});

test("kurumsal ve vatandaş içeriklerini ayrı sayfalarda sunar", async () => {
  for (const [path, expected] of [
    ["/parklar", "Kocaeli parkları"],
    ["/etkinlikler", "Parklarda hayat var"],
    ["/iletisim", "Vatandaş mesajı"],
    ["/hakkimizda", "HAKKIMIZDA"],
    ["/misyon", "MİSYONUMUZ"],
    ["/vizyon", "VİZYONUMUZ"],
  ]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(expected));
  }
});

test("yönetici iş akışları ilçe, park ve mesaj ayrıntısını içerir", async () => {
  const [moduleSource, authSource, dashboardSource, parkData, operationsSource, parksSource] = await Promise.all([
    readFile(new URL("../app/components/ModuleWorkspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AuthorityPortal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Dashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data/kocaeliParks.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/context/OperationsContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ParksPage.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(moduleSource, /"Arıza Kayıtları"/);
  assert.match(moduleSource, /parksForDistrict\(district\)/);
  assert.match(moduleSource, /Mesajın tamamı/);
  assert.match(authSource, /Demo yönetici paneline gir/);
  assert.match(dashboardSource, /openReportCount>0/);
  assert.match(dashboardSource, /fieldStaff\.length/);
  assert.match(dashboardSource, /pendingMaintenance\.length/);
  assert.match(moduleSource, /PDF Olarak İndir/);
  assert.match(moduleSource, /Destek talebiniz başarıyla oluşturuldu/);
  assert.match(moduleSource, /Bitiş zamanı başlangıç zamanından sonra olmalıdır/);
  assert.match(moduleSource, /Aktif göreve ata/);
  assert.match(moduleSource, /Arşiv görünümü/);
  assert.match(moduleSource, /const pageSize = 10/);
  assert.match(moduleSource, /pagedRows/);
  assert.match(moduleSource, /aria-label=\{`\$\{page\}\. sayfayı aç`\}/);
  assert.match(operationsSource, /syncStaff/);
  assert.match(parksSource, /Konuma Git/);

  for (const district of [
    "Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze",
    "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez",
  ]) {
    assert.match(parkData, new RegExp(`district:"${district}"`));
  }
});

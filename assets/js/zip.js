/* ============================================================
   AethelStudio AI — zip.js
   Pembuat ZIP murni JavaScript (metode STORE / tanpa kompresi).
   Tidak butuh library eksternal, bekerja offline.
   ============================================================ */
(function () {
  'use strict';

  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function enc(str) { return new TextEncoder().encode(str); }

  function dosTime(d) {
    return ((d.getHours() & 0x1F) << 11) | ((d.getMinutes() & 0x3F) << 5) | ((Math.floor(d.getSeconds() / 2)) & 0x1F);
  }
  function dosDate(d) {
    return (((d.getFullYear() - 1980) & 0x7F) << 9) | (((d.getMonth() + 1) & 0x0F) << 5) | (d.getDate() & 0x1F);
  }

  /**
   * Bangun ZIP dari objek { "nama/file.txt": "isi" } atau array [{name, data}]
   * @returns {Blob}
   */
  function build(input) {
    let entries;
    if (Array.isArray(input)) entries = input.map(function (e) { return { name: e.name, data: e.data }; });
    else entries = Object.keys(input || {}).map(function (k) { return { name: k, data: input[k] }; });

    const now = new Date();
    const time = dosTime(now), date = dosDate(now);
    const chunks = [];
    const central = [];
    let offset = 0;

    entries.forEach(function (e) {
      const nameBytes = enc(String(e.name).replace(/^\/+/, ''));
      const dataBytes = typeof e.data === 'string' ? enc(e.data) : (e.data instanceof Uint8Array ? e.data : enc(String(e.data)));
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const local = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, time, true);
      lv.setUint16(12, date, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);

      chunks.push(local, dataBytes);

      const cen = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(cen.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, time, true);
      cv.setUint16(14, date, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      cen.set(nameBytes, 46);
      central.push(cen);

      offset += local.length + dataBytes.length;
    });

    let centralSize = 0;
    central.forEach(function (c) { centralSize += c.length; });

    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    return new Blob(chunks.concat(central, [end]), { type: 'application/zip' });
  }

  function download(input, filename) {
    return window.Aethel.util.download(build(input), filename || 'website.zip');
  }

  window.Aethel = window.Aethel || {};
  window.Aethel.zip = { build: build, download: download, crc32: crc32 };
})();

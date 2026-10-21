// usage: osascript -l JavaScript ocr.js <dir> <minId> <shard> <nShards> <out.tsv>
ObjC.import('Foundation'); ObjC.import('Vision'); ObjC.import('AppKit');
function run(argv) {
  const [dir, minId, shard, n, out] = argv;
  const fm = $.NSFileManager.defaultManager;
  const names = ObjC.deepUnwrap(fm.contentsOfDirectoryAtPathError(dir, null)).filter(f => f.endsWith('.webp'))
    .filter(f => +f.slice(2, -5) >= +minId).sort().filter((f, i) => i % +n === +shard);
  const lines = [];
  for (const f of names) {
    const url = $.NSURL.fileURLWithPath(dir + "/" + f);
    const req = $.VNRecognizeTextRequest.alloc.init;
    req.recognitionLevel = 0; req.usesLanguageCorrection = false;
    const h = $.VNImageRequestHandler.alloc.initWithURLOptions(url, $.NSDictionary.dictionary);
    h.performRequestsError($([req]), null);
    const res = req.results, obs = [];
    for (let i = 0; i < res.count; i++) { const o = res.objectAtIndex(i), b = o.boundingBox;
      obs.push({y: b.origin.y + b.size.height / 2, x: b.origin.x, t: o.topCandidates(1).objectAtIndex(0).string.js}) }
    obs.sort((a, b) => Math.abs(a.y - b.y) > 0.01 ? b.y - a.y : a.x - b.x);
    lines.push(+f.slice(2, -5) + '\t' + obs.map(o => o.t.replace(/\t/g, ' ')).join(' | '));
  }
  $(lines.join('\n') + '\n').writeToFileAtomicallyEncodingError(out, true, $.NSUTF8StringEncoding, null);
  return names.length;
}

# usage: python3 -I tools/fetch-official.py <ids.txt | folder-html> <out.jsonl> [jeda min-max detik, default 1.5-3.5]
# folder-html: halaman detail yang disimpan manual (Cmd+S "HTML Only"), nama file memuat id, mis. 13622.html
# Ambil teks resmi kartu dari asia.pokemon-card.com/id; bisa dilanjutkan (id yang sudah ada di out dilewati).
import glob, html, json, os, random, re, sys, time, urllib.request, urllib.error

URL = 'https://asia.pokemon-card.com/id/card-search/detail/%d/'

def txt(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

def one(pat, s):
    m = re.search(pat, s, re.S)
    return m.group(1) if m else ''

def energies(s):
    return re.findall(r'/energy/(\w+)\.png', s or '')

def parse(id, page):
    main = one(r'<main[^>]*>(.*?)<div class="qaLink">', page) or one(r'<main[^>]*>(.*?)</main>', page)
    name = txt(one(r'<h1 class="pageHeader cardDetail">(.*?)</h1>', main).replace(one(r'(<span class="evolveMarker">.*?</span>)', main), ''))
    if not name:
        return None
    c = {'id': id, 'name': name, 'stage': txt(one(r'<span class="evolveMarker">(.*?)</span>', main))}
    info = one(r'<p class="mainInfomation">(.*?)</p>', main)
    if info:
        c['hp'] = txt(one(r'<span class="number">(.*?)</span>', info))
        c['type'] = energies(info)
    c['blocks'] = []
    for blk in re.findall(r'<div class="skillInformation">(.*?)(?=<div class="skillInformation">|</section>)', main, re.S):
        skills = [{'name': txt(one(r'<span class="skillName">(.*?)</span>', sk)),
                   'cost': energies(one(r'<span class="skillCost">(.*?)</span>', sk)),
                   'damage': txt(one(r'<span class="skillDamage">(.*?)</span>', sk)),
                   'effect': txt(one(r'<p class="skillEffect">(.*?)</p>', sk))}
                  for sk in re.findall(r'<div class="skill">(.*?)</div>', blk, re.S)]
        c['blocks'].append({'header': txt(one(r'<h3 class="commonHeader">(.*?)</h3>', blk)), 'skills': skills})
    for k in ('weakpoint', 'resist', 'escape'):
        cell = one(r'<td class="%s">(.*?)</td>' % k, main)
        if cell:
            c[k] = {'energy': energies(cell), 'text': txt(cell)}
    c['set'] = one(r'S_mark_Indonesia_(\w+)\.png', main) or one(r'/mark/([\w-]+)\.png', main)
    c['reg'] = txt(one(r'<span class="alpha">(.*?)</span>', main))
    c['num'] = txt(one(r'<span class="collectorNumber">(.*?)</span>', main))
    c['evolution'] = [txt(a) for a in re.findall(r'<li class="step[^"]*">(.*?)</li>', main, re.S)]
    c['dex'] = txt(one(r'<div class="extraInformation">\s*<h3>(.*?)</h3>', main))
    c['flavor'] = txt(one(r'<p class="discription">(.*?)</p>', main))
    c['illustrator'] = txt(one(r'<div class="illustrator">.*?<a[^>]*>(.*?)</a>', main))
    return c

def fetch(id):
    for attempt in range(6):
        try:
            req = urllib.request.Request(URL % id, headers={'User-Agent': 'Mozilla/5.0 (personal card index)'})
            with urllib.request.urlopen(req, timeout=30) as r:
                if r.geturl().endswith('/card-search/list/'):  # id tidak ada di situs
                    return ''
                if r.geturl() != URL % id:  # server membelokkan ke beranda = dibatasi, bukan kartu kosong
                    raise IOError('dialihkan ke ' + r.geturl())
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return ''
            err = e
        except Exception as e:
            err = e
        wait = 30 * 2 ** attempt  # mundur kalau server menolak / error jaringan
        print('id %d: %s, tunggu %ds' % (id, err, wait), file=sys.stderr, flush=True)
        time.sleep(wait)
    raise SystemExit('berhenti di id %d (gagal terus); jalankan lagi untuk melanjutkan' % id)

def main():
    ids_path, out_path = sys.argv[1], sys.argv[2]
    lo, _, hi = (sys.argv[3] if len(sys.argv) > 3 else '1.5-3.5').partition('-')  # jeda acak "min-max" detik
    lo, hi = float(lo), float(hi or lo)
    pages = {}  # id -> isi HTML yang disimpan manual, kalau argumen pertama folder
    if os.path.isdir(ids_path):
        for f in glob.glob(os.path.join(ids_path, '*.htm*')):
            m = re.search(r'\d+', os.path.basename(f))
            if m:
                pages[int(m.group())] = open(f, encoding='utf-8', errors='replace').read()
        ids = sorted(pages)
    else:
        ids = [int(x) for x in open(ids_path).read().split()]
    try:
        done = {json.loads(l)['id'] for l in open(out_path, encoding='utf-8') if l.strip()}
    except FileNotFoundError:
        done = set()
    todo = [i for i in ids if i not in done]
    print('%d sudah, %d sisa' % (len(done), len(todo)), flush=True)
    with open(out_path, 'a', encoding='utf-8') as out:
        for n, id in enumerate(todo, 1):
            if pages:
                c = parse(id, pages[id])
                if not c:  # tersimpan beranda, bukan kartu: lewati supaya bisa diulang
                    print('id %d: bukan halaman kartu, dilewati' % id, file=sys.stderr)
                    continue
                out.write(json.dumps(c, ensure_ascii=False) + '\n')
                continue
            c = parse(id, fetch(id)) or {'id': id, 'missing': True}
            out.write(json.dumps(c, ensure_ascii=False) + '\n')
            out.flush()
            if n % 50 == 0:
                print('%d/%d, istirahat 20s' % (n, len(todo)), flush=True)
                time.sleep(20)
            time.sleep(random.uniform(lo, hi))

if __name__ == '__main__':
    main()

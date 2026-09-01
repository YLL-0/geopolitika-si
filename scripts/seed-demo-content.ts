/**
 * Adds realistic-looking demo content to the CMS for previewing the site
 * layout: the 6 standard categories, a handful of tags, a few demo authors,
 * and ~9 articles (each with a small locally-generated hero image) spread
 * across those categories.
 *
 * SAFE TO RE-RUN: every record is created with a find-or-create / find-by-title
 * check first, so re-running this script only fills in whatever is still
 * missing — it never deletes or overwrites existing data.
 *
 * Always targets the Supabase database configured via DATABASE_URI in .env
 * (never a local dev DB) — see the target-check block below, which prints
 * the resolved host and aborts if it looks local.
 *
 * Run with: npx tsx scripts/seed-demo-content.ts
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// ── 1. Resolve + confirm the DB target BEFORE importing payload.config (which
//    opens the DB pool as a side effect of import). `override: true` makes the
//    .env file win over any stray DATABASE_URI already sitting in the shell
//    environment — the previous seed attempt hung for ~2h because a leftover
//    127.0.0.1:5432 value from the local PGlite dev DB shadowed .env.
dotenv.config({ path: path.resolve(dirname, '../.env'), override: true })

const rawUri = process.env.DATABASE_URI || ''
if (!rawUri) {
  console.error('✗ DATABASE_URI is not set (checked .env). Aborting.')
  process.exit(1)
}

let target: URL
try {
  target = new URL(rawUri)
} catch {
  console.error(`✗ DATABASE_URI is not a valid connection URL: ${rawUri}`)
  process.exit(1)
}

const maskedTarget = `${target.protocol}//${target.username}:****@${target.hostname}:${target.port || '5432'}${target.pathname}`
console.log(`Target database: ${maskedTarget}`)

if (target.hostname === '127.0.0.1' || target.hostname === 'localhost') {
  console.error(
    '✗ DATABASE_URI resolves to a local database (127.0.0.1/localhost). This script only ' +
      'ever targets the Supabase DB configured in .env — refusing to run against a local DB. ' +
      'Is the local PGlite dev DB (pnpm dev:db) leaking a DATABASE_URI into your shell env?',
  )
  process.exit(1)
}
if (!target.hostname.includes('supabase')) {
  console.warn(
    `⚠ Host "${target.hostname}" doesn't look like a Supabase host — double-check DATABASE_URI in .env before trusting this run.`,
  )
}
console.log('✓ Target confirmed as remote (non-local). Proceeding.\n')

// ── 2. Only now pull in payload + config (dynamic import so the pool is built
//    from the .env-confirmed DATABASE_URI above, not whatever was set at
//    process start).
const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const sharp = (await import('sharp')).default

// ── helpers ──────────────────────────────────────────────────────────────────

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms: ${label}`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer!)
  }
}

const text = (t: string) => ({
  type: 'text',
  text: t,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (t: string) => ({
  type: 'paragraph',
  children: [text(t)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  textFormat: 0,
  textStyle: '',
})

const heading = (t: string) => ({
  type: 'heading',
  tag: 'h2' as const,
  children: [text(t)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

const richText = (blocks: ReturnType<typeof paragraph | typeof heading>[]) => ({
  root: {
    type: 'root' as const,
    children: blocks,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

/** Tiny local gradient JPEG — no network fetch, so it can't hang, and it's small so upload is fast. */
async function makeImage(dirTmp: string, file: string, colors: [string, string]): Promise<string> {
  const out = path.resolve(dirTmp, file)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/>
    </linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <circle cx="600" cy="150" r="210" fill="rgba(255,255,255,0.08)"/>
    <circle cx="200" cy="380" r="150" fill="rgba(0,0,0,0.15)"/>
  </svg>`
  await sharp(Buffer.from(svg)).jpeg({ quality: 70 }).toFile(out)
  return out
}

// ── seed data ────────────────────────────────────────────────────────────────

const categories = [
  { name: 'Istorija', description: 'Zgodovinski konteksti in dediščina, ki oblikujeta današnjo geopolitiko.' },
  { name: 'Svet', description: 'Aktualne novice iz mednarodne politike.' },
  { name: 'Evropa', description: 'Dogajanje v Evropski uniji in na evropski celini.' },
  { name: 'Varnost', description: 'Obramba, varnostna politika in vojaška vprašanja.' },
  { name: 'Ekonomija', description: 'Gospodarska in trgovinska geopolitika.' },
  { name: 'Analiza', description: 'Poglobljene analize svetovnih geopolitičnih dogajanj.' },
]

const tags = [
  'Evropska unija',
  'NATO',
  'Energetika',
  'Zahodni Balkan',
  'Indo-Pacifik',
  'Varnost',
  'Hladna vojna',
  'Afrika',
]

const authors = [
  {
    name: 'Ana Novak',
    email: 'urednik@example.com',
    password: 'urednik123',
    role: 'editor' as const,
    bio: 'Urednica portala. Piše o evropski politiki in mednarodni varnosti.',
  },
  {
    name: 'Marko Kovačič',
    email: 'marko.kovacic@example.com',
    password: 'geslo1234',
    role: 'author' as const,
    bio: 'Piše o varnostni politiki in obrambnih vprašanjih.',
  },
  {
    name: 'Nina Zupan',
    email: 'nina.zupan@example.com',
    password: 'geslo1234',
    role: 'author' as const,
    bio: 'Spremlja gospodarsko in razvojno politiko ter mednarodno trgovino.',
  },
]

type SeedArticle = {
  title: string
  excerpt: string
  category: string
  tags: string[]
  authorIndex: number
  daysAgo: number
  image: { file: string; colors: [string, string]; alt: string; caption: string }
  blocks: { h?: string; p: string[] }[]
}

const articles: SeedArticle[] = [
  {
    title: 'Informbiro: kako je resolucija iz leta 1948 prekrojila Evropo',
    excerpt:
      'Sedeminsedemdeset let po sporu med Titom in Stalinom ostaja izključitev Jugoslavije iz sovjetskega bloka ključ za razumevanje današnjih delitev na celini.',
    category: 'Istorija',
    tags: ['Zahodni Balkan', 'Hladna vojna'],
    authorIndex: 0,
    daysAgo: 1,
    image: {
      file: 'informbiro-1948.jpg',
      colors: ['#241414', '#5c2a24'],
      alt: 'Ilustracija uličnega panoja z razgrnjenimi časopisi',
      caption: 'Ilustracija: obdobje razkola. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Informbiro, kratica za Informacijski biro komunističnih in delavskih partij, je bil ustanovljen leta 1947 na pobudo Sovjetske zveze kot orodje za usklajevanje politike komunističnih držav pod vodstvom Moskve. Manj kot leto pozneje je isti organ postal instrument izključitve.',
          'Resolucija iz junija 1948 je Jugoslavijo potisnila iz sovjetskega bloka in sprožila politično krizo, ki je zaznamovala celo generacijo.',
        ],
      },
      {
        h: 'Razkol, ki ni bil zgolj ideološki',
        p: [
          'V uradnih dokumentih je bil spor predstavljen kot vprašanje ideološke čistosti. V praksi je šlo za vprašanje suverenosti: kdo odloča o gospodarski politiki, o vojski in o zavezništvih majhne komunistične države na robu dveh blokov.',
          'Ta članek je vzorčna vsebina, ustvarjena za namene testiranja postavitve strani, in ne izraža stališč uredništva.',
        ],
      },
    ],
  },
  {
    title: 'Ustanovitev Gibanja neuvrščenih: Beograd 1961 in iskanje tretje poti',
    excerpt:
      'Konferenca v Beogradu leta 1961 je združila države, ki niso hotele izbrati strani v hladni vojni. Njena dediščina je vidna še danes.',
    category: 'Istorija',
    tags: ['Zahodni Balkan', 'Hladna vojna'],
    authorIndex: 1,
    daysAgo: 8,
    image: {
      file: 'neuvrsceni-1961.jpg',
      colors: ['#1d2b1e', '#3f6b3a'],
      alt: 'Abstraktna ilustracija v temno zelenih tonih',
      caption: 'Ilustracija: iskanje tretje poti med bloki. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Septembra 1961 se je v Beogradu zbralo petindvajset držav, ki so zavrnile logiko dveh blokov in namesto tega izbrale pot neuvrščenosti. Pobudniki — med njimi Jugoslavija, Indija, Egipt in Indonezija — so želeli ustvariti prostor za samostojno zunanjo politiko nekdanjih kolonij in majhnih držav.',
        ],
      },
      {
        h: 'Tretja pot med vzhodom in zahodom',
        p: [
          'Gibanje neuvrščenih ni bilo enotna ideološka fronta, temveč ohlapna koalicija držav z zelo različnimi notranjimi ureditvami, ki jih je povezovalo nasprotovanje vojaškim blokom in podpora dekolonizaciji.',
          'Danes, ko govorimo o multipolarnem svetu in željah posameznih držav, da ne bi izbirale med velesilami, se marsikatera razprava vrača prav k izkušnji neuvrščenosti — čeprav so razmere sedemdeset let pozneje seveda povsem drugačne.',
        ],
      },
    ],
  },
  {
    title: 'Indo-pacifiška enačba: zakaj bi morala Evropa gledati proti vzhodu',
    excerpt:
      'Težišče svetovne gospodarske in vojaške moči se seli v Indo-Pacifik. Evropa si ne more privoščiti, da bi ostala zgolj opazovalka.',
    category: 'Svet',
    tags: ['Indo-Pacifik', 'Varnost'],
    authorIndex: 2,
    daysAgo: 3,
    image: {
      file: 'indopacifik.jpg',
      colors: ['#0f2f2f', '#2c6e6e'],
      alt: 'Abstraktna ilustracija morja v zelenomodrih tonih',
      caption: 'Ilustracija: nova težišča svetovne moči. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Ko v Evropi govorimo o varnosti, mislimo predvsem na lastno sosesko. To je razumljivo, a kratkovidno. Pomorske poti, po katerih potuje velik del evropske trgovine, tečejo skozi vode, kjer se danes odloča o pravilih prihodnjega mednarodnega reda.',
        ],
      },
      {
        h: 'Evropski interes',
        p: [
          'Evropska prisotnost v Indo-Pacifiku ne pomeni vojaškega avanturizma, temveč zaščito lastnih interesov: prostih plovnih poti, odprtih trgov in mednarodnega prava.',
          'Ta kolumna je vzorčna vsebina, ustvarjena za namene testiranja postavitve strani, in ne izraža stališč uredništva.',
        ],
      },
    ],
  },
  {
    title: 'Afriška unija krepi vlogo na svetovnem prizorišču',
    excerpt:
      'Celina z najhitreje rastočim prebivalstvom vse glasneje zahteva mesto za pogajalsko mizo velikih svetovnih vprašanj.',
    category: 'Svet',
    tags: ['Afrika'],
    authorIndex: 0,
    daysAgo: 5,
    image: {
      file: 'afriska-unija.jpg',
      colors: ['#3d2b0f', '#a8722f'],
      alt: 'Abstraktna ilustracija v oker in rjavih tonih',
      caption: 'Ilustracija: celina na vzponu. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Afriška unija je v zadnjih letih okrepila svojo diplomatsko težo, od stalnega sedeža v skupini G20 do vse glasnejših zahtev po reformi Varnostnega sveta ZN, ki bi celini, domovanju več kot 1,4 milijarde ljudi, priznala stalno zastopanost.',
        ],
      },
      {
        h: 'Gospodarska rast kot vzvod',
        p: [
          'Vzporedno z demografsko rastjo se krepi tudi gospodarska teža celine, predvsem prek afriškega prostotrgovinskega območja, ki naj bi sčasoma povezalo enega največjih notranjih trgov na svetu.',
          'Za zunanje akterje — od Evropske unije do Kitajske in Zaliških držav — je Afrika vse manj zgolj prejemnica pomoči in vse bolj partner, za katerega naklonjenost tekmujejo.',
        ],
      },
    ],
  },
  {
    title: '»Zahodni Balkan potrebuje verodostojno evropsko perspektivo«',
    excerpt:
      'Pogovor z raziskovalko mednarodnih odnosov o širitvi EU, vplivu tretjih akterjev in prihodnosti regije.',
    category: 'Evropa',
    tags: ['Zahodni Balkan', 'Evropska unija'],
    authorIndex: 1,
    daysAgo: 2,
    image: {
      file: 'balkan.jpg',
      colors: ['#4a1d1d', '#8c3a3a'],
      alt: 'Abstraktna ilustracija v toplih rdečkastih tonih',
      caption: 'Ilustracija: regija na razpotju. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'O prihodnosti Zahodnega Balkana, zastojih v širitvenem procesu in rastočem vplivu zunanjih akterjev smo se pogovarjali z raziskovalko mednarodnih odnosov. Pogovor je vzorčna vsebina, ustvarjena ob vzpostavitvi strani.',
        ],
      },
      {
        h: 'Kje je danes širitveni proces?',
        p: [
          '»Širitev je spet na dnevnem redu, a med retoriko in dejanskim napredkom ostaja razkorak. Regija potrebuje jasne, merljive korake in vmesne koristi,« poudarja sogovornica.',
          '»Če Evropska unija verodostojne perspektive ne bo ponudila, jo bodo ponudili drugi. To je preprosta realnost geopolitične konkurence.«',
        ],
      },
    ],
  },
  {
    title: 'Razširitev schengenskega območja odpira nova vprašanja mejne politike',
    excerpt:
      'Vstop novih članic v schengenski prostor brez notranjih meja znova sproža razpravo o ravnovesju med prosto trgovino in nadzorom zunanjih meja.',
    category: 'Evropa',
    tags: ['Evropska unija'],
    authorIndex: 2,
    daysAgo: 6,
    image: {
      file: 'schengen.jpg',
      colors: ['#0d1f3d', '#2f5aa8'],
      alt: 'Abstraktna ilustracija v modrih tonih',
      caption: 'Ilustracija: meje, ki izginjajo in tiste, ki ostajajo. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Vsaka razširitev schengenskega območja pomeni ukinitev nadzora na notranjih mejah novih članic ter hkrati prenos odgovornosti za varovanje zunanje meje Unije na te iste države.',
        ],
      },
      {
        h: 'Med prostim pretokom in nadzorom',
        p: [
          'Kritiki opozarjajo, da hitrost razširitve ne sme prehiteti zmogljivosti za nadzor zunanjih meja, saj vsaka vrzel neposredno vpliva na vseh sedemindvajset članic Unije.',
          'Zagovorniki po drugi strani poudarjajo gospodarske koristi prostega pretoka blaga in ljudi, ki po njihovem mnenju odtehtajo začetne stroške prilagoditve mejne infrastrukture.',
        ],
      },
    ],
  },
  {
    title: 'Vrh zveze NATO prinesel nove zaveze o obrambnih izdatkih',
    excerpt:
      'Članice zavezništva so potrdile zvišanje ciljne ravni obrambnih izdatkov in napovedale okrepitev vzhodnega krila.',
    category: 'Varnost',
    tags: ['NATO', 'Varnost'],
    authorIndex: 1,
    daysAgo: 4,
    image: {
      file: 'nato.jpg',
      colors: ['#14213d', '#3a5a8c'],
      alt: 'Abstraktna ilustracija v temno modrih tonih s svetlimi krogi',
      caption: 'Ilustracija: zavezništvo pred novimi izzivi. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Na zadnjem vrhu zavezništva so voditelji držav članic potrdili nadaljnje zvišanje obrambnih izdatkov ter ga označili za odgovor na dolgoročno spremenjeno varnostno okolje v Evropi.',
          'Poleg finančnih zavez je vrh prinesel tudi konkretne odločitve o predpostavljenih silah na vzhodnem krilu ter o pospešeni modernizaciji zračne obrambe.',
        ],
      },
      {
        h: 'Odzivi članic',
        p: [
          'Del članic je opozoril, da bo doseganje novih ciljev zahtevalo občutne proračunske prerazporeditve. Analitiki ocenjujejo, da bo ključno vprašanje, kako hitro se zaveze prelijejo v dejanske zmogljivosti — od streliva do osebja.',
        ],
      },
    ],
  },
  {
    title: 'Skupni evropski trg pred izzivi širitve na Zahodni Balkan',
    excerpt:
      'Gospodarsko približevanje regije evropskemu trgu odpira vprašanja konkurenčnosti, subvencij in prostega pretoka kapitala.',
    category: 'Ekonomija',
    tags: ['Evropska unija', 'Zahodni Balkan'],
    authorIndex: 2,
    daysAgo: 7,
    image: {
      file: 'ekonomija.jpg',
      colors: ['#2b2a10', '#6e6a2c'],
      alt: 'Abstraktna ilustracija v oljčno zelenih in zlatih tonih',
      caption: 'Ilustracija: gospodarsko približevanje ima svojo ceno. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Vključevanje gospodarstev Zahodnega Balkana v skupni evropski trg obljublja dostop do enega največjih trgov na svetu, a hkrati zahteva prilagoditev pravil o državni pomoči, konkurenci in prostem pretoku kapitala.',
        ],
      },
      {
        h: 'Kdo nosi stroške prehoda',
        p: [
          'Za manjša gospodarstva prehod pogosto pomeni kratkoročne stroške prestrukturiranja panog, ki dolgoročno niso konkurenčne brez subvencij. Evropska komisija ta tveganja naslavlja prek predpristopnih skladov, a razprava o hitrosti in obsegu podpore ostaja odprta.',
        ],
      },
    ],
  },
  {
    title: 'Evropa med energetsko neodvisnostjo in novimi odvisnostmi',
    excerpt:
      'Prehod na obnovljive vire je Evropo osvobodil dela starih energetskih odvisnosti, a hkrati ustvaril nove — od kritičnih surovin do proizvodnih verig.',
    category: 'Analiza',
    tags: ['Evropska unija', 'Energetika'],
    authorIndex: 0,
    daysAgo: 9,
    image: {
      file: 'energetika.jpg',
      colors: ['#1e3a5f', '#b91c1c'],
      alt: 'Abstraktna ilustracija energetskega omrežja v modrih in rdečih tonih',
      caption: 'Ilustracija: energetski prehod spreminja razmerja moči. (Vzorčna slika)',
    },
    blocks: [
      {
        p: [
          'Evropska unija je v zadnjem desetletju korenito spremenila svojo energetsko sliko. Delež obnovljivih virov v proizvodnji elektrike vztrajno raste, plinska infrastruktura se je preusmerila k utekočinjenemu zemeljskemu plinu, države članice pa so pospešile načrte za jedrske in vetrne zmogljivosti.',
        ],
      },
      {
        h: 'Nove odvisnosti',
        p: [
          'Prav pri kritičnih surovinah se pokaže paradoks zelenega prehoda: stare odvisnosti od fosilnih goriv nadomeščajo nove odvisnosti od dobaviteljev surovin in predelovalnih zmogljivosti, ki so geografsko še bolj skoncentrirane.',
          'Evropski odgovor — zakonodaja o kritičnih surovinah, partnerstva s tretjimi državami in spodbude za domačo predelavo — je smiseln, a njegovi učinki bodo vidni šele čez leta.',
        ],
      },
    ],
  },
]

// ── main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Connecting to Payload (max 20s before this is treated as a hang)…')
  const payload: Payload = await withTimeout(getPayload({ config }), 20_000, 'initial Payload/DB connection')
  console.log('✓ Connected.\n')

  const { mkdir, rm } = await import('fs/promises')
  const tmpDir = path.resolve(dirname, '.seed-demo-tmp')
  await mkdir(tmpDir, { recursive: true })

  try {
    console.log('Categories:')
    const categoryIds: Record<string, number> = {}
    for (const c of categories) {
      const found = await payload.find({ collection: 'categories', where: { name: { equals: c.name } }, limit: 1 })
      if (found.docs[0]) {
        console.log(`  – ${c.name} (already exists)`)
        categoryIds[c.name] = found.docs[0].id as number
      } else {
        const doc = await payload.create({ collection: 'categories', data: c })
        console.log(`  + Created category: ${c.name}`)
        categoryIds[c.name] = doc.id as number
      }
    }

    console.log('\nTags:')
    const tagIds: Record<string, number> = {}
    for (const name of tags) {
      const found = await payload.find({ collection: 'tags', where: { name: { equals: name } }, limit: 1 })
      if (found.docs[0]) {
        console.log(`  – ${name} (already exists)`)
        tagIds[name] = found.docs[0].id as number
      } else {
        const doc = await payload.create({ collection: 'tags', data: { name } })
        console.log(`  + Created tag: ${name}`)
        tagIds[name] = doc.id as number
      }
    }

    console.log('\nAuthors:')
    const authorIds: number[] = []
    for (const a of authors) {
      const found = await payload.find({ collection: 'users', where: { email: { equals: a.email } }, limit: 1 })
      if (found.docs[0]) {
        console.log(`  – ${a.name} (already exists)`)
        authorIds.push(found.docs[0].id as number)
      } else {
        const doc = await payload.create({
          collection: 'users',
          data: { name: a.name, email: a.email, password: a.password, role: a.role, bio: a.bio },
        })
        console.log(`  + Created author: ${a.name}`)
        authorIds.push(doc.id as number)
      }
    }

    console.log(`\nArticles (${articles.length}):`)
    let created = 0
    let skipped = 0
    for (const [i, a] of articles.entries()) {
      const prefix = `  [${i + 1}/${articles.length}]`
      const existing = await payload.find({ collection: 'articles', where: { title: { equals: a.title } }, limit: 1 })
      if (existing.docs[0]) {
        console.log(`${prefix} – "${a.title}" (already exists, skipping)`)
        skipped++
        continue
      }

      console.log(`${prefix} Creating image for "${a.title}"…`)
      const imagePath = await makeImage(tmpDir, a.image.file, a.image.colors)
      const media = await withTimeout(
        payload.create({
          collection: 'media',
          data: { alt: a.image.alt, caption: a.image.caption },
          filePath: imagePath,
        }),
        20_000,
        `image upload for "${a.title}"`,
      )

      const publishedAt = new Date(Date.now() - a.daysAgo * 24 * 60 * 60 * 1000).toISOString()
      const blocks = a.blocks.flatMap((b) => [...(b.h ? [heading(b.h)] : []), ...b.p.map(paragraph)])

      await withTimeout(
        payload.create({
          collection: 'articles',
          draft: false,
          data: {
            title: a.title,
            excerpt: a.excerpt,
            body: richText(blocks),
            category: categoryIds[a.category],
            tags: a.tags.map((t) => tagIds[t]),
            author: authorIds[a.authorIndex],
            featuredImage: media.id,
            featured: false,
            publishedAt,
            _status: 'published',
          },
        }),
        20_000,
        `creating article "${a.title}"`,
      )
      console.log(`${prefix} + Created article: "${a.title}"`)
      created++
    }

    console.log(`\nDone. ${created} article(s) created, ${skipped} already existed and were skipped.`)
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✗ Seed failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  })

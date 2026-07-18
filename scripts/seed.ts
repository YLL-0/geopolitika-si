/**
 * Seeds the CMS with Slovenian starter content: categories, tags, a demo
 * editor account, sample articles with generated images, and site settings.
 * Safe to re-run — it skips anything that already exists.
 *
 * Run with: pnpm seed
 */
import 'dotenv/config'

import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// ── helpers ──────────────────────────────────────────────────────────────────

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

async function makeImage(file: string, colors: [string, string]): Promise<string> {
  const out = path.resolve(dirname, '.seed-tmp', file)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/>
    </linearGradient></defs>
    <rect width="1600" height="1000" fill="url(#g)"/>
    <circle cx="1200" cy="300" r="420" fill="rgba(255,255,255,0.08)"/>
    <circle cx="400" cy="750" r="300" fill="rgba(0,0,0,0.15)"/>
  </svg>`
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(out)
  return out
}

// ── seed data ────────────────────────────────────────────────────────────────

const categories = [
  { name: 'Analize', description: 'Poglobljene analize svetovnih geopolitičnih dogajanj.' },
  { name: 'Novice', description: 'Aktualne novice iz mednarodne politike.' },
  { name: 'Intervjuji', description: 'Pogovori s strokovnjaki za mednarodne odnose.' },
  { name: 'Kolumne', description: 'Mnenja in komentarji naših avtorjev.' },
]

const tags = ['Evropska unija', 'NATO', 'Energetika', 'Zahodni Balkan', 'Indo-Pacifik', 'Varnost']

type SeedArticle = {
  title: string
  excerpt: string
  category: string
  tags: string[]
  featured: boolean
  daysAgo: number
  image: { file: string; colors: [string, string]; alt: string; caption: string }
  blocks: { h?: string; p: string[] }[]
}

const articles: SeedArticle[] = [
  {
    title: 'Evropa med energetsko neodvisnostjo in novimi odvisnostmi',
    excerpt:
      'Prehod na obnovljive vire je Evropo osvobodil dela starih energetskih odvisnosti, a hkrati ustvaril nove — od kritičnih surovin do proizvodnih verig.',
    category: 'Analize',
    tags: ['Evropska unija', 'Energetika'],
    featured: true,
    daysAgo: 1,
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
          'A energetska neodvisnost, kot jo razumejo v Bruslju, ni zgolj vprašanje virov. Je vprašanje celotnih vrednostnih verig — od rudnikov litija in redkih zemelj do tovarn sončnih panelov in baterij.',
        ],
      },
      {
        h: 'Nove odvisnosti',
        p: [
          'Prav pri kritičnih surovinah se pokaže paradoks zelenega prehoda: stare odvisnosti od fosilnih goriv nadomeščajo nove odvisnosti od dobaviteljev surovin in predelovalnih zmogljivosti, ki so geografsko še bolj skoncentrirane.',
          'Evropski odgovor — zakonodaja o kritičnih surovinah, partnerstva s tretjimi državami in spodbude za domačo predelavo — je smiseln, a njegovi učinki bodo vidni šele čez leta. Do takrat ostaja celina ranljiva za motnje v dobavnih verigah.',
        ],
      },
      {
        h: 'Kaj to pomeni za Slovenijo',
        p: [
          'Za majhno, izvozno usmerjeno gospodarstvo, kakršno je slovensko, je ključno vprašanje cen in stabilnosti dobav. Vsaka motnja na evropskem trgu se hitro prelije v industrijo, ki predstavlja pomemben delež domače dodane vrednosti.',
        ],
      },
    ],
  },
  {
    title: 'Vrh zveze NATO prinesel nove zaveze o obrambnih izdatkih',
    excerpt:
      'Članice zavezništva so potrdile zvišanje ciljne ravni obrambnih izdatkov in napovedale okrepitev vzhodnega krila.',
    category: 'Novice',
    tags: ['NATO', 'Varnost'],
    featured: false,
    daysAgo: 2,
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
    title: '»Zahodni Balkan potrebuje verodostojno evropsko perspektivo«',
    excerpt:
      'Pogovor z raziskovalko mednarodnih odnosov o širitvi EU, vplivu tretjih akterjev in prihodnosti regije.',
    category: 'Intervjuji',
    tags: ['Zahodni Balkan', 'Evropska unija'],
    featured: false,
    daysAgo: 4,
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
          '»Širitev je spet na dnevnem redu, a med retoriko in dejanskim napredkom ostaja razkorak. Regija potrebuje jasne, merljive korake in vmesne koristi — od dostopa do skupnega trga do vključevanja v programe Unije,« poudarja sogovornica.',
          '»Če Evropska unija verodostojne perspektive ne bo ponudila, jo bodo ponudili drugi. To je preprosta realnost geopolitične konkurence.«',
        ],
      },
    ],
  },
  {
    title: 'Indo-pacifiška enačba: zakaj bi morala Evropa gledati proti vzhodu',
    excerpt:
      'Težišče svetovne gospodarske in vojaške moči se seli v Indo-Pacifik. Evropa si ne more privoščiti, da bi ostala zgolj opazovalka.',
    category: 'Kolumne',
    tags: ['Indo-Pacifik', 'Varnost'],
    featured: false,
    daysAgo: 6,
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
          'Evropska prisotnost v Indo-Pacifiku ne pomeni vojaškega avanturizma, temveč zaščito lastnih interesov: prostih plovnih poti, odprtih trgov in mednarodnega prava. Diplomatska in gospodarska orodja so pri tem enako pomembna kot varnostna.',
          'Ta kolumna je vzorčna vsebina, ustvarjena ob vzpostavitvi strani, in ne izraža stališč uredništva.',
        ],
      },
    ],
  },
]

// ── main ─────────────────────────────────────────────────────────────────────

async function seed(payload: Payload): Promise<void> {
  const existing = await payload.find({ collection: 'categories', limit: 1 })
  if (existing.totalDocs > 0) {
    payload.logger.info('Kategorije že obstajajo — seed preskočen. (Za ponoven seed izpraznite bazo.)')
    return
  }

  const { mkdir, rm } = await import('fs/promises')
  await mkdir(path.resolve(dirname, '.seed-tmp'), { recursive: true })

  payload.logger.info('Ustvarjam kategorije …')
  const categoryDocs: Record<string, number> = {}
  for (const c of categories) {
    const doc = await payload.create({ collection: 'categories', data: c })
    categoryDocs[c.name] = doc.id
  }

  payload.logger.info('Ustvarjam oznake …')
  const tagDocs: Record<string, number> = {}
  for (const name of tags) {
    const doc = await payload.create({ collection: 'tags', data: { name } })
    tagDocs[name] = doc.id
  }

  payload.logger.info('Ustvarjam uporabnike …')
  const editorEmail = 'urednik@example.com'
  const existingEditor = await payload.find({
    collection: 'users',
    where: { email: { equals: editorEmail } },
  })
  let editorId: number
  if (existingEditor.docs[0]) {
    editorId = existingEditor.docs[0].id
  } else {
    const editor = await payload.create({
      collection: 'users',
      data: {
        email: editorEmail,
        password: 'urednik123',
        name: 'Ana Novak',
        role: 'editor',
        bio: 'Urednica portala. Piše o evropski politiki in mednarodni varnosti.',
      },
    })
    editorId = editor.id
  }

  payload.logger.info('Ustvarjam članke …')
  for (const a of articles) {
    const imagePath = await makeImage(a.image.file, a.image.colors)
    const media = await payload.create({
      collection: 'media',
      data: { alt: a.image.alt, caption: a.image.caption },
      filePath: imagePath,
    })

    const publishedAt = new Date(Date.now() - a.daysAgo * 24 * 60 * 60 * 1000).toISOString()
    const blocks = a.blocks.flatMap((b) => [
      ...(b.h ? [heading(b.h)] : []),
      ...b.p.map(paragraph),
    ])

    await payload.create({
      collection: 'articles',
      draft: false,
      data: {
        title: a.title,
        excerpt: a.excerpt,
        body: richText(blocks),
        category: categoryDocs[a.category],
        tags: a.tags.map((t) => tagDocs[t]),
        author: editorId,
        featuredImage: media.id,
        featured: a.featured,
        publishedAt,
        _status: 'published',
      },
    })
  }

  payload.logger.info('Nastavljam nastavitve strani …')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Geopolitika SI',
      tagline: 'Analize in novice iz sveta geopolitike',
      footerText: 'Neodvisni portal za geopolitične analize, novice in komentarje.',
      defaultMeta: {
        title: 'Geopolitika SI — analize in novice iz sveta geopolitike',
        description:
          'Poglobljene analize, aktualne novice, intervjuji in kolumne o mednarodni politiki in varnosti.',
      },
      socialLinks: [
        { platform: 'facebook', url: 'https://www.facebook.com/' },
        { platform: 'x', url: 'https://x.com/' },
      ],
    },
  })

  await rm(path.resolve(dirname, '.seed-tmp'), { recursive: true, force: true })
  payload.logger.info('Seed končan. Urednik za demo: urednik@example.com / urednik123')
}

const payload = await getPayload({ config })
await seed(payload)
process.exit(0)

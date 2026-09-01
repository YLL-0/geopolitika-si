import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config'

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

const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root' as const,
    children: paragraphs.map(paragraph),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const articles = [
  {
    title: 'Informbiro: kako je resolucija iz leta 1948 prekrojila Evropo',
    excerpt:
      'Sedeminsedemdeset let po sporu med Titom in Stalinom ostaja izključitev Jugoslavije iz sovjetskega bloka ključ za razumevanje današnjih delitev na celini.',
    category: 'Istorija',
    featured: true,
    daysAgo: 0,
    paragraphs: [
      'Informbiro, kratica za Informacijski biro komunističnih in delavskih partij, je bil ustanovljen leta 1947 na pobudo Sovjetske zveze kot orodje za usklajevanje politike komunističnih držav pod vodstvom Moskve. Manj kot leto pozneje je isti organ postal instrument izključitve.',
      'Resolucija iz junija 1948 je Jugoslavijo potisnila iz sovjetskega bloka in sprožila politično krizo, ki je zaznamovala celo generacijo. Preganjanje domnevnih informbirojevcev je v naslednjih letih zajelo tisoče ljudi, med njimi tudi tiste, ki z Moskvo nikoli niso imeli stika.',
      'V uradnih dokumentih je bil spor predstavljen kot vprašanje ideološke čistosti. V praksi je šlo za vprašanje suverenosti: kdo odloča o gospodarski politiki, o vojski in o zavezništvih majhne komunistične države na robu dveh blokov.',
      'Ta članek je vzorčna vsebina, ustvarjena za namene testiranja postavitve strani, in ne izraža stališč uredništva.',
    ],
  },
  {
    title: 'Vrh zveze NATO prinesel nove zaveze o obrambnih izdatkih',
    excerpt:
      'Članice zavezništva so potrdile zvišanje ciljne ravni obrambnih izdatkov in napovedale okrepitev vzhodnega krila.',
    category: 'Varnost',
    featured: false,
    daysAgo: 2,
    paragraphs: [
      'Na zadnjem vrhu zavezništva so voditelji držav članic potrdili nadaljnje zvišanje obrambnih izdatkov ter ga označili za odgovor na dolgoročno spremenjeno varnostno okolje v Evropi.',
      'Del članic je opozoril, da bo doseganje novih ciljev zahtevalo občutne proračunske prerazporeditve.',
    ],
  },
  {
    title: '»Zahodni Balkan potrebuje verodostojno evropsko perspektivo«',
    excerpt: 'Pogovor o širitvi EU, vplivu tretjih akterjev in prihodnosti regije.',
    category: 'Evropa',
    featured: false,
    daysAgo: 4,
    paragraphs: [
      'O prihodnosti Zahodnega Balkana in zastojih v širitvenem procesu smo se pogovarjali z raziskovalko mednarodnih odnosov.',
      '»Širitev je spet na dnevnem redu, a med retoriko in dejanskim napredkom ostaja razkorak,« poudarja sogovornica.',
    ],
  },
  {
    title: 'Indo-pacifiška enačba: zakaj bi morala Evropa gledati proti vzhodu',
    excerpt: 'Težišče svetovne moči se seli v Indo-Pacifik.',
    category: 'Svet',
    featured: false,
    daysAgo: 6,
    paragraphs: [
      'Ko v Evropi govorimo o varnosti, mislimo predvsem na lastno sosesko. To je razumljivo, a kratkovidno.',
      'Evropska prisotnost v Indo-Pacifiku ne pomeni vojaškega avanturizma, temveč zaščito lastnih interesov.',
    ],
  },
  {
    title: 'Skupni evropski trg pred izzivi širitve na Zahodni Balkan',
    excerpt: 'Gospodarsko približevanje regije evropskemu trgu odpira vprašanja konkurenčnosti.',
    category: 'Ekonomija',
    featured: false,
    daysAgo: 3,
    paragraphs: [
      'Vključevanje gospodarstev Zahodnega Balkana v skupni evropski trg obljublja dostop do enega največjih trgov na svetu.',
      'Za manjša gospodarstva prehod pogosto pomeni kratkoročne stroške prestrukturiranja panog.',
    ],
  },
  {
    title: 'Evropa med energetsko neodvisnostjo in novimi odvisnostmi',
    excerpt: 'Prehod na obnovljive vire je Evropo osvobodil dela starih energetskih odvisnosti.',
    category: 'Analiza',
    featured: false,
    daysAgo: 1,
    paragraphs: [
      'Evropska unija je v zadnjem desetletju korenito spremenila svojo energetsko sliko.',
      'Energetska neodvisnost, kot jo razumejo v Bruslju, ni zgolj vprašanje virov, temveč celotnih vrednostnih verig.',
    ],
  },
]

const categories = [
  { name: 'Istorija', description: 'Zgodovinski konteksti in dediščina, ki oblikujeta današnjo geopolitiko.' },
  { name: 'Svet', description: 'Aktualne novice iz mednarodne politike.' },
  { name: 'Evropa', description: 'Dogajanje v Evropski uniji in na evropski celini.' },
  { name: 'Varnost', description: 'Obramba, varnostna politika in vojaška vprašanja.' },
  { name: 'Ekonomija', description: 'Gospodarska in trgovinska geopolitika.' },
  { name: 'Analiza', description: 'Poglobljene analize svetovnih geopolitičnih dogajanj.' },
]

async function main(): Promise<void> {
  const payload: Payload = await getPayload({ config })

  const existingArticles = await payload.find({ collection: 'articles', limit: 1 })
  if (existingArticles.totalDocs > 0) {
    console.log('Articles already exist, skipping.')
    process.exit(0)
  }

  for (const c of categories) {
    const found = await payload.find({ collection: 'categories', where: { name: { equals: c.name } }, limit: 1 })
    if (!found.docs[0]) {
      await payload.create({ collection: 'categories', data: c })
      console.log('Created category:', c.name)
    }
  }

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
      data: { email: editorEmail, password: 'urednik123', name: 'Ana Novak', role: 'editor' },
    })
    editorId = editor.id
  }

  for (const a of articles) {
    const cat = await payload.find({
      collection: 'categories',
      where: { name: { equals: a.category } },
      limit: 1,
    })
    const categoryId = cat.docs[0]?.id
    if (!categoryId) {
      console.log(`Category not found: ${a.category}, skipping article ${a.title}`)
      continue
    }
    const publishedAt = new Date(Date.now() - a.daysAgo * 24 * 60 * 60 * 1000).toISOString()
    await payload.create({
      collection: 'articles',
      draft: false,
      data: {
        title: a.title,
        excerpt: a.excerpt,
        body: richText(a.paragraphs),
        category: categoryId,
        author: editorId,
        featured: a.featured,
        publishedAt,
        _status: 'published',
      },
    })
    console.log('Created:', a.title)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

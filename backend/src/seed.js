// Run with: node src/seed.js
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  const songs = db.collection('songs');
  const versions = db.collection('versions');

  console.log('Seeding sample data...');

  // Clear existing sample data (optional)
  // await songs.deleteMany({});
  // await versions.deleteMany({});

  // Sample Song 1 - Public domain folk song
  const song1 = await songs.insertOne({
    title: 'Amazing Grace',
    artist: 'Traditional',
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song1.insertedId),
    teacherId: 'teacher1',
    teacherName: 'John Smith',
    content: `[G]Amazing [G7]grace, how [C]sweet the [G]sound
That [G]saved a [Em]wretch like [D]me
I [G]once was [G7]lost, but [C]now am [G]found
Was [G]blind, but [D]now I [G]see`,
    key: 'G',
    bpm: 70,
    capo: 0,
    timeSignature: '3/4',
    backingTrackUrl: null,
    youtubeUrl: 'https://www.youtube.com/watch?v=CDdvReNKKuk',
    blocks: [],
    rating: 4.5,
    ratingCount: 120,
    monetized: false,
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song1.insertedId),
    teacherId: 'teacher2',
    teacherName: 'Sarah Jones',
    content: `[D]Amazing [D7]grace, how [G]sweet the [D]sound
That [D]saved a [Bm]wretch like [A]me
I [D]once was [D7]lost, but [G]now am [D]found
Was [D]blind, but [A]now I [D]see`,
    key: 'D',
    bpm: 65,
    capo: 0,
    timeSignature: '3/4',
    backingTrackUrl: null,
    youtubeUrl: null,
    blocks: [],
    rating: 4.2,
    ratingCount: 85,
    monetized: false,
    createdAt: new Date()
  });

  // Sample Song 2 - Simple chord progression for practice
  const song2 = await songs.insertOne({
    title: 'Simple Practice Song',
    artist: 'Muses',
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song2.insertedId),
    teacherId: 'teacher1',
    teacherName: 'John Smith',
    content: `[Intro]
[Am] [F] [C] [G]

[Verse]
[Am]This is a [F]simple song
[C]To help you [G]practice along
[Am]Strum each [F]chord in time
[C]And you'll be [G]doing fine

[Chorus]
[F]Practice [C]makes [G]perfect
[F]Keep on [C]strumming [G]away

[Tab - Intro Riff]
e|---0---1---0---3---|
B|---1---1---1---0---|
G|---2---2---0---0---|
D|---2---3---2---0---|
A|---0---3---3---2---|
E|-------1-------3---|`,
    key: 'Am',
    bpm: 100,
    capo: 0,
    timeSignature: '4/4',
    backingTrackUrl: null,
    youtubeUrl: null,
    blocks: [
      { type: 'tabs', beatStart: 0, beatEnd: 8, data: [
        'e|---0---1---0---3---|',
        'B|---1---1---1---0---|',
        'G|---2---2---0---0---|',
        'D|---2---3---2---0---|',
        'A|---0---3---3---2---|',
        'E|-------1-------3---|'
      ]},
      { type: 'lyrics', beatStart: 8, beatEnd: 24, data: '[Am]This is a [F]simple song\n[C]To help you [G]practice along' }
    ],
    rating: 4.8,
    ratingCount: 200,
    monetized: false,
    createdAt: new Date()
  });

  // Sample Song 3 - Rock style
  const song3 = await songs.insertOne({
    title: 'Rock Basics',
    artist: 'Muses',
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song3.insertedId),
    teacherId: 'teacher3',
    teacherName: 'Mike Wilson',
    content: `[Intro - Power Chords]
[E5] [A5] [D5] [A5]

[Verse]
[E5]Power chords are [A5]easy to play
[D5]Just two fingers [A5]all the way
[E5]Root and fifth is [A5]all you need
[D5]Rock and roll at [A5]full speed

[Chorus]
[B5]Rock it [A5]out
[E5]Let it [D5]shout`,
    key: 'E',
    bpm: 140,
    capo: 0,
    timeSignature: '4/4',
    backingTrackUrl: null,
    youtubeUrl: null,
    blocks: [],
    rating: 4.6,
    ratingCount: 150,
    monetized: false,
    createdAt: new Date()
  });

  // Sample Song 4 - Fingerpicking pattern
  const song4 = await songs.insertOne({
    title: 'Peaceful Arpeggios',
    artist: 'Muses',
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song4.insertedId),
    teacherId: 'teacher2',
    teacherName: 'Sarah Jones',
    content: `[Intro]
[Am] [Em] [F] [C]

[Verse]
[Am]Gentle notes are [Em]flowing free
[F]Like a river [C]to the sea
[Am]Let your fingers [Em]dance and play
[F]Music brightens [C]every day

[Fingerpicking Pattern]
e|---0-------0-------1-------0---|
B|-----1-------0-------1-------1-|
G|-------2-------0-------2-------|
D|---------2-------2-------2-----|
A|---0-----------------------3---|
E|-----------0-------1-----------|`,
    key: 'Am',
    bpm: 80,
    capo: 0,
    timeSignature: '4/4',
    backingTrackUrl: null,
    youtubeUrl: null,
    blocks: [
      { type: 'tabs', beatStart: 0, beatEnd: 8, data: [
        'e|---0-------0-------1-------0---|',
        'B|-----1-------0-------1-------1-|',
        'G|-------2-------0-------2-------|',
        'D|---------2-------2-------2-----|',
        'A|---0-----------------------3---|',
        'E|-----------0-------1-----------|'
      ]}
    ],
    rating: 4.7,
    ratingCount: 95,
    monetized: false,
    createdAt: new Date()
  });

  // Sample Song 5 - Blues shuffle
  const song5 = await songs.insertOne({
    title: 'Twelve Bar Blues',
    artist: 'Muses',
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song5.insertedId),
    teacherId: 'teacher3',
    teacherName: 'Mike Wilson',
    content: `[Intro - Shuffle Feel]
[A7] / / / | [A7] / / / |

[Verse 1 - 12 Bar Pattern]
[A7]Woke up this morning, [A7]feeling the blues
[A7]Woke up this morning, [A7]got nothing to lose
[D7]Playing my guitar, [D7]paying my dues
[A7]Just strumming along, [A7]singing the blues
[E7]Life keeps on rolling, [D7]making its moves
[A7]But music heals me, [E7]that's the truth

[Turnaround Lick]
e|-------------------------|
B|-------------------------|
G|---2-0-------------------|
D|-------2-0---------------|
A|-----------2-0-----------|
E|---------------3-0-------|`,
    key: 'A',
    bpm: 100,
    capo: 0,
    timeSignature: '4/4',
    backingTrackUrl: null,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    blocks: [
      { type: 'lyrics', beatStart: 0, beatEnd: 48, data: '[A7]Woke up this morning, [A7]feeling the blues\n[D7]Playing my guitar, [D7]paying my dues' },
      { type: 'tabs', beatStart: 48, beatEnd: 56, data: [
        'e|-------------------------|',
        'B|-------------------------|',
        'G|---2-0-------------------|',
        'D|-------2-0---------------|',
        'A|-----------2-0-----------|',
        'E|---------------3-0-------|'
      ]}
    ],
    rating: 4.9,
    ratingCount: 210,
    monetized: false,
    createdAt: new Date()
  });

  // Sample Song 6 - Folk song with capo
  const song6 = await songs.insertOne({
    title: 'Mountain Sunrise',
    artist: 'Muses',
    createdAt: new Date()
  });

  await versions.insertOne({
    songId: String(song6.insertedId),
    teacherId: 'teacher1',
    teacherName: 'John Smith',
    content: `[Intro]
[G] [Cadd9] [Em7] [D]

[Verse 1]
[G]Up on the mountain, [Cadd9]watching the light
[Em7]Colors are painting the [D]sky so bright
[G]Morning is breaking, [Cadd9]peace all around
[Em7]Nature is singing a [D]beautiful sound

[Chorus]
[C]Rise with the [G]sun
[Am]A new day has [D]begun
[C]Let your spirit [Em]fly
[D]Reaching for the [G]sky

[Bridge]
[Am]Life is a journey, [Em]take it slow
[C]Enjoy each moment, [D]let love grow`,
    key: 'G',
    bpm: 95,
    capo: 2,
    timeSignature: '4/4',
    backingTrackUrl: null,
    youtubeUrl: null,
    blocks: [],
    rating: 4.4,
    ratingCount: 78,
    monetized: false,
    createdAt: new Date()
  });

  // Add an alternate version for Mountain Sunrise
  await versions.insertOne({
    songId: String(song6.insertedId),
    teacherId: 'teacher2',
    teacherName: 'Sarah Jones',
    content: `[Intro]
[D] [A] [Bm] [G]

[Verse 1]
[D]Up on the mountain, [A]watching the light
[Bm]Colors are painting the [G]sky so bright
[D]Morning is breaking, [A]peace all around
[Bm]Nature is singing a [G]beautiful sound

[Chorus]
[G]Rise with the [D]sun
[Em]A new day has [A]begun
[G]Let your spirit [Bm]fly
[A]Reaching for the [D]sky`,
    key: 'D',
    bpm: 90,
    capo: 0,
    timeSignature: '4/4',
    backingTrackUrl: null,
    youtubeUrl: null,
    blocks: [],
    rating: 4.6,
    ratingCount: 62,
    monetized: false,
    createdAt: new Date()
  });

  console.log('Seeded 6 songs with 8 versions');
  await client.close();
}

seed().catch(console.error);

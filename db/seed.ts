import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as schema from './schema';

config({ path: '.env' });

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

type ComicJson = {
  id: string;
  name: string;
  pic_url: string | null;
  city: string | null;
  social_media: number | null;
  class: 'A' | 'B' | 'C' | 'S' | null;
  time: number | null;
};

function loadComics(): (typeof schema.comicsTable.$inferInsert)[] {
  const path = join(process.cwd(), 'comics.json');
  const raw = readFileSync(path, 'utf-8');
  const data: ComicJson[] = JSON.parse(raw);

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    picUrl: c.pic_url,
    city: c.city,
    socialMedia: c.social_media,
    class: c.class,
    time: c.time,
  }));
}

async function seed() {
  console.log('🌱 Seeding database...');
  console.log(`📍 Using DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 40)}...`);

  const comics = loadComics();

  if (comics.length === 0) {
    console.log('⚠️  No comics to seed. Check comics.json');
    process.exit(0);
  }

  console.log(`📝 Inserting ${comics.length} comics...`);

  const result = await db
    .insert(schema.comicsTable)
    .values(comics)
    .onConflictDoNothing()
    .returning({ id: schema.comicsTable.id, name: schema.comicsTable.name });

  console.log(`✅ Inserted ${result.length} new comics`);

  if (result.length < comics.length) {
    console.log(`ℹ️  ${comics.length - result.length} comics already existed (skipped)`);
  }

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});

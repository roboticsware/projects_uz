import 'dotenv/config'
import { createClient } from '@libsql/client'

async function check() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  })

  try {
    const rs = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
    console.log("Current Tables in DB:", rs.rows)
  } catch (e) {
    console.error("Connection Failed:", e)
  }
}

check()

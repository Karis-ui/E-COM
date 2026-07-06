# test_connection.py

import asyncio
import asyncpg

async def test():
    try:
        conn = await asyncpg.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password='Mankaloko',
            database='ktech_production'
        )
        print("✅ Connected to PostgreSQL successfully!")
        
        result = await conn.fetch("SELECT 1 as test")
        print(f"Test query result: {result}")
        
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test())
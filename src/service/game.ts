import { Redis } from 'ioredis';

class GameService {
  private redisClient: Redis;

  constructor(redisUrl: string) {
    this.redisClient = new Redis(redisUrl);
  }

  async checkConnection() {
    return this.redisClient.ping();
  }

  async recordGameResult(userId: string, result: number): Promise<void> {
    const key = `user:${userId}:games`;
    await this.redisClient.lpush(key, result);
    await this.redisClient.ltrim(key, 0, 2);
  }

  async checkForWin(userId: string): Promise<boolean> {
    const results = await this.redisClient.lrange(`user:${userId}:games`, 0, 2);

    // Проверяем, одинаковые ли все 3 числа
    return results.length === 3 && new Set(results).size === 1;
  }
}

export default GameService;

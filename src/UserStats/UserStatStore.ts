import { Db } from 'mongodb';
import { COLLECTIONS } from '../drivers/MongoDriver';
import { UserStatDatastore, UserStats } from './UserStatsInteractor';

export class UserStatStore implements UserStatDatastore {
  constructor(private db: Db) {}

  /**
   * Fetches stats for User accounts
   *
   * @param {{ query: any }} params
   * @returns {Promise<UserStats>}
   * @memberof UserStatStore
   */
  async fetchStats(params: { query: any }): Promise<UserStats> {
    const statCursor = await this.db
      .collection(COLLECTIONS.User.name)
      .aggregate([
        { $match: params.query },
        {
          $group: {
            _id: 1,
            count: { $sum: 1 },
            organizations: { $addToSet: '$organization' }
          }
        }
      ]);
    const statsArr: {
      _id: string;
      count: number;
      organizations: string[];
    }[] = await statCursor.toArray();
    let stats: UserStats;
    if (statsArr && statsArr.length) {
      stats = {
        accounts: statsArr[0].count,
        organizations: statsArr[0].organizations.length
      };
    }
    return stats;
  }
}

export interface UserStats {
  accounts: number;
  organizations: number;
}
export interface UserStatDatastore {
  fetchStats(params: { query: any }): Promise<UserStats>;
}

export async function getStats(params: {
  dataStore: UserStatDatastore;
  query: any;
}): Promise<UserStats> {
  const stats = await params.dataStore.fetchStats({ query: params.query });
  return stats;
}

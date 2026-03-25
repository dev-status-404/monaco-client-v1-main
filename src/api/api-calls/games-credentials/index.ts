import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios";

const gamesCredentialsApi = {
  /**
   * Get credentials for a specific game
   */
  getCredentials: (params: any) => {
    return api.get(apiEndpoints.game_creds.getAll(params));
  },

  /**
   * Create game credentials
   */
  createCredential: (payload: {
    game_id: string;
    user_id?: string;
    username?: string;
    email?: string;
    password?: string;
    token?: string;
    note?: string;
  }) => {
    return api.post(apiEndpoints.game_creds.create, payload);
  },

  /**
   * Update existing credentials
   */
  updateCredential: (
    credentialId: string,
    payload: Partial<{
      username: string;
      email: string;
      password: string;
      token: string;
      status: string;
      note: string;
    }>,
  ) => {
    return api.patch(
      apiEndpoints.game_creds.update(credentialId),
      payload,
    );
  },

  assignCredential: (payload: {
    game_id: string;
    user_id: string;
    assigned_by_admin_id: string;
  }) => {
    return api.post(apiEndpoints.game_creds.assign, payload);
  },

  /**
   * Delete credentials
   */
  deleteCredential: (credentialId: string) => {
    return api.delete(
      apiEndpoints.game_creds.delete(credentialId),
    );
  },
};

export default gamesCredentialsApi;
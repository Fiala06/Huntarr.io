// User-related types
export interface User {
  username: string;
  is_2fa_enabled: boolean;
}

// App connection types
export interface AppConnection {
  name: string;
  api_url: string;
  api_key: string;
  enabled: boolean;
}

export interface AppSettings {
  api_url?: string;
  api_key?: string;
  hunt_missing?: number;
  hunt_upgrades?: number;
  interval_minutes?: number;
  monitored_only?: boolean;
  skip_future_episodes?: boolean;
  skip_future_releases?: boolean;
  random_missing?: boolean;
  random_upgrades?: boolean;
  debug_mode?: boolean;
  api_timeout?: number;
  command_wait_delay?: number;
  command_wait_attempts?: number;
  minimum_download_queue_size?: number;
  instances?: AppConnection[];
}

export interface AppStats {
  hunted: number;
  upgraded: number;
}

export interface AllStats {
  sonarr: AppStats;
  radarr: AppStats;
  lidarr: AppStats;
  readarr: AppStats;
  whisparr: AppStats;
}

export interface GeneralSettings {
  timezone: string;
  dark_mode: boolean;
  auto_update: boolean;
}

export interface AllSettings {
  sonarr: AppSettings;
  radarr: AppSettings;
  lidarr: AppSettings;
  readarr: AppSettings;
  whisparr: AppSettings;
  general: GeneralSettings;
}

// Setup and authentication types
export interface SetupData {
  username: string;
  password: string;
  confirm_password: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  qr_code_url: string;
  secret: string;
  error?: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

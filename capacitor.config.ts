
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e79cb4d6f26c47af9478fe890d6eccb6',
  appName: 'medi-alert-buddy',
  webDir: 'dist',
  server: {
    url: 'https://e79cb4d6-f26c-47af-9478-fe890d6eccb6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;

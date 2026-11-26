// Backend address (the app never talks to Claude directly and never holds an AI key).
//  - Android emulator:  http://10.0.2.2:3000
//  - iOS simulator:     http://localhost:3000
//  - Physical phone:    http://<your-computer-LAN-IP>:3000   (set EXPO_PUBLIC_API_URL)
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

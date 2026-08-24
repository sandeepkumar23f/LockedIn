🚀 NativeWind Setup with Expo
1. Install NativeWind and Peer Dependencies


You need nativewind plus its peer dependencies.

npm install nativewind react-native-reanimated react-native-safe-area-context
npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo


2. Setup Tailwind CSS
Run:
npx tailwindcss init
Update tailwind.config.js to include all files that use NativeWind classes:


js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
3. Create a CSS File
At the project root, create global.css:

css
@tailwind base;
@tailwind components;
@tailwind utilities;
4. Babel Config
Update babel.config.js:

js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
5. Metro Config
Create or edit metro.config.js:

js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });


6. Import CSS
In your entry file (app/index.tsx):

tsx
import { Text, View } from "react-native";
import "../global.css";


7. Modify app.json
Switch the bundler to Metro:

json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}



8. TypeScript Setup (Optional)


If you’re using TypeScript, create nativewind-env.d.ts:

ts
/// <reference types="nativewind/types" /> 


export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-green-500">
      <Text className="text-white text-lg font-bold">
        🎉 NativeWind is working!
      </Text>
    </View>
  );
}
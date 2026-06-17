# Fonts

Drop your `.ttf` / `.otf` font files here, e.g.:

```
assets/fonts/
  Inter-Regular.ttf
  Inter-Medium.ttf
  Inter-SemiBold.ttf
  Inter-Bold.ttf
```

Then load them in your root layout with `expo-font`:

```ts
import { useFonts } from "expo-font"

const [loaded] = useFonts({
  "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
  "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
  "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
})
```

Update `src/theme/tokens.ts > typography.family` to reference the loaded family names.

The build does not reference any font files by default, so the project compiles
cleanly even when this folder only contains this README.

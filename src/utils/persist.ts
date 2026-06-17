import AsyncStorage from "@react-native-async-storage/async-storage"
import { createJSONStorage } from "zustand/middleware"

/** Shared zustand persistence backed by AsyncStorage. */
export const zustandStorage = createJSONStorage(() => AsyncStorage)

// src/components/ui/Loading/useLoading.ts
import { useState } from "react";

export const useLoadingLogic = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return { isLoading, startLoading, stopLoading };
};

// src/components/feature/RatingToolbar/useRatingtoolbarLogic.tsx
import { useState } from "react";

// src/components/feature/RatingToolbar/useRatingtoolbar.tsx
export const useRatingToolbarLogic = () => {
  const [thumbsUpPressed, setThumbsUpPressed] = useState(false);
  const [thumbsDownPressed, setThumbsDownPressed] = useState(false);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);

  const handleThumbsUpClick = () => {
    console.log("Thumbs up clicked");
    setThumbsUpPressed(true);
    setShowDetailedFeedback(true);
  };

  const handleThumbsDownClick = () => {
    console.log("Thumbs down clicked");
    setThumbsDownPressed(true);
    setShowDetailedFeedback(true);
  };


  return {
    thumbsUpPressed,
    thumbsDownPressed,
    handleThumbsUpClick,
    handleThumbsDownClick,
    showDetailedFeedback,
    setShowDetailedFeedback
  };
};
